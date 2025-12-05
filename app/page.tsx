import { auth } from '@/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Package,
  BarChart3,
  ShoppingCart,
  TrendingUp,
  Clock,
  Shield,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NextGen IMS - AI-Driven Inventory Management System',
  description: 'Streamline stock control with predictive analytics, real-time tracking, and automated purchase orders. Built for modern businesses.',
}

export default async function Home() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Package className="h-8 w-8 text-foreground" />
            <span className="text-xl font-bold text-foreground">NextGen IMS</span>
          </div>
          <Link href={session ? '/dashboard' : '/login'}>
            <Button variant={session ? 'default' : 'outline'}>
              {session ? 'Dashboard' : 'Login'}
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="text-center">
          <Badge variant="secondary" className="mb-4">
            AI-Powered Inventory Management
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Intelligent Inventory
            <span className="block text-slate-600">Management System</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Streamline stock control with predictive analytics, real-time tracking, and automated
            purchase orders. Built for modern businesses.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href={session ? '/dashboard' : '/login'}>
              <Button size="lg" className="gap-2">
                {session ? 'Go to Dashboard' : 'Get Started'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900">Core Features</h2>
          <p className="mt-3 text-slate-600">
            Everything you need to manage inventory efficiently
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Package className="h-10 w-10 text-slate-700 mb-2" />
              <CardTitle>Product Management</CardTitle>
              <CardDescription>
                Manage products, categories, and suppliers with an intuitive interface and SKU tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-slate-700 mb-2" />
              <CardTitle>Real-time Analytics</CardTitle>
              <CardDescription>
                Track stock movements, monitor inventory value, and visualize trends with interactive charts
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <ShoppingCart className="h-10 w-10 text-slate-700 mb-2" />
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>
                Create, approve, and track purchase orders with multi-stage workflows and receipt management
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-slate-700 mb-2" />
              <CardTitle>Stock Tracking</CardTitle>
              <CardDescription>
                Monitor stock levels, set reorder points, and receive low-stock alerts automatically
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="h-10 w-10 text-slate-700 mb-2" />
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Complete audit trail of all stock movements with user attribution and balance tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-slate-700 mb-2" />
              <CardTitle>Role-Based Access</CardTitle>
              <CardDescription>
                Secure authentication with admin, manager, and staff roles for controlled access
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              Built for Efficiency
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-slate-700 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-900">Automated Workflows</h3>
                  <p className="text-slate-600">
                    Reduce manual work with automated reorder alerts and purchase order generation
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-slate-700 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-900">Data-Driven Decisions</h3>
                  <p className="text-slate-600">
                    Make informed purchasing decisions with comprehensive analytics and reporting
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-slate-700 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-900">Scalable Architecture</h3>
                  <p className="text-slate-600">
                    Built with Next.js and MongoDB to handle inventory of any size
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Card className="border-2">
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Products & Categories</span>
                <Badge variant="outline">Unlimited</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Supplier Management</span>
                <Badge variant="outline">Multi-supplier</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Transaction History</span>
                <Badge variant="outline">Complete audit</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">User Roles</span>
                <Badge variant="outline">Admin/Manager/Staff</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Real-time Updates</span>
                <Badge variant="outline">Live sync</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <Card className="border-2">
          <CardContent className="py-16 text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Ready to optimize your inventory?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
              Start managing your stock efficiently with NextGen IMS
            </p>
            <Link href={session ? '/dashboard' : '/login'}>
              <Button size="lg" className="mt-8 gap-2">
                {session ? 'Access Dashboard' : 'Get Started'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-center text-sm text-slate-600">
            © {new Date().getFullYear()} NextGen IMS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
