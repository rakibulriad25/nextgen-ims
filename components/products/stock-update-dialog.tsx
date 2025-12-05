'use client'

import { Badge } from '@/components/ui/badge'
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
import { Textarea } from '@/components/ui/textarea'
import { createTransaction } from '@/lib/actions/transaction'
import { transactionSchema } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'

type TransactionForm = z.infer<typeof transactionSchema>

interface StockUpdateDialogProps {
  open: boolean
  onClose: () => void
  product: {
    _id: string
    name: string
    currentStock: number
  } | null
  onSuccess: () => void
}

export function StockUpdateDialog({ open, onClose, product, onSuccess }: StockUpdateDialogProps) {
  const [loading, setLoading] = useState(false)
  const [reasonSuggestions, setReasonSuggestions] = useState<string[]>([])
  const [aiLoading, setAiLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      transactionType: 'stock-in',
      product: product?._id || '',
    },
  })

  useEffect(() => {
    if (product?._id) {
      setValue('product', product._id)
    }
  }, [product, setValue])

  useEffect(() => {
    if (open) {
      fetchReasonSuggestions('stock-in')
    }
  }, [open])

  const fetchReasonSuggestions = async (type: string) => {
    setAiLoading(true)
    try {
      const response = await fetch('/api/ai/suggest-reasons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionType: type }),
      })
      const data = await response.json()
      if (data.suggestions) {
        setReasonSuggestions(data.suggestions)
      }
    } catch {
      console.error('Failed to fetch reason suggestions')
    } finally {
      setAiLoading(false)
    }
  }

  const transactionType = watch('transactionType')
  const quantity = watch('quantity')

  const calculateNewStock = () => {
    if (!product || !quantity) return product?.currentStock || 0

    switch (transactionType) {
      case 'stock-in':
        return product.currentStock + quantity
      case 'stock-out':
        return product.currentStock - quantity
      case 'adjustment':
        return quantity
      default:
        return product.currentStock
    }
  }

  const onSubmit = async (data: TransactionForm) => {
    if (!product) {
      return
    }

    setLoading(true)
    const result = await createTransaction(data)

    if (result.success) {
      toast.success('Stock updated successfully')
      onSuccess()
      onClose()
      reset()
    } else {
      toast.error(result.error)
    }
    setLoading(false)
  }

  const handleClose = () => {
    onClose()
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Stock - {product?.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Current Stock:</span>
              <span className="font-semibold">{product?.currentStock || 0}</span>
            </div>
            {quantity > 0 && (
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-slate-600">New Stock:</span>
                <span className="font-semibold text-blue-600">{calculateNewStock()}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <Select
              onValueChange={(value) => {
                setValue('transactionType', value as 'stock-in' | 'stock-out' | 'adjustment')
                fetchReasonSuggestions(value)
              }}
              value={watch('transactionType')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stock-in">Stock In</SelectItem>
                <SelectItem value="stock-out">Stock Out</SelectItem>
                <SelectItem value="adjustment">Adjustment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              {transactionType === 'adjustment' ? 'New Stock Level' : 'Quantity'}
            </Label>
            <Input id="quantity" type="number" {...register('quantity', { valueAsNumber: true })} />
            {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Input id="reason" placeholder="e.g., Purchase, Sale, Damaged goods" {...register('reason')} />
            {errors.reason && <p className="text-sm text-red-500">{errors.reason.message}</p>}
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                {aiLoading ? 'Loading suggestions...' : 'Common reasons:'}
              </div>
              {!aiLoading && reasonSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {reasonSuggestions.map((suggestion) => (
                    <Badge
                      key={suggestion}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => setValue('reason', suggestion)}
                    >
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional information..."
              {...register('notes')}
            />
            {errors.notes && <p className="text-sm text-red-500">{errors.notes.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Stock'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
