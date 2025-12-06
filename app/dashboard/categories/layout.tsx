import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Categories - NextGen IMS',
  description: 'Organize products with categories for better inventory management.',
}

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return children
}
