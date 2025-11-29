import { ArrowRight, BarChart3, CheckCircle2, Package, Shield, Zap } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Package className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">Inventory Pro</span>
          </div>
          <Link
            href="/dashboard"
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Login to Dashboard
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Streamline Your Inventory
            <span className="block text-blue-600">Management</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Take control of your stock with powerful analytics, real-time tracking, and intuitive
            management tools designed for modern businesses.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Package className="h-10 w-10 text-blue-600" />}
            title="Product Management"
            description="Easily manage products, categories, and inventory levels with an intuitive interface."
          />
          <FeatureCard
            icon={<BarChart3 className="h-10 w-10 text-blue-600" />}
            title="Real-time Analytics"
            description="Track sales, monitor stock levels, and gain insights with powerful analytics dashboards."
          />
          <FeatureCard
            icon={<Shield className="h-10 w-10 text-blue-600" />}
            title="Secure & Reliable"
            description="Your data is protected with enterprise-grade security and regular backups."
          />
          <FeatureCard
            icon={<Zap className="h-10 w-10 text-blue-600" />}
            title="Fast Performance"
            description="Lightning-fast operations with optimized database queries and caching."
          />
          <FeatureCard
            icon={<CheckCircle2 className="h-10 w-10 text-blue-600" />}
            title="Easy to Use"
            description="Clean, modern interface designed for efficiency and ease of use."
          />
          <FeatureCard
            icon={<Package className="h-10 w-10 text-blue-600" />}
            title="Inventory Tracking"
            description="Monitor stock movements, set reorder points, and automate alerts."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-2xl bg-linear-to-r from-blue-600 to-blue-700 px-8 py-16 text-center shadow-2xl">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to optimize your inventory?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
            Join businesses using Inventory Pro to streamline operations and boost efficiency.
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-base font-semibold text-blue-600 shadow-lg transition-all hover:bg-slate-50 hover:shadow-xl"
          >
            Access Dashboard
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-center text-sm text-slate-600">
            © {new Date().getFullYear()} Inventory Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="text-sm leading-6 text-slate-600">{description}</p>
    </div>
  )
}
