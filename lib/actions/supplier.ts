'use server'

import { connectDB } from '@/lib/db/mongoose'
import Supplier from '@/lib/models/Supplier'
import { supplierSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function getSuppliers() {
  await connectDB()
  const suppliers = await Supplier.find().sort({ createdAt: -1 }).lean()
  return JSON.parse(JSON.stringify(suppliers))
}

export async function getSupplier(id: string) {
  await connectDB()
  const supplier = await Supplier.findById(id).lean()
  return JSON.parse(JSON.stringify(supplier))
}

export async function createSupplier(data: unknown) {
  try {
    const validated = supplierSchema.parse(data)
    await connectDB()
    await Supplier.create(validated)
    revalidatePath('/dashboard/suppliers')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to create supplier' }
  }
}

export async function updateSupplier(id: string, data: unknown) {
  try {
    const validated = supplierSchema.parse(data)
    await connectDB()
    await Supplier.findByIdAndUpdate(id, validated)
    revalidatePath('/dashboard/suppliers')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to update supplier' }
  }
}

export async function deleteSupplier(id: string) {
  try {
    await connectDB()
    await Supplier.findByIdAndDelete(id)
    revalidatePath('/dashboard/suppliers')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete supplier' }
  }
}
