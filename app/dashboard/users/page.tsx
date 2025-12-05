import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { UsersClient } from './users-client'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'User Management - NextGen IMS',
  description: 'Manage user accounts, roles, and permissions for your inventory management system.',
}

export default async function UsersPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Check if user has permission to access this page
  if (session.user.role === 'staff') {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Unauthorized</h1>
          <p className="text-gray-500 mt-2">You do not have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <UsersClient userRole={session.user.role} />
}
