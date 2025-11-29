import type { IUser } from '@/types'
import mongoose, { Schema, type Model } from 'mongoose'

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional - not required for OAuth users
  role: { type: String, enum: ['admin', 'manager', 'staff'], default: 'staff' },
  createdAt: { type: Date, default: Date.now },
})

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User
