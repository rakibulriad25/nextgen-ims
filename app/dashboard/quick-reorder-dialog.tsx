'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createPurchaseOrder } from '@/lib/actions/purchase-order'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

interface QuickReorderProduct {
  _id: string
  name: string
  sku: string
  currentStock: number
  reorderLevel: number
  costPrice: number
  supplier: {
    _id: string
    name: string
  }
}

interface QuickReorderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: QuickReorderProduct[]
}

interface ReorderItem {
  product: QuickReorderProduct
  quantity: number
  unitPrice: number
}

export function QuickReorderDialog({
  open,
  onOpenChange,
  products,
}: QuickReorderDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<ReorderItem[]>([])

  useEffect(() => {
    if (open && products.length > 0) {
      // Group products by supplier and initialize items
      const itemsMap = new Map<string, ReorderItem[]>()

      products.forEach((product) => {
        const supplierId = product.supplier._id
        if (!itemsMap.has(supplierId)) {
          itemsMap.set(supplierId, [])
        }

        // Calculate suggested quantity (difference between reorder level and current stock)
        const suggestedQty = Math.max(1, product.reorderLevel - product.currentStock)

        itemsMap.get(supplierId)?.push({
          product,
          quantity: suggestedQty,
          unitPrice: product.costPrice || 0,
        })
      })

      // For now, handle only single supplier (take first supplier's items)
      const firstSupplierItems = Array.from(itemsMap.values())[0] || []
      setItems(firstSupplierItems)

      // Set default delivery date to 7 days from now
      const defaultDate = new Date()
      defaultDate.setDate(defaultDate.getDate() + 7)
      setExpectedDeliveryDate(defaultDate.toISOString().split('T')[0])
    }
  }, [open, products])

  const updateItem = (index: number, field: 'quantity' | 'unitPrice', value: number) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      toast.error('No items to reorder')
      return
    }

    if (!expectedDeliveryDate) {
      toast.error('Please select expected delivery date')
      return
    }

    // Get supplier from first product
    const supplierId = items[0].product.supplier._id

    setLoading(true)
    const result = await createPurchaseOrder({
      supplier: supplierId,
      items: items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      expectedDeliveryDate: new Date(expectedDeliveryDate),
      notes: notes || `Quick reorder for low stock items`,
    })

    if (result.success) {
      toast.success('Purchase order created successfully')
      onOpenChange(false)
      router.refresh()
      // Navigate to the new PO
      if (result.id) {
        router.push(`/dashboard/purchase-orders/${result.id}`)
      }
      // Reset form
      setExpectedDeliveryDate('')
      setNotes('')
      setItems([])
    } else {
      toast.error(result.error || 'Failed to create purchase order')
    }
    setLoading(false)
  }

  if (items.length === 0 && open) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Reorder</DialogTitle>
          </DialogHeader>
          <p className="text-gray-500">No products selected for reorder</p>
        </DialogContent>
      </Dialog>
    )
  }

  const supplierName = items.length > 0 ? items[0].product.supplier.name : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick Reorder - {supplierName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="expectedDeliveryDate">Expected Delivery Date *</Label>
            <Input
              id="expectedDeliveryDate"
              type="date"
              value={expectedDeliveryDate}
              onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label>Products to Reorder</Label>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium">Product</th>
                    <th className="px-4 py-2 text-center text-sm font-medium">Current Stock</th>
                    <th className="px-4 py-2 text-center text-sm font-medium">Reorder Level</th>
                    <th className="px-4 py-2 text-center text-sm font-medium">Quantity</th>
                    <th className="px-4 py-2 text-right text-sm font-medium">Unit Price</th>
                    <th className="px-4 py-2 text-right text-sm font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium">{item.product.name}</p>
                          <p className="text-xs text-gray-500">{item.product.sku}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-red-600 font-medium">
                        {item.product.currentStock}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {item.product.reorderLevel}
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', Number.parseInt(e.target.value))}
                          className="w-24 mx-auto"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', Number.parseFloat(e.target.value))}
                          className="w-28 ml-auto text-right"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-right">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t bg-gray-50">
                    <td colSpan={5} className="px-4 py-3 text-right font-semibold">Total Amount:</td>
                    <td className="px-4 py-3 font-bold text-lg text-right">{formatCurrency(totalAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Purchase Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
