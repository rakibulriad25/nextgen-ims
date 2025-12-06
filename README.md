# NextGen IMS

**AI-Driven Inventory System with Predictive Stock Analytics**

https://nextgen-ims.vercel.app/

A modern, full-featured inventory system built for businesses that need real-time tracking, automated workflows, and data-driven insights.

## Features

- **Product Management** - Manage products, categories, and suppliers with SKU tracking
- **AI-Powered Suggestions** - Google Gemini integration for product descriptions, category names, and transaction reasons
- **Real-time Analytics** - Track stock movements, monitor inventory value, and visualize trends
- **Purchase Orders** - Create, approve, and track orders with multi-stage workflows
- **Stock Tracking** - Monitor levels, set reorder points, and receive low-stock alerts
- **Transaction History** - Complete audit trail with user attribution and balance tracking
- **Role-Based Access** - Secure authentication with Admin, Manager, and Staff roles
- **Reports** - Generate and export inventory, transaction, and stock reports

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | MongoDB with Mongoose |
| Authentication | NextAuth.js v5 |
| AI | Vercel AI SDK + Google Gemini |
| UI Components | ShadCN UI + Radix UI |
| Styling | Tailwind CSS v4 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nextgen-ims.git
   cd nextgen-ims
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**

   Create a `.env.local` file:
   ```env
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/nextgen-ims

   # NextAuth
   AUTH_SECRET=your-secret-key
   AUTH_URL=http://localhost:3000

   # AI Gateway (Optional - for AI features)
   AI_GATEWAY_API_KEY=your-vercel-ai-gateway-key
   ```

   Generate AUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

4. **Seed the database**
   ```bash
   pnpm seed
   ```

5. **Run development server**
   ```bash
   pnpm dev
   ```

6. **Open** [http://localhost:3000](http://localhost:3000)

## Demo Credentials

After running the seed script, use these credentials to login:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password123 |
| Manager | manager@example.com | password123 |
| Staff | staff@example.com | password123 |

### Role Permissions

| Feature | Admin | Manager | Staff |
|---------|:-----:|:-------:|:-----:|
| Dashboard | ✓ | ✓ | ✓ |
| Products | ✓ | ✓ | ✓ |
| Categories | ✓ | ✓ | ✓ |
| Suppliers | ✓ | ✓ | ✓ |
| Transactions | ✓ | ✓ | ✓ |
| Purchase Orders | ✓ | ✓ | ✓ |
| Reports | ✓ | ✓ | ✓ |
| User Management | ✓ | ✓ | ✗ |

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run linter |
| `pnpm seed` | Seed database with sample data |

## Project Structure

```
nextgen-ims/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Dashboard and feature pages
│   ├── login/              # Authentication pages
│   └── api/                # API routes
├── components/             # React components
│   ├── ui/                 # ShadCN UI components
│   └── ...                 # Feature components
├── lib/
│   ├── actions/            # Server actions
│   ├── models/             # Mongoose models
│   └── db/                 # Database connection
├── scripts/                # Utility scripts
└── types/                  # TypeScript definitions
```

## License

MIT License

---

Built with Next.js and MongoDB ~ Credit: Rakibul Hassan
