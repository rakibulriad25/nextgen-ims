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
  iconUrl: z.string().optional(),
})

export const supplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().min(1, 'Address is required'),
  logoUrl: z.string().optional(),
  status: z.enum(['active', 'inactive']),
})

export const transactionSchema = z.object({
  product: z.string().min(1, 'Product is required'),
  transactionType: z.enum(['stock-in', 'stock-out', 'adjustment']),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
})

export const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['manager', 'staff']),
})

export const purchaseOrderItemSchema = z.object({
  product: z.string().min(1, 'Product is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
})

export const purchaseOrderSchema = z.object({
  supplier: z.string().min(1, 'Supplier is required'),
  items: z.array(purchaseOrderItemSchema).min(1, 'At least one item is required'),
  expectedDeliveryDate: z.date().min(new Date(), 'Delivery date cannot be in the past'),
  notes: z.string().optional(),
})

export const goodsReceiptItemSchema = z.object({
  product: z.string().min(1, 'Product is required'),
  orderedQuantity: z.number().min(0),
  receivedQuantity: z.number().min(0, 'Received quantity must be positive'),
  notes: z.string().optional(),
})

export const goodsReceiptSchema = z.object({
  purchaseOrder: z.string().min(1, 'Purchase order is required'),
  items: z.array(goodsReceiptItemSchema).min(1, 'At least one item is required'),
  receivedDate: z.date().optional(),
  notes: z.string().optional(),
})

// Demand Forecasting Schemas
export const generateForecastSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  forecastPeriod: z.enum(['7', '14', '30', '90']).transform(Number),
  historicalPeriod: z.enum(['30', '60', '90', '180']).transform(Number).optional().default('90'),
})

export const forecastPredictionSchema = z.object({
  date: z.string(),
  demand: z.number().min(0),
  confidence: z.enum(['low', 'medium', 'high']),
  upperBound: z.number().min(0),
  lowerBound: z.number().min(0),
})

export const aiForecastResponseSchema = z.object({
  predictions: z.array(forecastPredictionSchema),
  insights: z.string(),
  confidence: z.number().min(0).max(1),
  seasonalPattern: z.string().optional(),
  recommendedReorderPoint: z.number().min(0),
  recommendedOrderQuantity: z.number().min(0),
  stockoutRisk: z.enum(['low', 'medium', 'high']),
})

export const updateForecastSchema = z.object({
  status: z.enum(['active', 'archived']),
})

export const forecastFiltersSchema = z.object({
  productId: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(['active', 'archived']).optional(),
  stockoutRisk: z.enum(['low', 'medium', 'high']).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
})
