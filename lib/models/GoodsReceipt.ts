import type { IGoodsReceipt } from '@/types'
import mongoose, { Schema, type Model } from 'mongoose'

const GoodsReceiptItemSchema = new Schema({
  product: { type: String, ref: 'Product', required: true },
  orderedQuantity: { type: Number, required: true, min: 0 },
  receivedQuantity: { type: Number, required: true, min: 0 },
  notes: String,
}, { _id: false })

const GoodsReceiptSchema = new Schema<IGoodsReceipt>({
  purchaseOrder: { type: String, ref: 'PurchaseOrder', required: true },
  receivedBy: { type: String, ref: 'User', required: true },
  receivedDate: { type: Date, default: Date.now, required: true },
  items: { type: [GoodsReceiptItemSchema], required: true },
  notes: String,
}, { timestamps: true })

const GoodsReceipt: Model<IGoodsReceipt> =
  mongoose.models.GoodsReceipt || mongoose.model<IGoodsReceipt>('GoodsReceipt', GoodsReceiptSchema)

export default GoodsReceipt
