import type { Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password?: string // Optional for OAuth users
  role: 'admin' | 'manager' | 'staff'
  createdAt: Date
}

export interface IProduct extends Document {
  name: string
  sku: string
  description: string
  category: string
  supplier: string
  unitPrice: number
  costPrice: number
  reorderLevel: number
  currentStock: number
  unit: 'pieces' | 'kg' | 'liters'
  barcode?: string
  imageUrl?: string
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

export interface ICategory extends Document {
  name: string
  description: string
  iconUrl?: string
  createdAt: Date
}

export interface ISupplier extends Document {
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  logoUrl?: string
  status: 'active' | 'inactive'
  createdAt: Date
}

export interface ITransaction extends Document {
  product: string
  transactionType: 'stock-in' | 'stock-out' | 'adjustment'
  quantity: number
  reason: string
  performedBy: string
  notes?: string
  date: Date
  balanceAfter: number
}

export interface IPopulatedTransaction extends Omit<ITransaction, 'product'> {
  product: IProduct
}

export interface IWarehouse extends Document {
  name: string
  location: string
  capacity: number
  manager: string
  status: 'active' | 'inactive'
}

export interface IPurchaseOrderItem {
  product: string
  productName?: string
  sku?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  receivedQuantity: number
}

export interface IPurchaseOrder extends Document {
  poNumber: string
  supplier: string
  items: IPurchaseOrderItem[]
  status: 'draft' | 'pending-approval' | 'approved' | 'ordered' | 'partially-received' | 'received' | 'closed' | 'cancelled'
  orderDate: Date
  expectedDeliveryDate: Date
  actualDeliveryDate?: Date
  totalAmount: number
  notes?: string
  createdBy: string
  approvedBy?: string
  approvedAt?: Date
  cancelledBy?: string
  cancelledAt?: Date
  cancellationReason?: string
  createdAt: Date
  updatedAt: Date
}

export interface IPopulatedPurchaseOrder extends Omit<IPurchaseOrder, 'supplier' | 'createdBy' | 'approvedBy'> {
  supplier: ISupplier
  createdBy: IUser
  approvedBy?: IUser
}

export interface IGoodsReceipt extends Document {
  purchaseOrder: string
  receivedBy: string
  receivedDate: Date
  items: {
    product: string
    orderedQuantity: number
    receivedQuantity: number
    notes?: string
  }[]
  notes?: string
  createdAt: Date
}
