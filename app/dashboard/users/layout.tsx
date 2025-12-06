import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Users - NextGen IMS',
  description: 'Manage user accounts, roles, and access permissions.',
}

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return children
}
