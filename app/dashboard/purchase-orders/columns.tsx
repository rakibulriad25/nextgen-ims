'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Eye } from 'lucide-react'
import { format } from 'date-fns'

export type PurchaseOrder = {
  _id: string
  poNumber: string
  supplier: { name: string }
  status: string
  orderDate: string
  expectedDeliveryDate: string
  totalAmount: number
  items: { quantity: number; receivedQuantity: number }[]
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500',
  'pending-approval': 'bg-yellow-500',
  approved: 'bg-blue-500',
  ordered: 'bg-purple-500',
  'partially-received': 'bg-orange-500',
  received: 'bg-green-500',
  closed: 'bg-slate-500',
  cancelled: 'bg-red-500',
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  'pending-approval': 'Pending Approval',
  approved: 'Approved',
  ordered: 'Ordered',
  'partially-received': 'Partially Received',
  received: 'Received',
  closed: 'Closed',
  cancelled: 'Cancelled',
}

export const createColumns = (onView: (po: PurchaseOrder) => void): ColumnDef<PurchaseOrder>[] => [
  {
    accessorKey: 'poNumber',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          PO Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue('poNumber')}</div>,
  },
  {
    accessorKey: 'supplier',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Supplier
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const supplier = row.getValue('supplier') as { name: string }
      return <div>{supplier.name}</div>
    },
    sortingFn: (rowA, rowB) => {
      const a = (rowA.getValue('supplier') as { name: string }).name
      const b = (rowB.getValue('supplier') as { name: string }).name
      return a.localeCompare(b)
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge className={statusColors[status]}>
          {statusLabels[status] || status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'orderDate',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Order Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue('orderDate'))
      return <div>{format(date, 'MMM dd, yyyy')}</div>
    },
  },
  {
    accessorKey: 'expectedDeliveryDate',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Expected Delivery
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue('expectedDeliveryDate'))
      return <div>{format(date, 'MMM dd, yyyy')}</div>
    },
  },
  {
    accessorKey: 'totalAmount',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Total Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = row.getValue('totalAmount') as number
      return <div className="font-medium">{formatCurrency(amount)}</div>
    },
  },
  {
    id: 'progress',
    header: 'Progress',
    cell: ({ row }) => {
      const items = row.original.items
      const totalOrdered = items.reduce((sum, item) => sum + item.quantity, 0)
      const totalReceived = items.reduce((sum, item) => sum + item.receivedQuantity, 0)
      const percentage = totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0

      return (
        <div className="flex items-center gap-2">
          <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xs text-gray-600">{percentage}%</span>
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const po = row.original
      return (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onView(po)}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]
