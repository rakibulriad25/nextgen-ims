'use client'

import { ImageUpload } from '@/components/image-upload'
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
import { getCategories } from '@/lib/actions/category'
import { createProduct, getProduct, updateProduct } from '@/lib/actions/product'
import { getSuppliers } from '@/lib/actions/supplier'
import { productSchema } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'
import { Textarea } from '../ui/textarea'

type ProductForm = z.infer<typeof productSchema>

interface ProductDialogProps {
  open: boolean
  onClose: () => void
  product: { _id: string } | null
  onSuccess: () => void
}

export function ProductDialog({ open, onClose, product, onSuccess }: ProductDialogProps) {
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([])
  const [suppliers, setSuppliers] = useState<{ _id: string; name: string }[]>([])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: 'active',
      unit: 'pieces',
    },
  })

  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  const loadData = async () => {
    const [cats, sups] = await Promise.all([getCategories(), getSuppliers()])
    setCategories(cats)
    setSuppliers(sups)

    if (product) {
      const data = await getProduct(product._id)
      Object.keys(data).forEach((key) => {
        if (key === 'category') {
          setValue('category', data.category._id)
        } else if (key === 'supplier') {
          setValue('supplier', data.supplier._id)
        } else {
          setValue(key as keyof ProductForm, data[key])
        }
      })
    } else {
      reset({
        status: 'active',
        unit: 'pieces',
      })
    }
  }

  const generateDescription = async () => {
    const productName = watch('name')
    if (!productName) {
      toast.error('Please enter a product name first')
      return
    }

    setAiLoading(true)
    try {
      const categoryId = watch('category')
      const categoryName = categories.find((c) => c._id === categoryId)?.name

      const response = await fetch('/api/ai/suggest-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, categoryName }),
      })

      const data = await response.json()
      if (data.description) {
        setValue('description', data.description)
        toast.success('Description generated')
      } else {
        toast.error('Failed to generate description')
      }
    } catch {
      toast.error('Failed to generate description')
    } finally {
      setAiLoading(false)
    }
  }

  const onSubmit = async (data: ProductForm) => {
    setLoading(true)
    const result = product ? await updateProduct(product._id, data) : await createProduct(data)

    if (result.success) {
      toast.success(`Product ${product ? 'updated' : 'created'} successfully`)
      onSuccess()
      onClose()
      reset()
    } else {
      toast.error(result.error)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" {...register('sku')} />
              {errors.sku && <p className="text-sm text-red-500">{errors.sku.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={generateDescription}
                disabled={aiLoading}
                className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Sparkles className="h-3 w-3" />
                {aiLoading ? 'Generating...' : 'AI Suggest'}
              </Button>
            </div>
            <Textarea id="description" {...register('description')} />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                onValueChange={(value) => setValue('category', value)}
                value={watch('category')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Select
                onValueChange={(value) => setValue('supplier', value)}
                value={watch('supplier')}
              >
                <SelectTrigger>
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
              {errors.supplier && <p className="text-sm text-red-500">{errors.supplier.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                {...register('unitPrice', { valueAsNumber: true })}
              />
              {errors.unitPrice && (
                <p className="text-sm text-red-500">{errors.unitPrice.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="costPrice">Cost Price</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                {...register('costPrice', { valueAsNumber: true })}
              />
              {errors.costPrice && (
                <p className="text-sm text-red-500">{errors.costPrice.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select
                onValueChange={(value) => setValue('unit', value as 'pieces' | 'kg' | 'liters')}
                value={watch('unit')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pieces">Pieces</SelectItem>
                  <SelectItem value="kg">Kilograms</SelectItem>
                  <SelectItem value="liters">Liters</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentStock">Current Stock</Label>
              <Input
                id="currentStock"
                type="number"
                {...register('currentStock', { valueAsNumber: true })}
              />
              {errors.currentStock && (
                <p className="text-sm text-red-500">{errors.currentStock.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorderLevel">Reorder Level</Label>
              <Input
                id="reorderLevel"
                type="number"
                {...register('reorderLevel', { valueAsNumber: true })}
              />
              {errors.reorderLevel && (
                <p className="text-sm text-red-500">{errors.reorderLevel.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode (Optional)</Label>
            <Input id="barcode" {...register('barcode')} />
          </div>

          <ImageUpload
            label="Product Image (Optional)"
            value={watch('imageUrl')}
            onChange={(url) => setValue('imageUrl', url)}
            description="Upload a product image to help identify it easily"
          />

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              onValueChange={(value) => setValue('status', value as 'active' | 'inactive')}
              value={watch('status')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
