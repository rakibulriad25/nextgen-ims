import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { connectDB } from '@/lib/db/mongoose'
import Product from '@/lib/models/Product'
import Transaction from '@/lib/models/Transaction'
import { formatCurrency } from '@/lib/utils'
import { AlertTriangle, Package, TrendingDown, TrendingUp } from 'lucide-react'

async function getDashboardData() {
  await connectDB()

  const products = await Product.find().lean()
  const transactions = await Transaction.find()
    .sort({ date: -1 })
    .limit(10)
    .populate('product')
    .lean()

  const totalProducts = products.length
  const lowStockProducts = products.filter(
    (p: { currentStock: number; reorderLevel: number }) => p.currentStock <= p.reorderLevel,
  )

  const inventoryValue = products.reduce(
    (sum: number, p: { currentStock: number; unitPrice: number }) =>
      sum + p.currentStock * p.unitPrice,
    0,
  )

  const recentStockIn = transactions.filter(
    (t: { transactionType: string }) => t.transactionType === 'stock-in',
  ).length

  const recentStockOut = transactions.filter(
    (t: { transactionType: string }) => t.transactionType === 'stock-out',
  ).length

  return {
    totalProducts,
    lowStockCount: lowStockProducts.length,
    inventoryValue,
    recentStockIn,
    recentStockOut,
    lowStockProducts: lowStockProducts.slice(0, 5),
    recentTransactions: transactions,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Overview of your inventory</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.lowStockCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.inventoryValue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recent Stock Out</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.recentStockOut}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Products</CardTitle>
          </CardHeader>
          <CardContent>
            {data.lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {data.lowStockProducts.map(
                  (product: {
                    _id: { toString: () => string }
                    name: string
                    currentStock: number
                    reorderLevel: number
                  }) => (
                    <div key={product._id.toString()} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          Stock: {product.currentStock} / Reorder: {product.reorderLevel}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">
                        Low Stock
                      </span>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <p className="text-gray-500">No low stock products</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {data.recentTransactions.slice(0, 5).map(
                  (txn: {
                    _id: { toString: () => string }
                    product: { name: string }
                    transactionType: string
                    quantity: number
                  }) => (
                    <div key={txn._id.toString()} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{txn.product?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{txn.transactionType}</p>
                      </div>
                      <span className="text-sm font-semibold">{txn.quantity}</span>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <p className="text-gray-500">No recent transactions</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
