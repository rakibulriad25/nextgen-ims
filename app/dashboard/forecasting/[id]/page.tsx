import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getForecast } from '@/lib/actions/forecast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ForecastChart } from '@/components/forecasting/forecast-chart'
import { ForecastInsights } from '@/components/forecasting/forecast-insights'
import { RecommendationCard } from '@/components/forecasting/recommendation-card'
import { ConfidenceIndicator, StockoutRiskIndicator } from '@/components/forecasting/confidence-indicator'
import { ArrowLeft, Calendar, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function ForecastDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  const { id } = await params
  const result = await getForecast(id)

  if (result.error || !result.forecast) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/forecasting">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Forecasts
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Forecast not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const forecast = result.forecast

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/forecasting">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forecasts
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold">{forecast.product?.name}</h1>
        <p className="text-muted-foreground">
          SKU: {forecast.product?.sku} | Category: {forecast.product?.category?.name || 'N/A'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Forecast Period
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forecast.forecastPeriod} days</div>
            <p className="text-xs text-muted-foreground">
              Based on {forecast.historicalPeriod} days of data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Predicted Demand
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forecast.totalPredictedDemand}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {forecast.averageDailyDemand?.toFixed(1)} units/day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Peak Demand
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forecast.peakDemandValue}</div>
            <p className="text-xs text-muted-foreground">
              on {format(new Date(forecast.peakDemandDate), 'MMM dd, yyyy')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ForecastChart predictions={forecast.predictions} />

          <ForecastInsights
            insights={forecast.aiInsights}
            seasonalPattern={forecast.seasonalPattern}
          />

          <Card>
            <CardHeader>
              <CardTitle>Daily Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-muted/50">
                      <tr className="border-b">
                        <th className="h-10 px-4 text-left text-sm font-medium">Date</th>
                        <th className="h-10 px-4 text-left text-sm font-medium">Predicted</th>
                        <th className="h-10 px-4 text-left text-sm font-medium">Lower</th>
                        <th className="h-10 px-4 text-left text-sm font-medium">Upper</th>
                        <th className="h-10 px-4 text-left text-sm font-medium">Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecast.predictions.map((pred: any, idx: number) => (
                        <tr key={idx} className="border-b">
                          <td className="px-4 py-2 text-sm">
                            {format(new Date(pred.date), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-4 py-2 text-sm font-medium">
                            {pred.predictedDemand}
                          </td>
                          <td className="px-4 py-2 text-sm text-muted-foreground">
                            {pred.lowerBound}
                          </td>
                          <td className="px-4 py-2 text-sm text-muted-foreground">
                            {pred.upperBound}
                          </td>
                          <td className="px-4 py-2">
                            <ConfidenceIndicator level={pred.confidenceLevel} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Forecast Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">AI Confidence</span>
                <ConfidenceIndicator
                  level={
                    forecast.aiConfidence >= 0.7 ? 'high' :
                    forecast.aiConfidence >= 0.5 ? 'medium' : 'low'
                  }
                  percentage={forecast.aiConfidence}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Stockout Risk</span>
                <StockoutRiskIndicator risk={forecast.stockoutRisk} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Generated</span>
                <span className="text-sm font-medium">
                  {format(new Date(forecast.generatedAt), 'MMM dd, yyyy')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Generated By</span>
                <span className="text-sm font-medium">
                  {forecast.generatedBy?.name || 'Unknown'}
                </span>
              </div>
            </CardContent>
          </Card>

          <RecommendationCard
            currentStock={forecast.product?.currentStock || 0}
            reorderLevel={forecast.product?.reorderLevel || 0}
            recommendedReorderPoint={forecast.recommendedReorderPoint}
            recommendedOrderQuantity={forecast.recommendedOrderQuantity}
            stockoutRisk={forecast.stockoutRisk}
          />
        </div>
      </div>
    </div>
  )
}
