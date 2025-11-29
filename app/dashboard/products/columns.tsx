'use client'

import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Edit, PackagePlus, Trash2 } from 'lucide-react'

export type Product = {
  _id: string
  sku: string
  name: string
  category: { name: string }
  currentStock: number
  reorderLevel: number
  unitPrice: number
  status: string
}

export const createColumns = (
  onEdit: (product: Product) => void,
  onDelete: (id: string) => void,
  onUpdateStock: (product: Product) => void,
): ColumnDef<Product>[] => [
  {
    accessorKey: 'sku',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          SKU
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue('sku')}</div>,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: 'category.name',
    header: 'Category',
    cell: ({ row }) => row.original.category?.name,
  },
  {
    accessorKey: 'currentStock',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Stock
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const stock = row.original.currentStock
      const reorderLevel = row.original.reorderLevel
      return (
        <div className="flex items-center">
          <span className={stock <= reorderLevel ? 'text-red-600 font-semibold' : ''}>{stock}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'unitPrice',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Unit Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="flex items-center">{formatCurrency(row.getValue('unitPrice'))}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {status}
        </span>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const product = row.original
      return (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onUpdateStock(product)}
            title="Update Stock"
          >
            <PackagePlus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(product)} title="Edit">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(product._id)} title="Delete">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]
