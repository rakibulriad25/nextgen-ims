'use server'

import { auth } from '@/auth'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { connectDB } from '../db/mongoose'
import User from '../models/User'

export async function getUsers() {
  try {
    const session = await auth()

    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    await connectDB()

    let users
    if (session.user.role === 'admin') {
      // Admin can see all managers and staff
      users = await User.find({ role: { $in: ['manager', 'staff'] } })
        .select('-password')
        .lean()
    } else if (session.user.role === 'manager') {
      // Manager can only see staff
      users = await User.find({ role: 'staff' }).select('-password').lean()
    } else {
      return { error: 'Unauthorized' }
    }

    return {
      users: users.map((u) => ({
        _id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt.toISOString(),
      })),
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    return { error: 'Failed to fetch users' }
  }
}

export async function createUser(data: {
  name: string
  email: string
  password: string
  role: 'manager' | 'staff'
}) {
  try {
    const session = await auth()

    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    // Check permissions
    if (session.user.role === 'manager' && data.role !== 'staff') {
      return { error: 'Managers can only create staff users' }
    }

    if (session.user.role === 'staff') {
      return { error: 'Unauthorized' }
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email })
    if (existingUser) {
      return { error: 'User with this email already exists' }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
    })

    revalidatePath('/dashboard/users')
    return { success: true, userId: user._id.toString() }
  } catch (error) {
    console.error('Error creating user:', error)
    return { error: 'Failed to create user' }
  }
}

export async function updateUser(
  id: string,
  data: {
    name?: string
    email?: string
    password?: string
    role?: 'manager' | 'staff'
  },
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    await connectDB()

    const user = await User.findById(id)
    if (!user) {
      return { error: 'User not found' }
    }

    // Check permissions
    if (session.user.role === 'manager' && user.role !== 'staff') {
      return { error: 'Managers can only update staff users' }
    }

    if (session.user.role === 'manager' && data.role && data.role !== 'staff') {
      return { error: 'Managers can only manage staff users' }
    }

    if (session.user.role === 'staff') {
      return { error: 'Unauthorized' }
    }

    // Update fields
    if (data.name) user.name = data.name
    if (data.email) user.email = data.email
    if (data.role) user.role = data.role
    if (data.password) {
      user.password = await bcrypt.hash(data.password, 10)
    }

    await user.save()

    revalidatePath('/dashboard/users')
    return { success: true }
  } catch (error) {
    console.error('Error updating user:', error)
    return { error: 'Failed to update user' }
  }
}

export async function deleteUser(id: string) {
  try {
    const session = await auth()

    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    await connectDB()

    const user = await User.findById(id)
    if (!user) {
      return { error: 'User not found' }
    }

    // Check permissions
    if (session.user.role === 'manager' && user.role !== 'staff') {
      return { error: 'Managers can only delete staff users' }
    }

    if (session.user.role === 'staff') {
      return { error: 'Unauthorized' }
    }

    await User.findByIdAndDelete(id)

    revalidatePath('/dashboard/users')
    return { success: true }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { error: 'Failed to delete user' }
  }
}
