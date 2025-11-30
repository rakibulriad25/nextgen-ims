import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getForecasts, getForecastStats } from '@/lib/actions/forecast'
import { getProducts } from '@/lib/actions/product'
import { TrendingUp, AlertTriangle, Target, Package } from 'lucide-react'
import { ForecastTable } from './forecast-table'
import { GenerateForecastDialog } from '@/components/forecasting/generate-forecast-dialog'
import { BatchForecastDialog } from '@/components/forecasting/batch-forecast-dialog'

export default async function ForecastingPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  const [forecastsResult, statsResult, productsResult] = await Promise.all([
    getForecasts({ status: 'active' }),
    getForecastStats(),
    getProducts(),
  ])

  const forecasts = forecastsResult.success ? forecastsResult.forecasts : []
  const stats = statsResult.success ? statsResult.stats : null
  const products = productsResult.success ? productsResult.products : []

  const userRole = session?.user?.role || ''
  const canGenerateForecast = userRole === 'admin' || userRole === 'manager'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Demand Forecasting</h1>
          <p className="text-muted-foreground">
            AI-powered demand predictions to optimize inventory
          </p>
        </div>
        {canGenerateForecast && (
          <div className="flex gap-2">
            <GenerateForecastDialog products={products} />
            <BatchForecastDialog products={products} />
          </div>
        )}
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Forecasts
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalForecasts}</div>
              <p className="text-xs text-muted-foreground">
                Active forecasts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                High Risk Products
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.highRiskForecasts}</div>
              <p className="text-xs text-muted-foreground">
                Stockout risk detected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Medium Risk Products
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.mediumRiskForecasts}</div>
              <p className="text-xs text-muted-foreground">
                Monitor closely
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Accuracy
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.avgAccuracy ? `${stats.avgAccuracy}%` : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Historical accuracy
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active Forecasts</CardTitle>
          <CardDescription>
            View and manage demand forecasts for your products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForecastTable forecasts={forecasts} />
        </CardContent>
      </Card>
    </div>
  )
}
