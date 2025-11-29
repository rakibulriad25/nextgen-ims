'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { createTransaction, getTransactions } from '@/lib/actions/transaction'
import { formatDate } from '@/lib/utils'
import { transactionSchema } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'

type TransactionForm = z.infer<typeof transactionSchema>

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<
    {
      _id: string
      product: { name: string; sku: string }
      transactionType: string
      quantity: number
      reason: string
      date: string
      balanceAfter: number
    }[]
  >([])
  const [products, setProducts] = useState<{ _id: string; name: string; sku: string }[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
  })

  const loadData = async () => {
    setLoading(true)
    const [txns, prods] = await Promise.all([getTransactions(), getProducts()])
    setTransactions(txns)
    setProducts(prods)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const onSubmit = async (data: TransactionForm) => {
    const result = await createTransaction(data)
    if (result.success) {
      toast.success('Transaction recorded successfully')
      loadData()
      setIsDialogOpen(false)
      reset()
    } else {
      toast.error(result.error)
    }
  }

  const filterByType = (type: string) => {
    if (type === 'all') return transactions
    return transactions.filter((t) => t.transactionType === type)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-gray-500 mt-2">Track inventory movements</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Transaction
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="stock-in">Stock In</TabsTrigger>
              <TabsTrigger value="stock-out">Stock Out</TabsTrigger>
              <TabsTrigger value="adjustment">Adjustment</TabsTrigger>
            </TabsList>

            {['all', 'stock-in', 'stock-out', 'adjustment'].map((type) => (
              <TabsContent key={type} value={type}>
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
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterByType(type).map((txn) => (
                        <TableRow key={txn._id}>
                          <TableCell>{formatDate(txn.date)}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{txn.product?.name}</p>
                              <p className="text-sm text-gray-500">{txn.product?.sku}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                txn.transactionType === 'stock-in'
                                  ? 'bg-green-100 text-green-800'
                                  : txn.transactionType === 'stock-out'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {txn.transactionType}
                            </span>
                          </TableCell>
                          <TableCell>{txn.quantity}</TableCell>
                          <TableCell>{txn.balanceAfter}</TableCell>
                          <TableCell>{txn.reason}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select
                onValueChange={(value) => setValue('product', value)}
                value={watch('product')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((prod) => (
                    <SelectItem key={prod._id} value={prod._id}>
                      {prod.name} ({prod.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.product && <p className="text-sm text-red-500">{errors.product.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <Select
                onValueChange={(value) =>
                  setValue('transactionType', value as 'stock-in' | 'stock-out' | 'adjustment')
                }
                value={watch('transactionType')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock-in">Stock In</SelectItem>
                  <SelectItem value="stock-out">Stock Out</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
              {errors.transactionType && (
                <p className="text-sm text-red-500">{errors.transactionType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                {...register('quantity', { valueAsNumber: true })}
              />
              {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input id="reason" {...register('reason')} />
              {errors.reason && <p className="text-sm text-red-500">{errors.reason.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input id="notes" {...register('notes')} />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
