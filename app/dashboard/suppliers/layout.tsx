import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Suppliers - NextGen IMS',
  description: 'Manage your supplier contacts, information, and relationships.',
}

export default function SuppliersLayout({ children }: { children: React.ReactNode }) {
  return children
}
