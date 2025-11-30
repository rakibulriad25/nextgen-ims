'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getProducts } from '@/lib/actions/product'
import { getSuppliers } from '@/lib/actions/supplier'
import { createPurchaseOrder } from '@/lib/actions/purchase-order'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

interface PurchaseOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface POItem {
  product: string
  productName: string
  quantity: number
  unitPrice: number
}

export function PurchaseOrderDialog({ open, onOpenChange }: PurchaseOrderDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<{ _id: string; name: string }[]>([])
  const [products, setProducts] = useState<{ _id: string; name: string; costPrice: number; sku: string }[]>([])
  const [supplier, setSupplier] = useState('')
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<POItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  const loadData = async () => {
    const [sups, prodsResult] = await Promise.all([getSuppliers(), getProducts()])
    setSuppliers(sups.filter((s: { status: string }) => s.status === 'active'))
    const prods = prodsResult.success ? prodsResult.products : []
    setProducts(prods.filter((p: { status: string }) => p.status === 'active'))
  }

  const addItem = () => {
    if (!selectedProduct) {
      toast.error('Please select a product')
      return
    }

    const product = products.find(p => p._id === selectedProduct)
    if (!product) return

    // Check if product already added
    if (items.find(item => item.product === selectedProduct)) {
      toast.error('Product already added')
      return
    }

    setItems([...items, {
      product: selectedProduct,
      productName: product.name,
      quantity: 1,
      unitPrice: product.costPrice || 0,
    }])
    setSelectedProduct('')
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: 'quantity' | 'unitPrice', value: number) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!supplier) {
      toast.error('Please select a supplier')
      return
    }

    if (!expectedDeliveryDate) {
      toast.error('Please select expected delivery date')
      return
    }

    if (items.length === 0) {
      toast.error('Please add at least one product')
      return
    }

    setLoading(true)
    const result = await createPurchaseOrder({
      supplier,
      items: items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      expectedDeliveryDate: new Date(expectedDeliveryDate),
      notes,
    })

    if (result.success) {
      toast.success('Purchase order created successfully')
      onOpenChange(false)
      router.refresh()
      // Reset form
      setSupplier('')
      setExpectedDeliveryDate('')
      setNotes('')
      setItems([])
    } else {
      toast.error(result.error || 'Failed to create purchase order')
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Select value={supplier} onValueChange={setSupplier}>
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((sup) => (
                    <SelectItem key={sup._id} value={sup._id}>
                      {sup.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
          </div>

          <div className="space-y-2">
            <Label>Products</Label>
            <div className="flex gap-2">
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select product to add" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((prod) => (
                    <SelectItem key={prod._id} value={prod._id}>
                      {prod.name} ({prod.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>

          {items.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium">Product</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Quantity</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Unit Price</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Total</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2 text-sm">{item.productName}</td>
                      <td className="px-4 py-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', Number.parseInt(e.target.value))}
                          className="w-24"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', Number.parseFloat(e.target.value))}
                          className="w-32"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm font-medium">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </td>
                      <td className="px-4 py-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t bg-gray-50">
                    <td colSpan={3} className="px-4 py-2 text-right font-semibold">Total Amount:</td>
                    <td className="px-4 py-2 font-bold text-lg">{formatCurrency(totalAmount)}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes or instructions..."
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
