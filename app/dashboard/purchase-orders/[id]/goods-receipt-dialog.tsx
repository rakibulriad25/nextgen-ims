'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { receiveGoods } from '@/lib/actions/purchase-order'
import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface GoodsReceiptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  purchaseOrder: {
    _id: string
    poNumber: string
    items: {
      product: string
      productName: string
      sku: string
      quantity: number
      receivedQuantity: number
    }[]
  }
}

export function GoodsReceiptDialog({
  open,
  onOpenChange,
  purchaseOrder,
}: GoodsReceiptDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState(
    purchaseOrder.items.map((item) => ({
      product: item.product,
      productName: item.productName,
      sku: item.sku,
      orderedQuantity: item.quantity,
      previouslyReceived: item.receivedQuantity,
      receivedQuantity: Math.max(0, item.quantity - item.receivedQuantity),
      itemNotes: '',
    }))
  )

  const updateItemQuantity = (index: number, quantity: number) => {
    const newItems = [...items]
    const maxAllowed = newItems[index].orderedQuantity - newItems[index].previouslyReceived
    newItems[index].receivedQuantity = Math.min(Math.max(0, quantity), maxAllowed)
    setItems(newItems)
  }

  const updateItemNotes = (index: number, notes: string) => {
    const newItems = [...items]
    newItems[index].itemNotes = notes
    setItems(newItems)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const itemsToReceive = items.filter((item) => item.receivedQuantity > 0)

    if (itemsToReceive.length === 0) {
      toast.error('Please enter received quantities for at least one item')
      return
    }

    setLoading(true)
    const result = await receiveGoods({
      purchaseOrder: purchaseOrder._id,
      items: itemsToReceive.map((item) => ({
        product: item.product,
        orderedQuantity: item.orderedQuantity,
        receivedQuantity: item.receivedQuantity,
        notes: item.itemNotes,
      })),
      receivedDate: new Date(receivedDate),
      notes,
    })

    if (result.success) {
      toast.success('Goods received successfully')
      onOpenChange(false)
      router.refresh()
      // Reset form
      setNotes('')
      setItems(
        purchaseOrder.items.map((item) => ({
          product: item.product,
          productName: item.productName,
          sku: item.sku,
          orderedQuantity: item.quantity,
          previouslyReceived: item.receivedQuantity,
          receivedQuantity: Math.max(0, item.quantity - item.receivedQuantity),
          itemNotes: '',
        }))
      )
    } else {
      toast.error(result.error || 'Failed to receive goods')
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Receive Goods - {purchaseOrder.poNumber}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="receivedDate">Received Date</Label>
            <Input
              id="receivedDate"
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label>Items to Receive</Label>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium">Product</th>
                    <th className="px-4 py-2 text-center text-sm font-medium">Ordered</th>
                    <th className="px-4 py-2 text-center text-sm font-medium">
                      Previously Received
                    </th>
                    <th className="px-4 py-2 text-center text-sm font-medium">Pending</th>
                    <th className="px-4 py-2 text-center text-sm font-medium">Receive Now</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const pending = item.orderedQuantity - item.previouslyReceived
                    return (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium">{item.productName}</p>
                            <p className="text-xs text-gray-500">{item.sku}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-sm">{item.orderedQuantity}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600">
                          {item.previouslyReceived}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-medium">
                          <span className={pending > 0 ? 'text-orange-600' : 'text-green-600'}>
                            {pending}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min="0"
                            max={pending}
                            value={item.receivedQuantity}
                            onChange={(e) =>
                              updateItemQuantity(index, Number.parseInt(e.target.value))
                            }
                            className="w-24 mx-auto"
                            disabled={pending === 0}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Item Notes (Optional)</Label>
            {items.map((item, index) => (
              <div key={index} className="space-y-1">
                <Label className="text-sm text-gray-600">{item.productName}</Label>
                <Input
                  placeholder="Add notes for this item (e.g., damage, discrepancies)..."
                  value={item.itemNotes}
                  onChange={(e) => updateItemNotes(index, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">General Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any general notes about this delivery..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Receiving...' : 'Receive Goods'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
