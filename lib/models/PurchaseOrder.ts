import type { IPurchaseOrder } from '@/types'
import mongoose, { Schema, type Model } from 'mongoose'

const PurchaseOrderItemSchema = new Schema({
  product: { type: String, ref: 'Product', required: true },
  productName: String,
  sku: String,
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 },
  receivedQuantity: { type: Number, default: 0, min: 0 },
}, { _id: false })

const PurchaseOrderSchema = new Schema<IPurchaseOrder>({
  poNumber: { type: String, required: true, unique: true },
  supplier: { type: String, ref: 'Supplier', required: true },
  items: { type: [PurchaseOrderItemSchema], required: true, validate: [(val: unknown[]) => val.length > 0, 'At least one item is required'] },
  status: {
    type: String,
    enum: ['draft', 'pending-approval', 'approved', 'ordered', 'partially-received', 'received', 'closed', 'cancelled'],
    default: 'draft',
    required: true
  },
  orderDate: { type: Date, default: Date.now, required: true },
  expectedDeliveryDate: { type: Date, required: true },
  actualDeliveryDate: Date,
  totalAmount: { type: Number, required: true, min: 0 },
  notes: String,
  createdBy: { type: String, ref: 'User', required: true },
  approvedBy: { type: String, ref: 'User' },
  approvedAt: Date,
  cancelledBy: { type: String, ref: 'User' },
  cancelledAt: Date,
  cancellationReason: String,
}, { timestamps: true })

// Generate PO number before saving
PurchaseOrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.poNumber) {
    const count = await mongoose.model('PurchaseOrder').countDocuments()
    const year = new Date().getFullYear()
    this.poNumber = `PO-${year}-${String(count + 1).padStart(5, '0')}`
  }
  next()
})

const PurchaseOrder: Model<IPurchaseOrder> =
  mongoose.models.PurchaseOrder || mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema)

export default PurchaseOrder
