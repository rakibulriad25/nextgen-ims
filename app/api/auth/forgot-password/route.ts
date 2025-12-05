import { connectDB } from '@/lib/db/mongoose'
import { sendPasswordResetEmail } from '@/lib/email'
import User from '@/lib/models/User'
import crypto from 'node:crypto'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    await connectDB()
    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { message: 'If the email exists, a password reset link has been sent' },
        { status: 200 }
      )
    }

    if (!user.password) {
      return NextResponse.json(
        { error: 'This account uses OAuth login. Please sign in with Google.' },
        { status: 400 }
      )
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    user.resetPasswordToken = hashedToken
    user.resetPasswordExpires = new Date(Date.now() + 3600000) // 1 hour
    await user.save()

    await sendPasswordResetEmail(email, resetToken)

    return NextResponse.json(
      { message: 'If the email exists, a password reset link has been sent' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
