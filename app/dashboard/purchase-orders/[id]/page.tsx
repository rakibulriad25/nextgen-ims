import { getPurchaseOrder } from '@/lib/actions/purchase-order'
import { notFound } from 'next/navigation'
import { PurchaseOrderDetail } from './purchase-order-detail'
import { auth } from '@/auth'

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
