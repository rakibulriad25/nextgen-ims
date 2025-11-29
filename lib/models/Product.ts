import type { IProduct } from '@/types'
import mongoose, { Schema, type Model } from 'mongoose'

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: { type: String, ref: 'Category', required: true },
  supplier: { type: String, ref: 'Supplier', required: true },
  unitPrice: { type: Number, required: true },
  costPrice: { type: Number, required: true },
  reorderLevel: { type: Number, required: true },
  currentStock: { type: Number, default: 0 },
  unit: { type: String, enum: ['pieces', 'kg', 'liters'], default: 'pieces' },
  barcode: String,
  imageUrl: String,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)

export default Product
