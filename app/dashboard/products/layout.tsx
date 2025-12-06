import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Products - NextGen IMS',
  description: 'Manage your product inventory, stock levels, pricing, and product details.',
}

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children
}
