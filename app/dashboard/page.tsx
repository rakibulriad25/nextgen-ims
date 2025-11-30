import { auth } from '@/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { connectDB } from '@/lib/db/mongoose'
import Product from '@/lib/models/Product'
import Supplier from '@/lib/models/Supplier'
import Transaction from '@/lib/models/Transaction'
import User from '@/lib/models/User'
import PurchaseOrder from '@/lib/models/PurchaseOrder'
import { formatCurrency } from '@/lib/utils'
import type { IPopulatedTransaction } from '@/types'
import { AlertTriangle, Package, TrendingDown, TrendingUp, Users, ShoppingCart, Clock } from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { DashboardClient } from './dashboard-client'

async function getDashboardData(userRole: string) {
  await connectDB()

  // Ensure models are registered
  Supplier

  const products = await Product.find().populate('supplier', 'name').lean()
  const transactions = (await Transaction.find()
    .sort({ date: -1 })
    .limit(10)
    .populate('product')
    .lean()) as unknown as IPopulatedTransaction[]

  const totalProducts = products.length
  const lowStockProducts = products.filter(
    (p: { currentStock: number; reorderLevel: number }) => p.currentStock <= p.reorderLevel,
  )

  const inventoryValue = products.reduce(
    (sum: number, p: { currentStock: number; unitPrice: number }) =>
      sum + p.currentStock * p.unitPrice,
    0,
  )

  const recentStockIn = transactions.filter((t) => t.transactionType === 'stock-in').length
  const recentStockOut = transactions.filter((t) => t.transactionType === 'stock-out').length

  // Purchase Order statistics
  const pendingPOs = await PurchaseOrder.countDocuments({ status: 'pending-approval' })
  const orderedPOs = await PurchaseOrder.countDocuments({ status: 'ordered' })
  const partiallyReceivedPOs = await PurchaseOrder.countDocuments({ status: 'partially-received' })

  const recentPOs = await PurchaseOrder.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('supplier', 'name')
    .lean()

  // Admin-specific data
  let totalUsers = 0
  let totalManagers = 0
  let totalStaff = 0

  if (userRole === 'admin') {
    const users = await User.find().lean()
    totalUsers = users.length
    totalManagers = users.filter((u: { role: string }) => u.role === 'manager').length
    totalStaff = users.filter((u: { role: string }) => u.role === 'staff').length
  }

  // Manager-specific data
  if (userRole === 'manager') {
    const staff = await User.find({ role: 'staff' }).lean()
    totalStaff = staff.length
  }

  return {
    totalProducts,
    lowStockCount: lowStockProducts.length,
    inventoryValue,
    recentStockIn,
    recentStockOut,
    lowStockProducts: JSON.parse(JSON.stringify(lowStockProducts.slice(0, 5))),
    recentTransactions: transactions,
    totalUsers,
    totalManagers,
    totalStaff,
    pendingPOs,
    orderedPOs,
    partiallyReceivedPOs,
    recentPOs: JSON.parse(JSON.stringify(recentPOs)),
  }
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const userRole = session.user.role
  const data = await getDashboardData(userRole)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">
          {userRole === 'admin' && 'Admin Overview - Full System Access'}
          {userRole === 'manager' && 'Manager Overview - Inventory & Staff Management'}
          {userRole === 'staff' && 'Staff Overview - Inventory Operations'}
        </p>
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
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pendingPOs}</div>
            <p className="text-xs text-muted-foreground mt-1">Purchase Orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.orderedPOs + data.partiallyReceivedPOs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.orderedPOs} ordered, {data.partiallyReceivedPOs} partial
            </p>
          </CardContent>
        </Card>

      </div>

      {(userRole === 'admin' || userRole === 'manager') && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.inventoryValue)}</div>
            </CardContent>
          </Card>

          {userRole === 'admin' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.totalManagers} managers, {data.totalStaff} staff
                </p>
              </CardContent>
            </Card>
          )}

          {userRole === 'manager' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalStaff}</div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardClient lowStockProducts={data.lowStockProducts} />

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {data.recentTransactions.slice(0, 5).map((txn) => (
                  <div key={txn._id.toString()} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{txn.product?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{txn.transactionType}</p>
                    </div>
                    <span className="text-sm font-semibold">{txn.quantity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recent transactions</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Purchase Orders</CardTitle>
            <Link href="/dashboard/purchase-orders" className="text-xs text-blue-600 hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent>
            {data.recentPOs.length > 0 ? (
              <div className="space-y-4">
                {data.recentPOs.map((po: {
                  _id: { toString: () => string }
                  poNumber: string
                  supplier: { name: string }
                  status: string
                  totalAmount: number
                }) => (
                  <Link
                    key={po._id.toString()}
                    href={`/dashboard/purchase-orders/${po._id.toString()}`}
                    className="flex items-center justify-between hover:bg-gray-50 p-2 rounded -mx-2 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{po.poNumber}</p>
                      <p className="text-sm text-gray-500">{po.supplier.name}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className={
                        po.status === 'pending-approval' ? 'bg-yellow-500' :
                        po.status === 'ordered' ? 'bg-purple-500' :
                        po.status === 'received' ? 'bg-green-500' :
                        'bg-gray-500'
                      }>
                        {po.status}
                      </Badge>
                      <span className="text-xs text-gray-600">{formatCurrency(po.totalAmount)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recent purchase orders</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
