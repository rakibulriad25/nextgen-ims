'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
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
import { createUser, deleteUser, getUsers, updateUser } from '@/lib/actions/user'
import { userSchema } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'
import { type User, createColumns } from './columns'

type UserFormData = z.infer<typeof userSchema>

export function UsersClient({ userRole }: { userRole: string }) {
  const [users, setUsers] = useState<User[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  })

  const role = watch('role')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setIsLoading(true)
    const result = await getUsers()
    if (result.error) {
      toast.error(result.error)
    } else {
      setUsers(result.users || [])
    }
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      const result = await deleteUser(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('User deleted successfully')
        loadUsers()
      }
    }
  }

  const onSubmit = async (data: UserFormData) => {
    if (selectedUser) {
      // Update existing user
      const updateData: {
        name: string
        email: string
        password?: string
        role: 'manager' | 'staff'
      } = {
        name: data.name,
        email: data.email,
        role: data.role,
      }

      if (data.password) {
        updateData.password = data.password
      }

      const result = await updateUser(selectedUser._id, updateData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('User updated successfully')
        setIsDialogOpen(false)
        loadUsers()
      }
    } else {
      // Create new user
      if (!data.password) {
        toast.error('Password is required for new users')
        return
      }

      const result = await createUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('User created successfully')
        setIsDialogOpen(false)
        loadUsers()
      }
    }
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    reset({
      name: user.name,
      email: user.email,
      role: user.role as 'manager' | 'staff',
      password: undefined,
    })
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setSelectedUser(null)
    reset({
      name: '',
      email: '',
      password: '',
      role: userRole === 'manager' ? 'staff' : 'manager',
    })
    setIsDialogOpen(true)
  }

  const columns = createColumns(handleEdit, handleDelete)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-2">
            {userRole === 'admin' ? 'Manage managers and staff members' : 'Manage staff members'}
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader></CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-gray-500">Loading users...</p>
          ) : (
            <DataTable columns={columns} data={users} />
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'Edit User' : 'Add New User'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register('name')} placeholder="Enter name" />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} placeholder="Enter email" />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password">
                Password {selectedUser && '(leave blank to keep current)'}
              </Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="Enter password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value) => setValue('role', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {userRole === 'admin' && <SelectItem value="manager">Manager</SelectItem>}
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : selectedUser ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
