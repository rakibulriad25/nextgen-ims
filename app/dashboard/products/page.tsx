'use client'

import { ProductDialog } from '@/components/products/product-dialog'
import { StockUpdateDialog } from '@/components/products/stock-update-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { deleteProduct, getProducts } from '@/lib/actions/product'
import { Plus } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { type Product, createColumns } from './columns'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProducts = async () => {
    setLoading(true)
    const data = await getProducts()
    setProducts(data as Product[])
    setLoading(false)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const result = await deleteProduct(id)
      if (result.success) {
        toast.success('Product deleted successfully')
        loadProducts()
      } else {
        toast.error(result.error)
      }
    }
  }, [])

  const handleEdit = useCallback((product: Product) => {
    setSelectedProduct(product)
    setIsDialogOpen(true)
  }, [])

  const handleAdd = useCallback(() => {
    setSelectedProduct(null)
    setIsDialogOpen(true)
  }, [])

  const handleUpdateStock = useCallback((product: Product) => {
    console.log('=== handleUpdateStock called ===')
    console.log('Product:', product)
    console.log('Setting selectedProduct...')
    setSelectedProduct(product)
    console.log('Setting isStockDialogOpen to true...')
    setIsStockDialogOpen(true)
    console.log('=== handleUpdateStock done ===')
  }, [])

  const columns = useMemo(
    () => createColumns(handleEdit, handleDelete, handleUpdateStock),
    [],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-500 mt-2">Manage your product inventory</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Product List</h2>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-gray-500">Loading...</p>
          ) : (
            <DataTable
              columns={columns}
              data={products}
              searchKey="name"
              searchPlaceholder="Search products by name..."
            />
          )}
        </CardContent>
      </Card>

      <ProductDialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false)
          setSelectedProduct(null)
        }}
        product={selectedProduct}
        onSuccess={loadProducts}
      />

      <StockUpdateDialog
        open={isStockDialogOpen}
        onClose={() => {
          setIsStockDialogOpen(false)
          setSelectedProduct(null)
        }}
        product={selectedProduct}
        onSuccess={loadProducts}
      />
    </div>
  )
}
