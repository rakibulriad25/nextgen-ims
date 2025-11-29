'use server'

import { connectDB } from '@/lib/db/mongoose'
import Product from '@/lib/models/Product'
import { productSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function getProducts() {
  await connectDB()
  const products = await Product.find()
    .populate('category')
    .populate('supplier')
    .sort({ createdAt: -1 })
    .lean()
  return JSON.parse(JSON.stringify(products))
}

export async function getProduct(id: string) {
  await connectDB()
  const product = await Product.findById(id).populate('category').populate('supplier').lean()
  return JSON.parse(JSON.stringify(product))
}

export async function createProduct(data: unknown) {
  try {
    const validated = productSchema.parse(data)
    await connectDB()
    await Product.create(validated)
    revalidatePath('/dashboard/products')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to create product' }
  }
}

export async function updateProduct(id: string, data: unknown) {
  try {
    const validated = productSchema.parse(data)
    await connectDB()
    await Product.findByIdAndUpdate(id, validated)
    revalidatePath('/dashboard/products')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update product' }
  }
}

export async function deleteProduct(id: string) {
  try {
    await connectDB()
    await Product.findByIdAndDelete(id)
    revalidatePath('/dashboard/products')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete product' }
  }
}
