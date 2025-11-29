'use server'

import { connectDB } from '@/lib/db/mongoose'
import Category from '@/lib/models/Category'
import { categorySchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function getCategories() {
  await connectDB()
  const categories = await Category.find().sort({ createdAt: -1 }).lean()
  return JSON.parse(JSON.stringify(categories))
}

export async function getCategory(id: string) {
  await connectDB()
  const category = await Category.findById(id).lean()
  return JSON.parse(JSON.stringify(category))
}

export async function createCategory(data: unknown) {
  try {
    const validated = categorySchema.parse(data)
    await connectDB()
    await Category.create(validated)
    revalidatePath('/dashboard/categories')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to create category' }
  }
}

export async function updateCategory(id: string, data: unknown) {
  try {
    const validated = categorySchema.parse(data)
    await connectDB()
    await Category.findByIdAndUpdate(id, validated)
    revalidatePath('/dashboard/categories')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update category' }
  }
}

export async function deleteCategory(id: string) {
  try {
    await connectDB()
    await Category.findByIdAndDelete(id)
    revalidatePath('/dashboard/categories')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete category' }
  }
}
