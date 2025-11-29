import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  supplier: z.string().min(1, 'Supplier is required'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  costPrice: z.number().min(0, 'Cost price must be positive'),
  reorderLevel: z.number().min(0, 'Reorder level must be positive'),
  currentStock: z.number().min(0, 'Current stock must be positive'),
  unit: z.enum(['pieces', 'kg', 'liters']),
  barcode: z.string().optional(),
  imageUrl: z.string().optional(),
  status: z.enum(['active', 'inactive']),
})

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
})

export const supplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().min(1, 'Address is required'),
  status: z.enum(['active', 'inactive']),
})

export const transactionSchema = z.object({
  product: z.string().min(1, 'Product is required'),
  transactionType: z.enum(['stock-in', 'stock-out', 'adjustment']),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
})
