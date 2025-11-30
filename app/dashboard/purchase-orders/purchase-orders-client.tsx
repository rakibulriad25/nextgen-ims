'use client'

import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createColumns, type PurchaseOrder } from './columns'
import { PurchaseOrderDialog } from './purchase-order-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PurchaseOrdersClientProps {
  purchaseOrders: PurchaseOrder[]
}

export function PurchaseOrdersClient({ purchaseOrders }: PurchaseOrdersClientProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const handleView = (po: PurchaseOrder) => {
    router.push(`/dashboard/purchase-orders/${po._id}`)
  }

  const columns = createColumns(handleView)

  const filteredPurchaseOrders = statusFilter === 'all'
    ? purchaseOrders
    : purchaseOrders.filter(po => po.status === statusFilter)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">Manage purchase orders and track deliveries</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Purchase Order
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filter by status:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending-approval">Pending Approval</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="ordered">Ordered</SelectItem>
              <SelectItem value="partially-received">Partially Received</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {filteredPurchaseOrders.length} of {purchaseOrders.length} purchase orders
        </div>
      </div>

      <DataTable columns={columns} data={filteredPurchaseOrders} />

      <PurchaseOrderDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
