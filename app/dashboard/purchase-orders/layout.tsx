import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Purchase Orders - NextGen IMS',
  description: 'Create and manage purchase orders, track order status and deliveries.',
}

export default function PurchaseOrdersLayout({ children }: { children: React.ReactNode }) {
  return children
}
