import type { ICategory } from '@/types'
import mongoose, { Schema, type Model } from 'mongoose'

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  iconUrl: String,
  createdAt: { type: Date, default: Date.now },
})

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema)

export default Category
