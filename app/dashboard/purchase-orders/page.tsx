import { getPurchaseOrders } from '@/lib/actions/purchase-order'
import { PurchaseOrdersClient } from './purchase-orders-client'

export default async function PurchaseOrdersPage() {
  const purchaseOrders = await getPurchaseOrders()

  return <PurchaseOrdersClient purchaseOrders={purchaseOrders} />
}
