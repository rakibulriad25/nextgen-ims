import type { IHistoricalDemandData, IDemandStatistics } from '@/types'
import Transaction from '@/lib/models/Transaction'
import type { Types } from 'mongoose'

export async function aggregateHistoricalDemand(
  productId: string | Types.ObjectId,
  days: number
): Promise<{ dailyDemand: IHistoricalDemandData[], statistics: IDemandStatistics }> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)

  // Aggregate stock-out transactions (sales/usage) by day
  const dailyDemandResult = await Transaction.aggregate([
    {
      $match: {
        product: productId,
        transactionType: 'stock-out',
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        totalQuantity: { $sum: '$quantity' },
        transactionCount: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ])

  const dailyDemand: IHistoricalDemandData[] = dailyDemandResult.map(d => ({
    date: d._id,
    quantity: d.totalQuantity,
    transactionCount: d.transactionCount
  }))

  // Fill in missing days with zero demand
  const filledDailyDemand = fillMissingDays(dailyDemand, days)

  // Calculate statistics
  const statistics = calculateStatistics(filledDailyDemand)

  return {
    dailyDemand: filledDailyDemand,
    statistics
  }
}

function fillMissingDays(data: IHistoricalDemandData[], days: number): IHistoricalDemandData[] {
  const result: IHistoricalDemandData[] = []
  const dataMap = new Map(data.map(d => [d.date, d]))

  const endDate = new Date()
  endDate.setHours(0, 0, 0, 0)

  for (let i = days - 1; i >= 0; i--) {
    const currentDate = new Date(endDate)
    currentDate.setDate(currentDate.getDate() - i)
    const dateString = currentDate.toISOString().split('T')[0]

    result.push(
      dataMap.get(dateString) || {
        date: dateString,
        quantity: 0,
        transactionCount: 0
      }
    )
  }

  return result
}

function calculateStatistics(data: IHistoricalDemandData[]): IDemandStatistics {
  const quantities = data.map(d => d.quantity)
  const totalDemand = quantities.reduce((sum, q) => sum + q, 0)
  const daysWithData = data.filter(d => d.quantity > 0).length

  // Avoid division by zero
  const averageDailyDemand = data.length > 0 ? totalDemand / data.length : 0

  // Find peak demand
  let peakDemand = 0
  let peakDate = data[0]?.date || new Date().toISOString().split('T')[0]

  for (const day of data) {
    if (day.quantity > peakDemand) {
      peakDemand = day.quantity
      peakDate = day.date
    }
  }

  // Calculate trend
  const trend = calculateTrend(data)

  // Calculate volatility (coefficient of variation)
  const stdDev = calculateStandardDeviation(quantities)
  const volatility = averageDailyDemand > 0 ? stdDev / averageDailyDemand : 0

  return {
    totalDemand,
    averageDailyDemand,
    peakDemand,
    peakDate,
    trend,
    volatility,
    daysWithData
  }
}

function calculateTrend(data: IHistoricalDemandData[]): 'increasing' | 'decreasing' | 'stable' {
  if (data.length < 2) return 'stable'

  // Split data into two halves and compare averages
  const midpoint = Math.floor(data.length / 2)
  const firstHalf = data.slice(0, midpoint)
  const secondHalf = data.slice(midpoint)

  const firstAvg = firstHalf.reduce((sum, d) => sum + d.quantity, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, d) => sum + d.quantity, 0) / secondHalf.length

  // Use 10% threshold to avoid noise
  const threshold = firstAvg * 0.1

  if (secondAvg > firstAvg + threshold) return 'increasing'
  if (secondAvg < firstAvg - threshold) return 'decreasing'
  return 'stable'
}

function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2))
  const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length

  return Math.sqrt(variance)
}

export function calculateConfidenceLevel(
  volatility: number,
  daysWithData: number,
  historicalPeriod: number
): 'low' | 'medium' | 'high' {
  // Low confidence if insufficient data
  if (daysWithData < historicalPeriod * 0.3) return 'low'

  // Low confidence if high volatility
  if (volatility > 1.0) return 'low'

  // Medium confidence if moderate volatility or moderate data
  if (volatility > 0.5 || daysWithData < historicalPeriod * 0.6) return 'medium'

  // High confidence if stable and sufficient data
  return 'high'
}

export function calculateConfidenceIntervals(
  prediction: number,
  volatility: number,
  confidenceLevel: 'low' | 'medium' | 'high'
): { upperBound: number, lowerBound: number } {
  // Adjust interval width based on confidence level
  const widthMultiplier = {
    low: 2.0,
    medium: 1.5,
    high: 1.0
  }[confidenceLevel]

  // Use volatility to determine interval width
  const stdDev = prediction * Math.max(volatility, 0.2) // Minimum 20% variation
  const intervalWidth = stdDev * 1.645 * widthMultiplier // 90% confidence interval

  return {
    upperBound: Math.round(prediction + intervalWidth),
    lowerBound: Math.max(0, Math.round(prediction - intervalWidth))
  }
}
