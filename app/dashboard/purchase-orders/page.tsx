import { getPurchaseOrders } from '@/lib/actions/purchase-order'
import { PurchaseOrdersClient } from './purchase-orders-client'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Purchase Orders - NextGen IMS',
  description: 'Create, approve, and track purchase orders with multi-stage workflows and receipt management.',
}

export default async function PurchaseOrdersPage() {
  const purchaseOrders = await getPurchaseOrders()

  return <PurchaseOrdersClient purchaseOrders={purchaseOrders} />
}
