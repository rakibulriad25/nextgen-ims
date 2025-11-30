import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getForecasts } from '@/lib/actions/forecast'
import { AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { StockoutRiskIndicator } from '@/components/forecasting/confidence-indicator'

export async function ForecastSummaryCard() {
  const result = await getForecasts({ status: 'active' })
  const forecasts = result.success ? result.forecasts : []

  const highRiskForecasts = forecasts.filter(f => f.stockoutRisk === 'high')
  const mediumRiskForecasts = forecasts.filter(f => f.stockoutRisk === 'medium')

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Demand Forecasting</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {forecasts.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-4">
              No active forecasts. Start predicting demand to optimize inventory.
            </p>
            <Link href="/dashboard/forecasting">
              <Button size="sm">
                Generate Forecast
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Total Forecasts</p>
                <p className="text-2xl font-bold">{forecasts.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{highRiskForecasts.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Medium Risk</p>
                <p className="text-2xl font-bold text-yellow-600">{mediumRiskForecasts.length}</p>
              </div>
            </div>

            {highRiskForecasts.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">
                      {highRiskForecasts.length} Product{highRiskForecasts.length > 1 ? 's' : ''} at High Stockout Risk
                    </p>
                    <div className="mt-2 space-y-1">
                      {highRiskForecasts.slice(0, 3).map((forecast: any) => (
                        <div key={forecast._id} className="flex items-center justify-between text-xs">
                          <span className="text-red-800">{forecast.product?.name}</span>
                          <StockoutRiskIndicator risk={forecast.stockoutRisk} />
                        </div>
                      ))}
                      {highRiskForecasts.length > 3 && (
                        <p className="text-xs text-red-700 mt-1">
                          +{highRiskForecasts.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Link href="/dashboard/forecasting">
              <Button variant="outline" size="sm" className="w-full">
                View All Forecasts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
