import { getPurchaseOrder } from '@/lib/actions/purchase-order'
import { notFound } from 'next/navigation'
import { PurchaseOrderDetail } from './purchase-order-detail'
import { auth } from '@/auth'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const purchaseOrder = await getPurchaseOrder(id)

  return {
    title: purchaseOrder ? `PO ${purchaseOrder.poNumber} - NextGen IMS` : 'Purchase Order - NextGen IMS',
    description: purchaseOrder ? `View and manage purchase order ${purchaseOrder.poNumber}` : 'Purchase order details',
  }
}

export default async function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const purchaseOrder = await getPurchaseOrder(id)
  const session = await auth()

  if (!purchaseOrder) {
    notFound()
  }

  return <PurchaseOrderDetail purchaseOrder={purchaseOrder} userRole={session?.user?.role || 'staff'} />
}
