import type { IDemandForecast } from '@/types'
import mongoose, { Schema, type Model } from 'mongoose'

const ForecastPredictionSchema = new Schema({
  date: { type: Date, required: true },
  predictedDemand: { type: Number, required: true },
  confidenceLevel: { type: String, enum: ['low', 'medium', 'high'], required: true },
  upperBound: { type: Number, required: true },
  lowerBound: { type: Number, required: true },
}, { _id: false })

const DemandForecastSchema = new Schema<IDemandForecast>({
  product: { type: String, ref: 'Product', required: true },
  forecastType: { type: String, enum: ['product', 'category'], default: 'product' },
  category: { type: String, ref: 'Category' },

  // Forecast parameters
  forecastPeriod: { type: Number, required: true },
  historicalPeriod: { type: Number, required: true },

  // Forecast results
  predictions: [ForecastPredictionSchema],

  // Aggregate metrics
  totalPredictedDemand: { type: Number, required: true },
  averageDailyDemand: { type: Number, required: true },
  peakDemandDate: { type: Date, required: true },
  peakDemandValue: { type: Number, required: true },

  // AI model info
  aiModel: { type: String, required: true, default: 'google/gemini-2.5-flash-lite' },
  aiConfidence: { type: Number, required: true, min: 0, max: 1 },
  aiInsights: { type: String, required: true },

  // Recommendations
  recommendedReorderPoint: { type: Number, required: true },
  recommendedOrderQuantity: { type: Number, required: true },
  stockoutRisk: { type: String, enum: ['low', 'medium', 'high'], required: true },

  // Metadata
  generatedBy: { type: String, ref: 'User', required: true },
  generatedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  accuracy: { type: Number, min: 0, max: 1 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Index for better query performance
DemandForecastSchema.index({ product: 1, generatedAt: -1 })
DemandForecastSchema.index({ status: 1 })
DemandForecastSchema.index({ stockoutRisk: 1 })

const DemandForecast: Model<IDemandForecast> =
  mongoose.models.DemandForecast || mongoose.model<IDemandForecast>('DemandForecast', DemandForecastSchema)

export default DemandForecast
