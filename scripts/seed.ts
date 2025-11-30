import { resolve } from 'node:path'
import { config } from 'dotenv'
config({ path: resolve(process.cwd(), '.env.local') })

import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { connectDB } from '../lib/db/mongoose'
import Category from '../lib/models/Category'
import Product from '../lib/models/Product'
import Supplier from '../lib/models/Supplier'
import Transaction from '../lib/models/Transaction'
import User from '../lib/models/User'
import PurchaseOrder from '../lib/models/PurchaseOrder'

async function seed() {
  try {
    await connectDB()
    console.log('Connected to MongoDB')

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Supplier.deleteMany({}),
      Product.deleteMany({}),
      Transaction.deleteMany({}),
      PurchaseOrder.deleteMany({}),
    ])
    console.log('Cleared existing data')

    // Create users with different roles
    const hashedPassword = await bcrypt.hash('password123', 10)

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
    })

    const manager = await User.create({
      name: 'Manager User',
      email: 'manager@example.com',
      password: hashedPassword,
      role: 'manager',
    })

    const staff = await User.create({
      name: 'Staff User',
      email: 'staff@example.com',
      password: hashedPassword,
      role: 'staff',
    })

    console.log('Created users (admin, manager, staff)')

    // Create categories
    const categories = await Category.create([
      { name: 'Electronics', description: 'Electronic devices and accessories' },
      { name: 'Furniture', description: 'Office and home furniture' },
      { name: 'Stationery', description: 'Office supplies and stationery' },
      { name: 'Food & Beverage', description: 'Food and beverage items' },
    ])
    console.log('Created categories')

    // Create suppliers
    const suppliers = await Supplier.create([
      {
        name: 'Tech Supplies Inc',
        contactPerson: 'John Doe',
        email: 'john@techsupplies.com',
        phone: '+1234567890',
        address: '123 Tech Street, Silicon Valley, CA',
        status: 'active',
      },
      {
        name: 'Furniture World',
        contactPerson: 'Jane Smith',
        email: 'jane@furnitureworld.com',
        phone: '+1234567891',
        address: '456 Furniture Ave, New York, NY',
        status: 'active',
      },
      {
        name: 'Office Essentials',
        contactPerson: 'Bob Johnson',
        email: 'bob@officeessentials.com',
        phone: '+1234567892',
        address: '789 Office Blvd, Chicago, IL',
        status: 'active',
      },
    ])
    console.log('Created suppliers')

    // Create products
    const products = await Product.create([
      {
        name: 'Laptop Dell XPS 15',
        sku: 'LAPTOP-001',
        description: 'High-performance laptop for business',
        category: categories[0]._id,
        supplier: suppliers[0]._id,
        unitPrice: 1299.99,
        costPrice: 999.99,
        reorderLevel: 5,
        currentStock: 15,
        unit: 'pieces',
        status: 'active',
      },
      {
        name: 'Wireless Mouse',
        sku: 'MOUSE-001',
        description: 'Ergonomic wireless mouse',
        category: categories[0]._id,
        supplier: suppliers[0]._id,
        unitPrice: 29.99,
        costPrice: 15.99,
        reorderLevel: 20,
        currentStock: 50,
        unit: 'pieces',
        status: 'active',
      },
      {
        name: 'Office Desk',
        sku: 'DESK-001',
        description: 'Adjustable standing desk',
        category: categories[1]._id,
        supplier: suppliers[1]._id,
        unitPrice: 499.99,
        costPrice: 299.99,
        reorderLevel: 3,
        currentStock: 8,
        unit: 'pieces',
        status: 'active',
      },
      {
        name: 'Office Chair',
        sku: 'CHAIR-001',
        description: 'Ergonomic office chair with lumbar support',
        category: categories[1]._id,
        supplier: suppliers[1]._id,
        unitPrice: 299.99,
        costPrice: 179.99,
        reorderLevel: 5,
        currentStock: 3,
        unit: 'pieces',
        status: 'active',
      },
      {
        name: 'Notebook A4',
        sku: 'NOTE-001',
        description: 'Ruled notebook 200 pages',
        category: categories[2]._id,
        supplier: suppliers[2]._id,
        unitPrice: 4.99,
        costPrice: 2.49,
        reorderLevel: 100,
        currentStock: 250,
        unit: 'pieces',
        status: 'active',
      },
      {
        name: 'Ballpoint Pen Pack',
        sku: 'PEN-001',
        description: 'Pack of 10 blue ballpoint pens',
        category: categories[2]._id,
        supplier: suppliers[2]._id,
        unitPrice: 9.99,
        costPrice: 4.99,
        reorderLevel: 50,
        currentStock: 120,
        unit: 'pieces',
        status: 'active',
      },
    ])
    console.log('Created products')

    // Create transactions for visualization (6 months)
    const transactionsData = []
    const now = new Date()

    // Helper function to get a date N days ago
    const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    const users = [admin, manager, staff]
    const reasons = {
      'stock-in': ['New stock arrival', 'Supplier delivery', 'Restocking', 'Initial stock', 'Purchase order received'],
      'stock-out': ['Sales order', 'Customer order', 'Internal use', 'Office setup', 'Damaged items']
    }

    // Generate monthly aggregated transactions for the last 6 months
    // This creates just enough data to visualize the chart properly
    for (let month = 5; month >= 0; month--) {
      const monthDate = new Date()
      monthDate.setMonth(monthDate.getMonth() - month)
      monthDate.setDate(15) // Mid-month for consistent display

      // Create 8-12 transactions per month (not per day)
      const numTransactions = Math.floor(Math.random() * 5) + 8

      for (let i = 0; i < numTransactions; i++) {
        const product = products[Math.floor(Math.random() * products.length)]
        const transactionType = Math.random() > 0.5 ? 'stock-in' : 'stock-out'
        const user = users[Math.floor(Math.random() * users.length)]
        const reasonList = reasons[transactionType]
        const reason = reasonList[Math.floor(Math.random() * reasonList.length)]

        // Random day within the month
        const dayOffset = Math.floor(Math.random() * 28) - 14
        const transactionDate = new Date(monthDate.getTime() + dayOffset * 24 * 60 * 60 * 1000)

        // Quantity varies by product type and transaction
        let quantity
        if (transactionType === 'stock-in') {
          // Stock in: larger quantities
          quantity = Math.floor(Math.random() * 30) + 10
        } else {
          // Stock out: smaller quantities
          quantity = Math.floor(Math.random() * 15) + 1
        }

        // Calculate balance (this is simplified - real balance would track actual inventory)
        const balanceAfter = Math.floor(Math.random() * 100) + 10

        transactionsData.push({
          product: product._id,
          transactionType,
          quantity,
          reason,
          performedBy: user._id,
          date: transactionDate,
          balanceAfter,
        })
      }
    }

    const transactions = await Transaction.create(transactionsData)
    console.log(`Created ${transactions.length} transactions across last 6 months`)

    // Create sample purchase orders with different statuses
    const purchaseOrdersData = []
    const poStatuses = ['pending-approval', 'approved', 'ordered', 'partially-received', 'received', 'closed']

    for (let i = 0; i < 10; i++) {
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)]
      const numItems = Math.floor(Math.random() * 3) + 1
      const items = []

      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)]
        const quantity = Math.floor(Math.random() * 50) + 10
        const receivedQty = i < 3 ? 0 : i < 6 ? Math.floor(quantity * 0.5) : quantity

        items.push({
          product: product._id,
          productName: product.name,
          sku: product.sku,
          quantity,
          unitPrice: product.costPrice,
          totalPrice: quantity * product.costPrice,
          receivedQuantity: receivedQty,
        })
      }

      const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0)
      const status = poStatuses[Math.floor(Math.random() * poStatuses.length)]
      const orderDate = daysAgo(Math.floor(Math.random() * 60))
      const expectedDeliveryDate = new Date(orderDate.getTime() + (Math.floor(Math.random() * 30) + 7) * 24 * 60 * 60 * 1000)

      const poData: any = {
        poNumber: `PO-${new Date().getFullYear()}-${String(i + 1).padStart(5, '0')}`,
        supplier: supplier._id,
        items,
        status,
        orderDate,
        expectedDeliveryDate,
        totalAmount,
        notes: `Sample purchase order ${i + 1}`,
        createdBy: i % 3 === 0 ? admin._id : i % 3 === 1 ? manager._id : staff._id,
      }

      // Add approval data for approved statuses
      if (['approved', 'ordered', 'partially-received', 'received', 'closed'].includes(status)) {
        poData.approvedBy = Math.random() > 0.5 ? admin._id : manager._id
        poData.approvedAt = new Date(orderDate.getTime() + 24 * 60 * 60 * 1000)
      }

      // Add delivery date for received/closed statuses
      if (['received', 'closed'].includes(status)) {
        poData.actualDeliveryDate = new Date(orderDate.getTime() + (Math.floor(Math.random() * 20) + 5) * 24 * 60 * 60 * 1000)
      }

      purchaseOrdersData.push(poData)
    }

    const purchaseOrders = await PurchaseOrder.create(purchaseOrdersData)
    console.log(`Created ${purchaseOrders.length} purchase orders`)

    console.log('\n=== Seed completed successfully! ===')
    console.log('\nLogin credentials:')
    console.log('Admin - Email: admin@example.com, Password: password123')
    console.log('Manager - Email: manager@example.com, Password: password123')
    console.log('Staff - Email: staff@example.com, Password: password123')
    console.log('\nDatabase contains:')
    console.log('- 3 users (1 admin, 1 manager, 1 staff)')
    console.log(`- ${categories.length} categories`)
    console.log(`- ${suppliers.length} suppliers`)
    console.log(`- ${products.length} products`)
    console.log(`- ${transactions.length} transactions`)
    console.log(`- ${purchaseOrders.length} purchase orders`)

    await mongoose.connection.close()
    console.log('\nDatabase connection closed')
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

seed()
