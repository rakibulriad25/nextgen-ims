import { auth } from '@/auth'
import { connectDB } from '@/lib/db/mongoose'
import Product from '@/lib/models/Product'
import { NextResponse } from 'next/server'

// Warning threshold: 150% of reorder level
const WARNING_THRESHOLD = 1.5

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Get products at or below reorder level (critical)
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$currentStock', '$reorderLevel'] },
      status: 'active',
    })
      .select('_id name sku currentStock reorderLevel')
      .lean()

    // Get products between reorder level and warning threshold (warning)
    const warningProducts = await Product.find({
      $expr: {
        $and: [
          { $gt: ['$currentStock', '$reorderLevel'] },
          { $lte: ['$currentStock', { $multiply: ['$reorderLevel', WARNING_THRESHOLD] }] },
        ],
      },
      status: 'active',
    })
      .select('_id name sku currentStock reorderLevel')
      .lean()

    const mappedLowStock = lowStockProducts.map((p) => ({
      _id: p._id,
      name: p.name,
      sku: p.sku,
      currentStock: p.currentStock,
      reorderPoint: p.reorderLevel,
      alertType: 'critical' as const,
    }))

    const mappedWarning = warningProducts.map((p) => ({
      _id: p._id,
      name: p.name,
      sku: p.sku,
      currentStock: p.currentStock,
      reorderPoint: p.reorderLevel,
      alertType: 'warning' as const,
    }))

    return NextResponse.json({
      products: [...mappedLowStock, ...mappedWarning],
    })
  } catch (error) {
    console.error('Low stock check error:', error)
    return NextResponse.json({ error: 'Failed to check low stock' }, { status: 500 })
  }
}
