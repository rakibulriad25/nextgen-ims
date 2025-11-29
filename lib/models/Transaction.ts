import type { ITransaction } from '@/types'
import mongoose, { Schema, type Model } from 'mongoose'

const TransactionSchema = new Schema<ITransaction>({
  product: { type: String, ref: 'Product', required: true },
  transactionType: { type: String, enum: ['stock-in', 'stock-out', 'adjustment'], required: true },
  quantity: { type: Number, required: true },
  reason: { type: String, required: true },
  performedBy: { type: String, ref: 'User', required: true },
  notes: String,
  date: { type: Date, default: Date.now },
  balanceAfter: { type: Number, required: true },
})

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema)

export default Transaction
