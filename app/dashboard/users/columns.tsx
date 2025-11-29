'use client'

import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Edit, Trash2 } from 'lucide-react'

export type User = {
  _id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'staff'
  createdAt: string
}

export const createColumns = (
  onEdit: (user: User) => void,
  onDelete: (id: string) => void,
): ColumnDef<User>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Name <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as string
      return (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            role === 'admin'
              ? 'bg-purple-100 text-purple-800'
              : role === 'manager'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
          }`}
        >
          {role}
        </span>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'))
      return date.toLocaleDateString()
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
