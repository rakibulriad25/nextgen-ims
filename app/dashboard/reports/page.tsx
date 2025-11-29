'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getProducts } from '@/lib/actions/product'
import { getTransactions } from '@/lib/actions/transaction'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Printer } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useReactToPrint } from 'react-to-print'

export default function ReportsPage() {
  const [products, setProducts] = useState<
    {
      _id: string
      name: string
      sku: string
      category: { name: string }
      currentStock: number
      reorderLevel: number
      unitPrice: number
    }[]
  >([])
  const [transactions, setTransactions] = useState<
    {
      _id: string
      product: { name: string }
      transactionType: string
      quantity: number
      date: string
      balanceAfter: number
    }[]
  >([])
  const [loading, setLoading] = useState(true)
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  })

  const loadData = async () => {
    setLoading(true)
    const [prods, txns] = await Promise.all([getProducts(), getTransactions()])
    setProducts(prods)
    setTransactions(txns)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const lowStockProducts = products.filter((p) => p.currentStock <= p.reorderLevel)
  const inventoryValue = products.reduce((sum, p) => sum + p.currentStock * p.unitPrice, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-gray-500 mt-2">Generate and print reports</p>
        </div>
        <Button onClick={() => handlePrint()}>
          <Printer className="h-4 w-4 mr-2" />
          Print Report
        </Button>
      </div>

      <div ref={printRef} className="print:p-8">
        <Tabs defaultValue="inventory">
          <TabsList className="print:hidden">
            <TabsTrigger value="inventory">Inventory Status</TabsTrigger>
            <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Status Report</CardTitle>
                <p className="text-sm text-gray-500">
                  Total Value: {formatCurrency(inventoryValue)}
                </p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center py-8 text-gray-500">Loading...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product._id}>
                          <TableCell>{product.sku}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.category?.name}</TableCell>
                          <TableCell>{product.currentStock}</TableCell>
                          <TableCell>{formatCurrency(product.unitPrice)}</TableCell>
                          <TableCell>
                            {formatCurrency(product.currentStock * product.unitPrice)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="low-stock">
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alert Report</CardTitle>
                <p className="text-sm text-gray-500">
                  {lowStockProducts.length} products below reorder level
                </p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center py-8 text-gray-500">Loading...</p>
                ) : lowStockProducts.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No low stock products</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Reorder Level</TableHead>
                        <TableHead>Difference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lowStockProducts.map((product) => (
                        <TableRow key={product._id}>
                          <TableCell>{product.sku}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell className="text-red-600 font-semibold">
                            {product.currentStock}
                          </TableCell>
                          <TableCell>{product.reorderLevel}</TableCell>
                          <TableCell>{product.reorderLevel - product.currentStock}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Report</CardTitle>
                <p className="text-sm text-gray-500">Recent 50 transactions</p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center py-8 text-gray-500">Loading...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Balance After</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.slice(0, 50).map((txn) => (
                        <TableRow key={txn._id}>
                          <TableCell>{formatDate(txn.date)}</TableCell>
                          <TableCell>{txn.product?.name}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 text-xs rounded-full print:border ${
                                txn.transactionType === 'stock-in'
                                  ? 'bg-green-100 text-green-800 print:border-green-800'
                                  : txn.transactionType === 'stock-out'
                                    ? 'bg-red-100 text-red-800 print:border-red-800'
                                    : 'bg-blue-100 text-blue-800 print:border-blue-800'
                              }`}
                            >
                              {txn.transactionType}
                            </span>
                          </TableCell>
                          <TableCell>{txn.quantity}</TableCell>
                          <TableCell>{txn.balanceAfter}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
