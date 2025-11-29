import bcrypt from 'bcryptjs'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { connectDB } from './lib/db/mongoose'
import User from './lib/models/User'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        await connectDB()
        const user = await User.findOne({ email: credentials.email })

        if (!user) {
          return null
        }

        // Check if user has a password (not an OAuth user)
        if (!user.password) {
          return null
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.password)

        if (!isValid) {
          return null
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Allow credentials login
      if (account?.provider === 'credentials') {
        return true
      }

      // Handle Google OAuth
      if (account?.provider === 'google') {
        await connectDB()

        // Check if user exists in database
        const existingUser = await User.findOne({ email: user.email })

        if (!existingUser) {
          // Reject sign-in for users not in the system
          // Only existing staff/manager/admin can sign in via Google
          return false
        }

        // Add user ID and role to the user object
        user.id = existingUser._id.toString()
        user.role = existingUser.role

        return true
      }

      return false
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }

      // For Google OAuth, ensure we have the role
      if (account?.provider === 'google' && !token.role) {
        await connectDB()
        const dbUser = await User.findOne({ email: token.email })
        if (dbUser) {
          token.id = dbUser._id.toString()
          token.role = dbUser.role
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/access-denied',
  },
  session: {
    strategy: 'jwt',
  },
})
