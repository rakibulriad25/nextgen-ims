'use server'

import { connectDB } from '@/lib/db/mongoose'
import Product from '@/lib/models/Product'
import PurchaseOrder from '@/lib/models/PurchaseOrder'
import Supplier from '@/lib/models/Supplier'
import User from '@/lib/models/User'
import Transaction from '@/lib/models/Transaction'
import GoodsReceipt from '@/lib/models/GoodsReceipt'
import { purchaseOrderSchema, goodsReceiptSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import type { IPurchaseOrderItem } from '@/types'

export async function getPurchaseOrders() {
  await connectDB()
  // Ensure models are registered
  Supplier
  User
  const purchaseOrders = await PurchaseOrder.find()
    .populate('supplier')
    .populate('createdBy', 'name email')
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 })
    .lean()
  return JSON.parse(JSON.stringify(purchaseOrders))
}

export async function getPurchaseOrder(id: string) {
  await connectDB()
  // Ensure models are registered
  Supplier
  User
  Product
  const purchaseOrder = await PurchaseOrder.findById(id)
    .populate('supplier')
    .populate('createdBy', 'name email')
    .populate('approvedBy', 'name email')
    .lean()

  if (!purchaseOrder) {
    return null
  }

  // Populate product details in items
  const populatedItems = await Promise.all(
    purchaseOrder.items.map(async (item: IPurchaseOrderItem) => {
      const product = await Product.findById(item.product).lean()
      return {
        ...item,
        productName: product?.name,
        sku: product?.sku,
      }
    })
  )

  return JSON.parse(JSON.stringify({ ...purchaseOrder, items: populatedItems }))
}

export async function createPurchaseOrder(data: unknown) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = purchaseOrderSchema.parse(data)
    await connectDB()

    // Calculate total and populate item details
    const items = await Promise.all(
      validated.items.map(async (item) => {
        const product = await Product.findById(item.product)
        if (!product) {
          throw new Error(`Product not found: ${item.product}`)
        }
        const totalPrice = item.quantity * item.unitPrice
        return {
          product: item.product,
          productName: product.name,
          sku: product.sku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice,
          receivedQuantity: 0,
        }
      })
    )

    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0)

    // Generate PO number
    const count = await PurchaseOrder.countDocuments()
    const year = new Date().getFullYear()
    const poNumber = `PO-${year}-${String(count + 1).padStart(5, '0')}`

    const purchaseOrder = await PurchaseOrder.create({
      ...validated,
      poNumber,
      items,
      totalAmount,
      createdBy: session.user.id,
      status: 'draft',
      orderDate: new Date(),
    })

    revalidatePath('/dashboard/purchase-orders')
    return { success: true, id: purchaseOrder._id.toString() }
  } catch (error) {
    console.error('Create PO error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create purchase order' }
  }
}

export async function updatePurchaseOrder(id: string, data: unknown) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = purchaseOrderSchema.parse(data)
    await connectDB()

    const existingPO = await PurchaseOrder.findById(id)
    if (!existingPO) {
      return { success: false, error: 'Purchase order not found' }
    }

    // Only drafts can be edited freely
    if (existingPO.status !== 'draft') {
      return { success: false, error: 'Only draft purchase orders can be edited' }
    }

    // Calculate total and populate item details
    const items = await Promise.all(
      validated.items.map(async (item) => {
        const product = await Product.findById(item.product)
        if (!product) {
          throw new Error(`Product not found: ${item.product}`)
        }
        const totalPrice = item.quantity * item.unitPrice
        return {
          product: item.product,
          productName: product.name,
          sku: product.sku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice,
          receivedQuantity: 0,
        }
      })
    )

    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0)

    await PurchaseOrder.findByIdAndUpdate(id, {
      ...validated,
      items,
      totalAmount,
    })

    revalidatePath('/dashboard/purchase-orders')
    revalidatePath(`/dashboard/purchase-orders/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Update PO error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update purchase order' }
  }
}

export async function deletePurchaseOrder(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    await connectDB()

    const po = await PurchaseOrder.findById(id)
    if (!po) {
      return { success: false, error: 'Purchase order not found' }
    }

    // Only drafts can be deleted
    if (po.status !== 'draft') {
      return { success: false, error: 'Only draft purchase orders can be deleted' }
    }

    await PurchaseOrder.findByIdAndDelete(id)
    revalidatePath('/dashboard/purchase-orders')
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to delete purchase order' }
  }
}

export async function submitForApproval(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    await connectDB()

    const po = await PurchaseOrder.findById(id)
    if (!po) {
      return { success: false, error: 'Purchase order not found' }
    }

    if (po.status !== 'draft') {
      return { success: false, error: 'Only draft purchase orders can be submitted for approval' }
    }

    await PurchaseOrder.findByIdAndUpdate(id, { status: 'pending-approval' })

    revalidatePath('/dashboard/purchase-orders')
    revalidatePath(`/dashboard/purchase-orders/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to submit for approval' }
  }
}

export async function approvePurchaseOrder(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.role) {
      return { success: false, error: 'Unauthorized' }
    }

    // Only managers and admins can approve
    if (session.user.role !== 'manager' && session.user.role !== 'admin') {
      return { success: false, error: 'Only managers and admins can approve purchase orders' }
    }

    await connectDB()

    const po = await PurchaseOrder.findById(id)
    if (!po) {
      return { success: false, error: 'Purchase order not found' }
    }

    if (po.status !== 'pending-approval') {
      return { success: false, error: 'Only pending purchase orders can be approved' }
    }

    await PurchaseOrder.findByIdAndUpdate(id, {
      status: 'approved',
      approvedBy: session.user.id,
      approvedAt: new Date(),
    })

    revalidatePath('/dashboard/purchase-orders')
    revalidatePath(`/dashboard/purchase-orders/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to approve purchase order' }
  }
}

export async function rejectPurchaseOrder(id: string, reason: string) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.role) {
      return { success: false, error: 'Unauthorized' }
    }

    // Only managers and admins can reject
    if (session.user.role !== 'manager' && session.user.role !== 'admin') {
      return { success: false, error: 'Only managers and admins can reject purchase orders' }
    }

    await connectDB()

    const po = await PurchaseOrder.findById(id)
    if (!po) {
      return { success: false, error: 'Purchase order not found' }
    }

    if (po.status !== 'pending-approval') {
      return { success: false, error: 'Only pending purchase orders can be rejected' }
    }

    await PurchaseOrder.findByIdAndUpdate(id, {
      status: 'draft',
      cancellationReason: reason,
    })

    revalidatePath('/dashboard/purchase-orders')
    revalidatePath(`/dashboard/purchase-orders/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to reject purchase order' }
  }
}

export async function markAsOrdered(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.role) {
      return { success: false, error: 'Unauthorized' }
    }

    await connectDB()

    const po = await PurchaseOrder.findById(id)
    if (!po) {
      return { success: false, error: 'Purchase order not found' }
    }

    if (po.status !== 'approved') {
      return { success: false, error: 'Only approved purchase orders can be marked as ordered' }
    }

    await PurchaseOrder.findByIdAndUpdate(id, { status: 'ordered' })

    revalidatePath('/dashboard/purchase-orders')
    revalidatePath(`/dashboard/purchase-orders/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to mark as ordered' }
  }
}

export async function cancelPurchaseOrder(id: string, reason: string) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.role) {
      return { success: false, error: 'Unauthorized' }
    }

    // Only managers and admins can cancel
    if (session.user.role !== 'manager' && session.user.role !== 'admin') {
      return { success: false, error: 'Only managers and admins can cancel purchase orders' }
    }

    await connectDB()

    const po = await PurchaseOrder.findById(id)
    if (!po) {
      return { success: false, error: 'Purchase order not found' }
    }

    if (po.status === 'received' || po.status === 'closed' || po.status === 'cancelled') {
      return { success: false, error: 'Cannot cancel a completed or already cancelled purchase order' }
    }

    await PurchaseOrder.findByIdAndUpdate(id, {
      status: 'cancelled',
      cancelledBy: session.user.id,
      cancelledAt: new Date(),
      cancellationReason: reason,
    })

    revalidatePath('/dashboard/purchase-orders')
    revalidatePath(`/dashboard/purchase-orders/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to cancel purchase order' }
  }
}

export async function receiveGoods(data: unknown) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const validated = goodsReceiptSchema.parse(data)
    await connectDB()

    const po = await PurchaseOrder.findById(validated.purchaseOrder)
    if (!po) {
      return { success: false, error: 'Purchase order not found' }
    }

    if (po.status !== 'ordered' && po.status !== 'partially-received') {
      return { success: false, error: 'Only ordered or partially received purchase orders can receive goods' }
    }

    // Create goods receipt
    await GoodsReceipt.create({
      ...validated,
      receivedBy: session.user.id,
      receivedDate: validated.receivedDate || new Date(),
    })

    // Update PO items with received quantities and create stock-in transactions
    for (const item of validated.items) {
      const poItem = po.items.find((i: IPurchaseOrderItem) => i.product.toString() === item.product)
      if (poItem) {
        poItem.receivedQuantity += item.receivedQuantity

        // Create stock-in transaction
        const product = await Product.findById(item.product)
        if (product) {
          const newStock = product.currentStock + item.receivedQuantity

          await Transaction.create({
            product: item.product,
            transactionType: 'stock-in',
            quantity: item.receivedQuantity,
            reason: `Goods receipt for PO ${po.poNumber}`,
            performedBy: session.user.id,
            notes: item.notes || `Received against PO ${po.poNumber}`,
            balanceAfter: newStock,
          })

          // Update product stock
          await Product.findByIdAndUpdate(item.product, {
            currentStock: newStock,
          })
        }
      }
    }

    // Check if all items are fully received
    const allReceived = po.items.every(
      (item: IPurchaseOrderItem) => item.receivedQuantity >= item.quantity
    )
    const anyReceived = po.items.some((item: IPurchaseOrderItem) => item.receivedQuantity > 0)

    let newStatus: 'ordered' | 'partially-received' | 'received' = po.status as 'ordered' | 'partially-received'
    let actualDeliveryDate = po.actualDeliveryDate
    if (allReceived) {
      newStatus = 'received'
      actualDeliveryDate = new Date()
    } else if (anyReceived) {
      newStatus = 'partially-received'
    }

    await PurchaseOrder.findByIdAndUpdate(validated.purchaseOrder, {
      items: po.items,
      status: newStatus,
      actualDeliveryDate,
    })

    revalidatePath('/dashboard/purchase-orders')
    revalidatePath(`/dashboard/purchase-orders/${validated.purchaseOrder}`)
    revalidatePath('/dashboard/products')
    revalidatePath('/dashboard/transactions')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Receive goods error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to receive goods' }
  }
}

export async function closePurchaseOrder(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.role) {
      return { success: false, error: 'Unauthorized' }
    }

    // Only managers and admins can close
    if (session.user.role !== 'manager' && session.user.role !== 'admin') {
      return { success: false, error: 'Only managers and admins can close purchase orders' }
    }

    await connectDB()

    const po = await PurchaseOrder.findById(id)
    if (!po) {
      return { success: false, error: 'Purchase order not found' }
    }

    if (po.status !== 'received' && po.status !== 'partially-received') {
      return { success: false, error: 'Only received or partially received purchase orders can be closed' }
    }

    await PurchaseOrder.findByIdAndUpdate(id, { status: 'closed' })

    revalidatePath('/dashboard/purchase-orders')
    revalidatePath(`/dashboard/purchase-orders/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to close purchase order' }
  }
}

export async function getPurchaseOrderStats() {
  await connectDB()

  const [total, pending, approved, ordered, received] = await Promise.all([
    PurchaseOrder.countDocuments(),
    PurchaseOrder.countDocuments({ status: 'pending-approval' }),
    PurchaseOrder.countDocuments({ status: 'approved' }),
    PurchaseOrder.countDocuments({ status: 'ordered' }),
    PurchaseOrder.countDocuments({ status: { $in: ['partially-received', 'received'] } }),
  ])

  return { total, pending, approved, ordered, received }
}
