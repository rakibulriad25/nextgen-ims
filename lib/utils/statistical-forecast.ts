import type { IHistoricalDemandData, IDemandStatistics } from '@/types'

/**
 * Generate a statistical forecast when AI cannot be used (insufficient data)
 * Uses simple moving average and trend analysis
 */
export function generateStatisticalForecast(
  dailyDemand: IHistoricalDemandData[],
  statistics: IDemandStatistics,
  forecastDays: number,
  currentStock: number,
  reorderLevel: number
) {
  const predictions: Array<{
    date: string
    demand: number
    confidence: 'low' | 'medium' | 'high'
    upperBound: number
    lowerBound: number
  }> = []

  // Use average daily demand as baseline
  const baselineDemand = statistics.averageDailyDemand || 0

  // Apply trend adjustment
  let trendMultiplier = 1.0
  if (statistics.trend === 'increasing') {
    trendMultiplier = 1.05 // 5% increase per forecast period
  } else if (statistics.trend === 'decreasing') {
    trendMultiplier = 0.95 // 5% decrease per forecast period
  }

  // Confidence is low for statistical forecasts
  const baseConfidence = statistics.daysWithData >= 3 ? 'medium' : 'low'

  // Generate daily predictions
  const startDate = new Date()
  startDate.setHours(0, 0, 0, 0)

  for (let i = 1; i <= forecastDays; i++) {
    const forecastDate = new Date(startDate)
    forecastDate.setDate(forecastDate.getDate() + i)

    // Apply trend over time
    const trendFactor = Math.pow(trendMultiplier, i / forecastDays)
    let predictedDemand = Math.round(baselineDemand * trendFactor)

    // Add some variability based on volatility
    const variability = statistics.volatility || 0.3
    const upperBound = Math.round(predictedDemand * (1 + variability))
    const lowerBound = Math.max(0, Math.round(predictedDemand * (1 - variability)))

    predictions.push({
      date: forecastDate.toISOString().split('T')[0],
      demand: predictedDemand,
      confidence: baseConfidence as 'low' | 'medium' | 'high',
      upperBound,
      lowerBound,
    })
  }

  const totalPredictedDemand = predictions.reduce((sum, p) => sum + p.demand, 0)

  // Calculate stockout risk
  let stockoutRisk: 'low' | 'medium' | 'high' = 'low'
  const daysUntilStockout = currentStock / (baselineDemand || 1)

  if (daysUntilStockout < forecastDays * 0.3) {
    stockoutRisk = 'high'
  } else if (daysUntilStockout < forecastDays * 0.6) {
    stockoutRisk = 'medium'
  }

  // Simple reorder recommendations
  const recommendedReorderPoint = Math.round(baselineDemand * 14) // 2 weeks of demand
  const recommendedOrderQuantity = Math.round(baselineDemand * 30) // 1 month of demand

  // Generate insights
  let insights = `Statistical forecast based on ${statistics.daysWithData} days of historical data. `

  if (statistics.daysWithData < 7) {
    insights += `Limited data available - forecast has lower confidence. `
  }

  insights += `Average daily demand: ${baselineDemand.toFixed(1)} units. `
  insights += `Trend: ${statistics.trend}. `

  if (stockoutRisk === 'high') {
    insights += `⚠️ High stockout risk detected. Immediate reordering of ${recommendedOrderQuantity} units recommended.`
  } else if (stockoutRisk === 'medium') {
    insights += `Moderate stockout risk. Consider reordering ${recommendedOrderQuantity} units soon.`
  } else {
    insights += `Stock levels appear adequate for the forecast period.`
  }

  return {
    predictions,
    insights,
    confidence: statistics.daysWithData >= 7 ? 0.6 : statistics.daysWithData >= 3 ? 0.4 : 0.2,
    seasonalPattern: undefined,
    recommendedReorderPoint,
    recommendedOrderQuantity,
    stockoutRisk,
  }
}
