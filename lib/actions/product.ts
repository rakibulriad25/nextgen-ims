'use server'

import { connectDB } from '@/lib/db/mongoose'
import Category from '@/lib/models/Category'
import Product from '@/lib/models/Product'
import Supplier from '@/lib/models/Supplier'
import { productSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function getProducts() {
  try {
    await connectDB()
    // Ensure models are registered
    Category
    Supplier
    const products = await Product.find()
      .populate('category')
      .populate('supplier')
      .sort({ createdAt: -1 })
      .lean()
    return { success: true, products: JSON.parse(JSON.stringify(products)) }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { success: false, error: 'Failed to fetch products', products: [] }
  }
}

export async function getProduct(id: string) {
  await connectDB()
  // Ensure models are registered
  Category
  Supplier
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
