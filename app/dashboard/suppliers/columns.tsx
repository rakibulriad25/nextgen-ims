'use client'

import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Building2, Edit, Trash2 } from 'lucide-react'
import Image from 'next/image'

export type Supplier = {
  _id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  logoUrl?: string
  status: 'active' | 'inactive'
}

export const createColumns = (
  onEdit: (supplier: Supplier) => void,
  onDelete: (id: string) => void,
): ColumnDef<Supplier>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Name <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const supplier = row.original
      return (
        <div className="flex items-center gap-3">
          {supplier.logoUrl ? (
            <div className="relative w-8 h-8 rounded overflow-hidden bg-gray-100 flex-shrink-0">
              <Image
                src={supplier.logoUrl}
                alt={supplier.name}
                fill
                className="object-cover"
                unoptimized={supplier.logoUrl.startsWith('/uploads/')}
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-4 w-4 text-gray-400" />
            </div>
          )}
          <span>{supplier.name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'contactPerson',
    header: 'Contact Person',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <span
          className={`px-2 py-1 text-xs rounded-full ${status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
        >
          {status}
        </span>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" onClick={() => onEdit(row.original)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(row.original._id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
]
