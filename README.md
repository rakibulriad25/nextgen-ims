# Inventory Management System

A modern, full-featured inventory management system built with Next.js 14, TypeScript, MongoDB, and Tailwind CSS.

## Features

- **Authentication**: Secure login with NextAuth.js and bcrypt password hashing
- **Dashboard**: Real-time metrics, low stock alerts, and inventory value tracking
- **Products Management**: Full CRUD operations with search, filters, and low stock badges
- **Categories Management**: Organize products into categories
- **Suppliers Management**: Manage supplier information and contacts
- **Transactions**: Track stock-in, stock-out, and inventory adjustments
- **Reports**: Generate and print inventory status, low stock, and transaction reports
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js v5
- **UI Components**: Radix UI + Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner (toast notifications)
- **Printing**: react-to-print

## Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or MongoDB Atlas)

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**

   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/inventory-management
   # Or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/inventory-management

   # NextAuth Configuration
   AUTH_SECRET=your-super-secret-key-here-change-this-in-production
   AUTH_URL=http://localhost:3000
   ```

   **Generate AUTH_SECRET**:
   ```bash
   openssl rand -base64 32
   ```

3. **Seed the database**
   ```bash
   npm run seed
   ```

   This will create:
   - Admin user (email: admin@example.com, password: admin123)
   - 4 categories
   - 3 suppliers
   - 6 products
   - 5 sample transactions

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Default Login Credentials

After running the seed script:

- **Email**: admin@example.com
- **Password**: admin123

**Important**: Change these credentials in production!

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with sample data

## Features Overview

### Dashboard
- Total products count
- Low stock alerts
- Inventory value calculation
- Recent transactions
- Low stock product list

### Products Module
- Create, read, update, delete products
- Search by name or SKU
- Category and supplier assignment
- Stock level tracking
- Reorder level alerts
- Multiple unit types (pieces, kg, liters)
- Active/inactive status

### Categories Module
- Simple CRUD operations
- Product categorization

### Suppliers Module
- Supplier information management
- Contact details
- Active/inactive status

### Transactions Module
- Stock-in (receiving inventory)
- Stock-out (selling/removing inventory)
- Adjustments (inventory corrections)
- Transaction history with filters
- Automatic stock updates

### Reports Module
- Inventory status report
- Low stock alerts report
- Transaction history report
- Print functionality for all reports

## Troubleshooting

**MongoDB Connection Issues**:
- Verify MongoDB is running locally or connection string is correct
- Check firewall settings for MongoDB Atlas

**Authentication Issues**:
- Ensure AUTH_SECRET is set in .env.local
- Clear browser cookies and try again

**Build Errors**:
- Delete `.next` folder and `node_modules`
- Run `npm install` again
- Try `npm run build`

## License

MIT License
