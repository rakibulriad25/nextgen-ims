import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Transactions - NextGen IMS',
  description: 'Track stock movements, inventory transactions, and audit history.',
}

export default function TransactionsLayout({ children }: { children: React.ReactNode }) {
  return children
}
