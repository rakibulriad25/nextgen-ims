import { resolve } from 'node:path'
import { config } from 'dotenv'
config({ path: resolve(process.cwd(), '.env.local') })

import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { readFileSync } from 'fs'
import { connectDB } from '../lib/db/mongoose'
import Category from '../lib/models/Category'
import Product from '../lib/models/Product'
import Supplier from '../lib/models/Supplier'
import Transaction from '../lib/models/Transaction'
import User from '../lib/models/User'
import PurchaseOrder from '../lib/models/PurchaseOrder'

// Load seed data
const seedData = JSON.parse(readFileSync(resolve(__dirname, 'seed-data.json'), 'utf-8'))

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

    const usersArray = await User.create(
      seedData.users.map((userData: any) => ({
        ...userData,
        password: hashedPassword,
      }))
    )

    const users: any[] = Array.isArray(usersArray) ? usersArray : [usersArray]
    const [admin, manager, staff] = users
    console.log('Created users (admin, manager, staff)')

    // Create categories
    const categoriesArray = await Category.create(seedData.categories)
    const categories: any[] = Array.isArray(categoriesArray) ? categoriesArray : [categoriesArray]
    console.log('Created categories')

    // Create suppliers
    const suppliersArray = await Supplier.create(seedData.suppliers)
    const suppliers: any[] = Array.isArray(suppliersArray) ? suppliersArray : [suppliersArray]
    console.log('Created suppliers')

    // Create products with mapped references
    const productsArray = await Product.create(
      seedData.products.map((productData: any) => ({
        name: productData.name,
        sku: productData.sku,
        description: productData.description,
        category: categories[productData.categoryIndex]._id,
        supplier: suppliers[productData.supplierIndex]._id,
        unitPrice: productData.unitPrice,
        costPrice: productData.costPrice,
        reorderLevel: productData.reorderLevel,
        currentStock: productData.currentStock,
        unit: productData.unit,
        status: productData.status,
      }))
    )
    const products: any[] = Array.isArray(productsArray) ? productsArray : [productsArray]
    console.log('Created products')

    // Generate comprehensive daily transaction history for forecasting
    const transactionsData: any[] = []
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    // Helper function to get a date N days ago
    const daysAgo = (days: number) => {
      const date = new Date(now)
      date.setDate(date.getDate() - days)
      return date
    }

    const userList = [admin, manager, staff]
    const reasons = {
      'stock-in': ['New stock arrival', 'Supplier delivery', 'Restocking', 'Initial stock', 'Purchase order received'],
      'stock-out': ['Sales order', 'Customer order', 'Internal use', 'Office setup', 'Bulk purchase', 'Retail sale']
    }

    // Generate 60 days of realistic daily transaction history
    const HISTORY_DAYS = 60
    const productInventory: Record<string, number> = {}

    // Initialize starting inventory (2 months ago stock levels)
    products.forEach((product: any, index: number) => {
      const pattern = seedData.transactionPatterns[seedData.products[index].salesPattern]
      // Start with higher inventory to support the sales pattern
      productInventory[product._id.toString()] = Math.floor(pattern.avgDailyDemand * 30) + product.currentStock
    })

    console.log('Generating 60 days of transaction history...')

    for (let dayOffset = HISTORY_DAYS; dayOffset >= 0; dayOffset--) {
      const transactionDate = daysAgo(dayOffset)

      // Generate transactions for each product
      for (let i = 0; i < products.length; i++) {
        const product = products[i]
        const productData = seedData.products[i]
        const pattern = seedData.transactionPatterns[productData.salesPattern]
        const productId = product._id.toString()

        // Calculate demand for this day based on pattern
        let dailyDemand = pattern.avgDailyDemand

        // Apply trend (cumulative over time)
        if (pattern.trend) {
          const trendEffect = pattern.trend * (HISTORY_DAYS - dayOffset) / 30 // monthly trend
          dailyDemand = dailyDemand * (1 + trendEffect)
        }

        // Apply seasonal variation (if applicable)
        if (pattern.seasonal) {
          const seasonalPhase = ((HISTORY_DAYS - dayOffset) / 30) * Math.PI // semi-monthly cycle
          const seasonalMultiplier = 1 + 0.5 * Math.sin(seasonalPhase)
          dailyDemand = dailyDemand * seasonalMultiplier
        }

        // Apply volatility (random variation)
        const volatilityFactor = 1 + (Math.random() - 0.5) * 2 * pattern.volatility
        dailyDemand = Math.max(0, Math.round(dailyDemand * volatilityFactor))

        // Skip if no demand for this day
        if (dailyDemand === 0) continue

        // Check if we need to restock
        const currentStock = productInventory[productId] || 0

        // Restock when inventory gets low (below reorder level)
        if (currentStock < product.reorderLevel * 2) {
          const restockQuantity = Math.floor(pattern.avgDailyDemand * 20) // 20 days worth
          const restockDate = new Date(transactionDate)
          restockDate.setHours(8, 0, 0, 0) // Morning delivery

          transactionsData.push({
            product: product._id,
            transactionType: 'stock-in',
            quantity: restockQuantity,
            reason: reasons['stock-in'][Math.floor(Math.random() * reasons['stock-in'].length)],
            performedBy: userList[Math.floor(Math.random() * userList.length)]._id,
            date: restockDate,
            balanceAfter: currentStock + restockQuantity,
          })

          productInventory[productId] = currentStock + restockQuantity
        }

        // Process stock-out transactions throughout the day
        // Split demand into multiple transactions for realism
        const numTransactions = Math.max(1, Math.floor(dailyDemand / 3) + (Math.random() > 0.5 ? 1 : 0))
        const quantitiesPerTransaction = []

        // Distribute demand across transactions
        let remainingDemand = dailyDemand
        for (let t = 0; t < numTransactions; t++) {
          if (t === numTransactions - 1) {
            quantitiesPerTransaction.push(remainingDemand)
          } else {
            const qty = Math.max(1, Math.floor(remainingDemand / (numTransactions - t) * (0.5 + Math.random())))
            quantitiesPerTransaction.push(qty)
            remainingDemand -= qty
          }
        }

        // Create stock-out transactions
        quantitiesPerTransaction.forEach((quantity, txIndex) => {
          const transactionTime = new Date(transactionDate)
          transactionTime.setHours(9 + Math.floor((txIndex / numTransactions) * 8), Math.floor(Math.random() * 60), 0, 0)

          const newBalance = (productInventory[productId] || 0) - quantity
          productInventory[productId] = Math.max(0, newBalance)

          transactionsData.push({
            product: product._id,
            transactionType: 'stock-out',
            quantity,
            reason: reasons['stock-out'][Math.floor(Math.random() * reasons['stock-out'].length)],
            performedBy: userList[Math.floor(Math.random() * userList.length)]._id,
            date: transactionTime,
            balanceAfter: Math.max(0, newBalance),
          })
        })
      }
    }

    // Sort transactions by date
    transactionsData.sort((a, b) => a.date.getTime() - b.date.getTime())

    const transactionsResult = await Transaction.create(transactionsData)
    const transactions: any[] = Array.isArray(transactionsResult) ? transactionsResult : [transactionsResult]
    console.log(`Created ${transactions.length} transactions across last ${HISTORY_DAYS} days`)
    console.log('Transaction breakdown:')
    const stockIns = transactions.filter(t => t.transactionType === 'stock-in').length
    const stockOuts = transactions.filter(t => t.transactionType === 'stock-out').length
    console.log(`  - Stock-in: ${stockIns}`)
    console.log(`  - Stock-out: ${stockOuts}`)

    // Create sample purchase orders with different statuses
    const purchaseOrdersData: any[] = []
    const poStatuses = ['pending-approval', 'approved', 'ordered', 'partially-received', 'received', 'closed']

    for (let i = 0; i < 15; i++) {
      const supplier = suppliers[Math.floor(Math.random() * suppliers.length)]
      const numItems = Math.floor(Math.random() * 3) + 1
      const items = []

      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)]
        const quantity = Math.floor(Math.random() * 50) + 10
        const receivedQty = i < 3 ? 0 : i < 8 ? Math.floor(quantity * 0.5) : quantity

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

    const purchaseOrdersResult = await PurchaseOrder.create(purchaseOrdersData)
    const purchaseOrders: any[] = Array.isArray(purchaseOrdersResult) ? purchaseOrdersResult : [purchaseOrdersResult]
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
