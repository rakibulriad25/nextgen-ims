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
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Download, FileText, Printer } from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState('inventory')
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  })

  const downloadCSV = () => {
    let csvContent = ''
    let filename = ''

    if (activeTab === 'inventory') {
      filename = 'inventory-report.csv'
      csvContent = 'SKU,Product Name,Category,Stock,Unit Price,Total Value\n'
      products.forEach((product) => {
        csvContent += `"${product.sku}","${product.name}","${product.category?.name}",${product.currentStock},${product.unitPrice},${product.currentStock * product.unitPrice}\n`
      })
    } else if (activeTab === 'low-stock') {
      filename = 'low-stock-report.csv'
      csvContent = 'SKU,Product Name,Current Stock,Reorder Level,Difference\n'
      lowStockProducts.forEach((product) => {
        csvContent += `"${product.sku}","${product.name}",${product.currentStock},${product.reorderLevel},${product.reorderLevel - product.currentStock}\n`
      })
    } else if (activeTab === 'transactions') {
      filename = 'transaction-report.csv'
      csvContent = 'Date,Product,Type,Quantity,Balance After\n'
      transactions.slice(0, 50).forEach((txn) => {
        csvContent += `"${formatDate(txn.date)}","${txn.product?.name}","${txn.transactionType}",${txn.quantity},${txn.balanceAfter}\n`
      })
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Add title
    doc.setFontSize(18)
    doc.text('Inventory Management System', pageWidth / 2, 15, { align: 'center' })

    if (activeTab === 'inventory') {
      doc.setFontSize(14)
      doc.text('Inventory Status Report', pageWidth / 2, 25, { align: 'center' })
      doc.setFontSize(10)
      doc.text(`Total Value: ${formatCurrency(inventoryValue)}`, pageWidth / 2, 32, {
        align: 'center',
      })

      autoTable(doc, {
        startY: 38,
        head: [['SKU', 'Product Name', 'Category', 'Stock', 'Unit Price', 'Total Value']],
        body: products.map((p) => [
          p.sku,
          p.name,
          p.category?.name || '',
          p.currentStock,
          formatCurrency(p.unitPrice),
          formatCurrency(p.currentStock * p.unitPrice),
        ]),
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
      })

      doc.save('inventory-report.pdf')
    } else if (activeTab === 'low-stock') {
      doc.setFontSize(14)
      doc.text('Low Stock Alert Report', pageWidth / 2, 25, { align: 'center' })
      doc.setFontSize(10)
      doc.text(`${lowStockProducts.length} products below reorder level`, pageWidth / 2, 32, {
        align: 'center',
      })

      autoTable(doc, {
        startY: 38,
        head: [['SKU', 'Product Name', 'Current Stock', 'Reorder Level', 'Difference']],
        body: lowStockProducts.map((p) => [
          p.sku,
          p.name,
          p.currentStock,
          p.reorderLevel,
          p.reorderLevel - p.currentStock,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [239, 68, 68] },
      })

      doc.save('low-stock-report.pdf')
    } else if (activeTab === 'transactions') {
      doc.setFontSize(14)
      doc.text('Transaction Report', pageWidth / 2, 25, { align: 'center' })
      doc.setFontSize(10)
      doc.text('Recent 50 transactions', pageWidth / 2, 32, { align: 'center' })

      autoTable(doc, {
        startY: 38,
        head: [['Date', 'Product', 'Type', 'Quantity', 'Balance After']],
        body: transactions.slice(0, 50).map((txn) => [
          formatDate(txn.date),
          txn.product?.name || '',
          txn.transactionType,
          txn.quantity,
          txn.balanceAfter,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
      })

      doc.save('transaction-report.pdf')
    }
  }

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
          <p className="text-gray-500 mt-2">Generate and export reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadCSV} disabled={loading}>
            <FileText className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={downloadPDF} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={() => handlePrint()} disabled={loading}>
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </Button>
        </div>
      </div>

      <div ref={printRef} className="print:p-8">
        <Tabs defaultValue="inventory" value={activeTab} onValueChange={setActiveTab}>
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
