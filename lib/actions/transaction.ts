'use server'

import { auth } from '@/auth'
import { connectDB } from '@/lib/db/mongoose'
import Product from '@/lib/models/Product'
import Transaction from '@/lib/models/Transaction'
import { transactionSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function getTransactions() {
  await connectDB()
  const transactions = await Transaction.find()
    .populate('product')
    .populate('performedBy')
    .sort({ date: -1 })
    .lean()
  return JSON.parse(JSON.stringify(transactions))
}

export async function createTransaction(data: unknown) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = transactionSchema.parse(data)
    await connectDB()

    const product = await Product.findById(validated.product)
    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    let newStock = product.currentStock
    if (validated.transactionType === 'stock-in') {
      newStock += validated.quantity
    } else if (validated.transactionType === 'stock-out') {
      if (product.currentStock < validated.quantity) {
        return { success: false, error: 'Insufficient stock' }
      }
      newStock -= validated.quantity
    } else if (validated.transactionType === 'adjustment') {
      newStock = validated.quantity
    }

    await Transaction.create({
      ...validated,
      performedBy: session.user.id,
      date: new Date(),
      balanceAfter: newStock,
    })

    await Product.findByIdAndUpdate(validated.product, {
      currentStock: newStock,
    })

    revalidatePath('/dashboard/transactions')
    revalidatePath('/dashboard/products')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to create transaction' }
  }
}
