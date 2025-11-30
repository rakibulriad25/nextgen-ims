'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  submitForApproval,
  approvePurchaseOrder,
  rejectPurchaseOrder,
  markAsOrdered,
  cancelPurchaseOrder,
  closePurchaseOrder,
} from '@/lib/actions/purchase-order'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Package,
  Printer,
  Truck,
  User,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { GoodsReceiptDialog } from './goods-receipt-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500',
  'pending-approval': 'bg-yellow-500',
  approved: 'bg-blue-500',
  ordered: 'bg-purple-500',
  'partially-received': 'bg-orange-500',
  received: 'bg-green-500',
  closed: 'bg-slate-500',
  cancelled: 'bg-red-500',
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  'pending-approval': 'Pending Approval',
  approved: 'Approved',
  ordered: 'Ordered',
  'partially-received': 'Partially Received',
  received: 'Received',
  closed: 'Closed',
  cancelled: 'Cancelled',
}

interface PurchaseOrderDetailProps {
  purchaseOrder: {
    _id: string
    poNumber: string
    supplier: { name: string; email: string; phone: string; address: string }
    status: string
    orderDate: string
    expectedDeliveryDate: string
    actualDeliveryDate?: string
    totalAmount: number
    notes?: string
    items: {
      product: string
      productName: string
      sku: string
      quantity: number
      unitPrice: number
      totalPrice: number
      receivedQuantity: number
    }[]
    createdBy: { name: string; email: string }
    approvedBy?: { name: string; email: string }
    approvedAt?: string
    cancellationReason?: string
  }
  userRole: string
}

export function PurchaseOrderDetail({ purchaseOrder, userRole }: PurchaseOrderDetailProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [rejectReason, setRejectReason] = useState('')

  const canApprove = userRole === 'admin' || userRole === 'manager'

  const handleSubmitForApproval = async () => {
    setLoading(true)
    const result = await submitForApproval(purchaseOrder._id)
    if (result.success) {
      toast.success('Purchase order submitted for approval')
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to submit for approval')
    }
    setLoading(false)
  }

  const handleApprove = async () => {
    setLoading(true)
    const result = await approvePurchaseOrder(purchaseOrder._id)
    if (result.success) {
      toast.success('Purchase order approved')
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to approve purchase order')
    }
    setLoading(false)
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }
    setLoading(true)
    const result = await rejectPurchaseOrder(purchaseOrder._id, rejectReason)
    if (result.success) {
      toast.success('Purchase order rejected')
      setRejectDialogOpen(false)
      setRejectReason('')
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to reject purchase order')
    }
    setLoading(false)
  }

  const handleMarkAsOrdered = async () => {
    setLoading(true)
    const result = await markAsOrdered(purchaseOrder._id)
    if (result.success) {
      toast.success('Purchase order marked as ordered')
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to mark as ordered')
    }
    setLoading(false)
  }

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation')
      return
    }
    setLoading(true)
    const result = await cancelPurchaseOrder(purchaseOrder._id, cancelReason)
    if (result.success) {
      toast.success('Purchase order cancelled')
      setCancelDialogOpen(false)
      setCancelReason('')
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to cancel purchase order')
    }
    setLoading(false)
  }

  const handleClose = async () => {
    setLoading(true)
    const result = await closePurchaseOrder(purchaseOrder._id)
    if (result.success) {
      toast.success('Purchase order closed')
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to close purchase order')
    }
    setLoading(false)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/purchase-orders">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Purchase Orders
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{purchaseOrder.poNumber}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={statusColors[purchaseOrder.status]}>
                {statusLabels[purchaseOrder.status]}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>

          {purchaseOrder.status === 'draft' && (
            <Button onClick={handleSubmitForApproval} disabled={loading}>
              Submit for Approval
            </Button>
          )}

          {purchaseOrder.status === 'pending-approval' && canApprove && (
            <>
              <Button variant="outline" onClick={() => setRejectDialogOpen(true)} disabled={loading}>
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button onClick={handleApprove} disabled={loading}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </>
          )}

          {purchaseOrder.status === 'approved' && (
            <Button onClick={handleMarkAsOrdered} disabled={loading}>
              <Truck className="h-4 w-4 mr-2" />
              Mark as Ordered
            </Button>
          )}

          {(purchaseOrder.status === 'ordered' || purchaseOrder.status === 'partially-received') && (
            <Button onClick={() => setReceiveDialogOpen(true)}>
              <Package className="h-4 w-4 mr-2" />
              Receive Goods
            </Button>
          )}

          {(purchaseOrder.status === 'received' || purchaseOrder.status === 'partially-received') && canApprove && (
            <Button onClick={handleClose} disabled={loading}>
              Close PO
            </Button>
          )}

          {purchaseOrder.status !== 'closed' &&
            purchaseOrder.status !== 'cancelled' &&
            purchaseOrder.status !== 'received' &&
            canApprove && (
              <Button variant="destructive" onClick={() => setCancelDialogOpen(true)} disabled={loading}>
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Truck className="h-5 w-5" />
              Supplier Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="font-semibold">{purchaseOrder.supplier.name}</p>
            </div>
            <div className="text-gray-600">
              <p>{purchaseOrder.supplier.email}</p>
              <p>{purchaseOrder.supplier.phone}</p>
              <p className="mt-1">{purchaseOrder.supplier.address}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-5 w-5" />
              Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="text-gray-600">Order Date</p>
              <p className="font-medium">{format(new Date(purchaseOrder.orderDate), 'MMM dd, yyyy')}</p>
            </div>
            <div>
              <p className="text-gray-600">Expected Delivery</p>
              <p className="font-medium">{format(new Date(purchaseOrder.expectedDeliveryDate), 'MMM dd, yyyy')}</p>
            </div>
            {purchaseOrder.actualDeliveryDate && (
              <div>
                <p className="text-gray-600">Actual Delivery</p>
                <p className="font-medium">{format(new Date(purchaseOrder.actualDeliveryDate), 'MMM dd, yyyy')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5" />
              Created By
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="font-semibold">{purchaseOrder.createdBy.name}</p>
              <p className="text-gray-600">{purchaseOrder.createdBy.email}</p>
            </div>
            {purchaseOrder.approvedBy && (
              <div className="pt-2 border-t">
                <p className="text-gray-600">Approved By</p>
                <p className="font-medium">{purchaseOrder.approvedBy.name}</p>
                {purchaseOrder.approvedAt && (
                  <p className="text-xs text-gray-500">
                    {format(new Date(purchaseOrder.approvedAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Order Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">SKU</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Product</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Ordered Qty</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Received Qty</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Unit Price</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrder.items.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-3 text-sm text-gray-600">{item.sku}</td>
                    <td className="px-4 py-3 text-sm font-medium">{item.productName}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={item.receivedQuantity >= item.quantity ? 'text-green-600 font-medium' : ''}>
                        {item.receivedQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {formatCurrency(item.totalPrice)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t bg-gray-50">
                  <td colSpan={5} className="px-4 py-3 text-right font-semibold">
                    Total Amount:
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-lg">
                    {formatCurrency(purchaseOrder.totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {purchaseOrder.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{purchaseOrder.notes}</p>
          </CardContent>
        </Card>
      )}

      {purchaseOrder.cancellationReason && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-base text-red-800">Cancellation Reason</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-700">{purchaseOrder.cancellationReason}</p>
          </CardContent>
        </Card>
      )}

      <GoodsReceiptDialog
        open={receiveDialogOpen}
        onOpenChange={setReceiveDialogOpen}
        purchaseOrder={purchaseOrder}
      />

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Purchase Order</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for cancelling this purchase order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="cancelReason">Cancellation Reason</Label>
            <Input
              id="cancelReason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason..."
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} disabled={loading}>
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Purchase Order</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this purchase order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="rejectReason">Rejection Reason</Label>
            <Input
              id="rejectReason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason..."
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject} disabled={loading}>
              Confirm Rejection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
