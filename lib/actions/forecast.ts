'use server'

import { auth } from '@/auth'
import { connectDB } from '@/lib/db/mongoose'
import DemandForecast from '@/lib/models/DemandForecast'
import Product from '@/lib/models/Product'
import Category from '@/lib/models/Category'
import { aggregateHistoricalDemand } from '@/lib/utils/forecast-calculations'
import { generateForecastWithAI } from '@/lib/ai/gemini-client'
import { generateStatisticalForecast } from '@/lib/utils/statistical-forecast'
import type { IAIForecastRequest, IPopulatedDemandForecast } from '@/types'
import { generateForecastSchema } from '@/lib/validations'

export async function generateForecast(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    // Only managers and admins can generate forecasts
    if (!['admin', 'manager'].includes(session.user.role)) {
      return { error: 'Insufficient permissions' }
    }

    await connectDB()

    // Parse and validate input
    const rawData = {
      productId: formData.get('productId'),
      forecastPeriod: formData.get('forecastPeriod'),
      historicalPeriod: formData.get('historicalPeriod') || '90',
    }

    const validatedData = generateForecastSchema.parse(rawData)
    const { productId, forecastPeriod, historicalPeriod } = validatedData

    // Fetch product details
    const product = await Product.findById(productId).populate('category').populate('supplier')
    if (!product) {
      return { error: 'Product not found' }
    }

    // Aggregate historical demand data
    const { dailyDemand, statistics } = await aggregateHistoricalDemand(productId, historicalPeriod)

    // Check if there's ANY data at all
    if (statistics.daysWithData === 0 && statistics.totalDemand === 0) {
      return { error: 'No historical sales data found for this product.' }
    }

    let aiResponse
    let usedAI = true

    // Use AI if we have sufficient data (7+ days), otherwise use statistical method
    if (statistics.daysWithData >= 7) {
      try {
        // Prepare AI request
        const aiRequest: IAIForecastRequest = {
          productName: product.name,
          sku: product.sku,
          categoryName: product.category?.name || 'Uncategorized',
          currentStock: product.currentStock,
          reorderLevel: product.reorderLevel,
          historicalData: dailyDemand,
          statistics,
          forecastDays: forecastPeriod,
        }

        // Generate forecast using AI
        aiResponse = await generateForecastWithAI(aiRequest)
      } catch (error) {
        console.error('AI forecast failed, falling back to statistical method:', error)
        usedAI = false
        aiResponse = generateStatisticalForecast(
          dailyDemand,
          statistics,
          forecastPeriod,
          product.currentStock,
          product.reorderLevel
        )
      }
    } else {
      // Use statistical forecasting for limited data
      usedAI = false
      aiResponse = generateStatisticalForecast(
        dailyDemand,
        statistics,
        forecastPeriod,
        product.currentStock,
        product.reorderLevel
      )
    }

    // Calculate aggregate metrics from predictions
    const totalPredictedDemand = aiResponse.predictions.reduce((sum, p) => sum + p.demand, 0)
    const averageDailyDemand = totalPredictedDemand / aiResponse.predictions.length

    // Find peak demand
    const peakPrediction = aiResponse.predictions.reduce((max, p) =>
      p.demand > max.demand ? p : max
    , aiResponse.predictions[0])

    // Create forecast document
    const forecast = new DemandForecast({
      product: productId,
      forecastType: 'product',
      category: product.category?._id,
      forecastPeriod,
      historicalPeriod,
      predictions: aiResponse.predictions.map(p => ({
        date: new Date(p.date),
        predictedDemand: p.demand,
        confidenceLevel: p.confidence,
        upperBound: p.upperBound,
        lowerBound: p.lowerBound,
      })),
      totalPredictedDemand,
      averageDailyDemand,
      peakDemandDate: new Date(peakPrediction.date),
      peakDemandValue: peakPrediction.demand,
      aiModel: usedAI ? 'google/gemini-2.5-flash-lite' : 'statistical-forecast',
      aiConfidence: aiResponse.confidence,
      aiInsights: usedAI ? aiResponse.insights : `[Statistical Forecast] ${aiResponse.insights}`,
      recommendedReorderPoint: aiResponse.recommendedReorderPoint,
      recommendedOrderQuantity: aiResponse.recommendedOrderQuantity,
      stockoutRisk: aiResponse.stockoutRisk,
      generatedBy: session.user.id,
      generatedAt: new Date(),
      status: 'active',
    })

    await forecast.save()

    return { success: true, forecastId: forecast._id.toString() }
  } catch (error) {
    console.error('Error generating forecast:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to generate forecast',
    }
  }
}

export async function getForecasts(filters?: {
  productId?: string
  status?: 'active' | 'archived'
  stockoutRisk?: 'low' | 'medium' | 'high'
}) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    await connectDB()

    const query: Record<string, unknown> = {}

    if (filters?.productId) {
      query.product = filters.productId
    }
    if (filters?.status) {
      query.status = filters.status
    }
    if (filters?.stockoutRisk) {
      query.stockoutRisk = filters.stockoutRisk
    }

    const forecasts = await DemandForecast.find(query)
      .populate('product')
      .populate('category')
      .populate('generatedBy', 'name email')
      .sort({ generatedAt: -1 })
      .limit(100)
      .lean()

    return { success: true, forecasts: JSON.parse(JSON.stringify(forecasts)) }
  } catch (error) {
    console.error('Error fetching forecasts:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch forecasts',
    }
  }
}

export async function getForecast(forecastId: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    await connectDB()

    const forecast = await DemandForecast.findById(forecastId)
      .populate('product')
      .populate('category')
      .populate('generatedBy', 'name email')
      .lean()

    if (!forecast) {
      return { error: 'Forecast not found' }
    }

    return { success: true, forecast: JSON.parse(JSON.stringify(forecast)) }
  } catch (error) {
    console.error('Error fetching forecast:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch forecast',
    }
  }
}

export async function archiveForecast(forecastId: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    // Only managers and admins can archive forecasts
    if (!['admin', 'manager'].includes(session.user.role)) {
      return { error: 'Insufficient permissions' }
    }

    await connectDB()

    const forecast = await DemandForecast.findByIdAndUpdate(
      forecastId,
      { status: 'archived', updatedAt: new Date() },
      { new: true }
    )

    if (!forecast) {
      return { error: 'Forecast not found' }
    }

    return { success: true, message: 'Forecast archived successfully' }
  } catch (error) {
    console.error('Error archiving forecast:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to archive forecast',
    }
  }
}

export async function deleteForecast(forecastId: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    // Only admins can delete forecasts
    if (session.user.role !== 'admin') {
      return { error: 'Only admins can delete forecasts' }
    }

    await connectDB()

    const forecast = await DemandForecast.findByIdAndDelete(forecastId)

    if (!forecast) {
      return { error: 'Forecast not found' }
    }

    return { success: true, message: 'Forecast deleted successfully' }
  } catch (error) {
    console.error('Error deleting forecast:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to delete forecast',
    }
  }
}

export async function getForecastStats() {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    await connectDB()

    const totalForecasts = await DemandForecast.countDocuments({ status: 'active' })
    const highRiskForecasts = await DemandForecast.countDocuments({
      status: 'active',
      stockoutRisk: 'high'
    })
    const mediumRiskForecasts = await DemandForecast.countDocuments({
      status: 'active',
      stockoutRisk: 'medium'
    })

    // Calculate average accuracy (for forecasts that have accuracy data)
    const forecastsWithAccuracy = await DemandForecast.find({
      accuracy: { $exists: true }
    }).select('accuracy')

    const avgAccuracy = forecastsWithAccuracy.length > 0
      ? forecastsWithAccuracy.reduce((sum, f) => sum + (f.accuracy || 0), 0) / forecastsWithAccuracy.length
      : null

    return {
      success: true,
      stats: {
        totalForecasts,
        highRiskForecasts,
        mediumRiskForecasts,
        avgAccuracy: avgAccuracy ? (avgAccuracy * 100).toFixed(1) : null,
      }
    }
  } catch (error) {
    console.error('Error fetching forecast stats:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch stats',
    }
  }
}

export async function getProductForecasts(productId: string) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { error: 'Unauthorized' }
    }

    await connectDB()

    const forecasts = await DemandForecast.find({
      product: productId,
      status: 'active'
    })
      .populate('generatedBy', 'name email')
      .sort({ generatedAt: -1 })
      .limit(10)
      .lean()

    return { success: true, forecasts: JSON.parse(JSON.stringify(forecasts)) }
  } catch (error) {
    console.error('Error fetching product forecasts:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch product forecasts',
    }
  }
}
