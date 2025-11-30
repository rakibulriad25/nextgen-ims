'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { QuickReorderDialog } from './quick-reorder-dialog'

interface LowStockProduct {
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

interface DashboardClientProps {
  lowStockProducts: LowStockProduct[]
}

export function DashboardClient({ lowStockProducts }: DashboardClientProps) {
  const [quickReorderOpen, setQuickReorderOpen] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<LowStockProduct[]>([])

  const handleQuickReorder = (product: LowStockProduct) => {
    setSelectedProducts([product])
    setQuickReorderOpen(true)
  }

  const handleReorderAll = () => {
    setSelectedProducts(lowStockProducts)
    setQuickReorderOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Low Stock Products</CardTitle>
          {lowStockProducts.length > 0 && (
            <Button size="sm" onClick={handleReorderAll}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Reorder All
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {lowStockProducts.length > 0 ? (
            <div className="space-y-4">
              {lowStockProducts.map((product) => (
                <div key={product._id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      Stock: {product.currentStock} / Reorder: {product.reorderLevel}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">
                      Low Stock
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickReorder(product)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No low stock products</p>
          )}
        </CardContent>
      </Card>

      <QuickReorderDialog
        open={quickReorderOpen}
        onOpenChange={setQuickReorderOpen}
        products={selectedProducts}
      />
    </>
  )
}
