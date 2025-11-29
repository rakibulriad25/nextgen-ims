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
    ])
    console.log('Cleared existing data')

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
    })
    console.log('Created admin user')

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

    // Create transactions
    const transactions = await Transaction.create([
      {
        product: products[0]._id,
        transactionType: 'stock-in',
        quantity: 15,
        reason: 'Initial stock',
        performedBy: admin._id,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        balanceAfter: 15,
      },
      {
        product: products[1]._id,
        transactionType: 'stock-in',
        quantity: 60,
        reason: 'Initial stock',
        performedBy: admin._id,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        balanceAfter: 60,
      },
      {
        product: products[1]._id,
        transactionType: 'stock-out',
        quantity: 10,
        reason: 'Sales order #1001',
        performedBy: admin._id,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        balanceAfter: 50,
      },
      {
        product: products[3]._id,
        transactionType: 'stock-in',
        quantity: 10,
        reason: 'Initial stock',
        performedBy: admin._id,
        date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        balanceAfter: 10,
      },
      {
        product: products[3]._id,
        transactionType: 'stock-out',
        quantity: 7,
        reason: 'Office setup',
        performedBy: admin._id,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        balanceAfter: 3,
      },
    ])
    console.log('Created transactions')

    console.log('\n=== Seed completed successfully! ===')
    console.log('\nLogin credentials:')
    console.log('Email: admin@example.com')
    console.log('Password: admin123')
    console.log('\nDatabase contains:')
    console.log('- 1 admin user')
    console.log(`- ${categories.length} categories`)
    console.log(`- ${suppliers.length} suppliers`)
    console.log(`- ${products.length} products`)
    console.log(`- ${transactions.length} transactions`)

    await mongoose.connection.close()
    console.log('\nDatabase connection closed')
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

seed()
