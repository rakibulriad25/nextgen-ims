import type { Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password?: string // Optional for OAuth users
  role: 'admin' | 'manager' | 'staff'
  createdAt: Date
}

export interface IProduct extends Document {
  name: string
  sku: string
  description: string
  category: string
  supplier: string
  unitPrice: number
  costPrice: number
  reorderLevel: number
  currentStock: number
  unit: 'pieces' | 'kg' | 'liters'
  barcode?: string
  imageUrl?: string
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

export interface ICategory extends Document {
  name: string
  description: string
  iconUrl?: string
  createdAt: Date
}

export interface ISupplier extends Document {
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  logoUrl?: string
  status: 'active' | 'inactive'
  createdAt: Date
}

export interface ITransaction extends Document {
  product: string
  transactionType: 'stock-in' | 'stock-out' | 'adjustment'
  quantity: number
  reason: string
  performedBy: string
  notes?: string
  date: Date
  balanceAfter: number
}

export interface IPopulatedTransaction extends Omit<ITransaction, 'product'> {
  product: IProduct
}

export interface IWarehouse extends Document {
  name: string
  location: string
  capacity: number
  manager: string
  status: 'active' | 'inactive'
}

export interface IPurchaseOrderItem {
  product: string
  productName?: string
  sku?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  receivedQuantity: number
}

export interface IPurchaseOrder extends Document {
  poNumber: string
  supplier: string
  items: IPurchaseOrderItem[]
  status: 'draft' | 'pending-approval' | 'approved' | 'ordered' | 'partially-received' | 'received' | 'closed' | 'cancelled'
  orderDate: Date
  expectedDeliveryDate: Date
  actualDeliveryDate?: Date
  totalAmount: number
  notes?: string
  createdBy: string
  approvedBy?: string
  approvedAt?: Date
  cancelledBy?: string
  cancelledAt?: Date
  cancellationReason?: string
  createdAt: Date
  updatedAt: Date
}

export interface IPopulatedPurchaseOrder extends Omit<IPurchaseOrder, 'supplier' | 'createdBy' | 'approvedBy'> {
  supplier: ISupplier
  createdBy: IUser
  approvedBy?: IUser
}

export interface IGoodsReceipt extends Document {
  purchaseOrder: string
  receivedBy: string
  receivedDate: Date
  items: {
    product: string
    orderedQuantity: number
    receivedQuantity: number
    notes?: string
  }[]
  notes?: string
  createdAt: Date
}

export interface IForecastPrediction {
  date: Date
  predictedDemand: number
  confidenceLevel: 'low' | 'medium' | 'high'
  upperBound: number
  lowerBound: number
}

export interface IDemandForecast extends Document {
  product: string
  forecastType: 'product' | 'category'
  category?: string

  // Forecast parameters
  forecastPeriod: number // Days to forecast (7, 14, 30, 90)
  historicalPeriod: number // Days of historical data used

  // Forecast results
  predictions: IForecastPrediction[]

  // Aggregate metrics
  totalPredictedDemand: number
  averageDailyDemand: number
  peakDemandDate: Date
  peakDemandValue: number

  // AI model info
  aiModel: string // "google/gemini-2.5-flash-lite"
  aiConfidence: number // Overall confidence score (0-1)
  aiInsights: string // Natural language insights from AI

  // Recommendations
  recommendedReorderPoint: number
  recommendedOrderQuantity: number
  stockoutRisk: 'low' | 'medium' | 'high'

  // Metadata
  generatedBy: string
  generatedAt: Date
  status: 'active' | 'archived'
  accuracy?: number // Actual vs predicted (retroactive)

  createdAt: Date
  updatedAt: Date
}

export interface IPopulatedDemandForecast extends Omit<IDemandForecast, 'product' | 'category' | 'generatedBy'> {
  product: IProduct
  category?: ICategory
  generatedBy: IUser
}

export interface IHistoricalDemandData {
  date: string
  quantity: number
  transactionCount: number
}

export interface IDemandStatistics {
  totalDemand: number
  averageDailyDemand: number
  peakDemand: number
  peakDate: string
  trend: 'increasing' | 'decreasing' | 'stable'
  volatility: number
  daysWithData: number
}

export interface IAIForecastRequest {
  productName: string
  sku: string
  categoryName: string
  currentStock: number
  reorderLevel: number
  historicalData: IHistoricalDemandData[]
  statistics: IDemandStatistics
  forecastDays: number
}

export interface IAIForecastResponse {
  predictions: Array<{
    date: string
    demand: number
    confidence: 'low' | 'medium' | 'high'
    upperBound: number
    lowerBound: number
  }>
  insights: string
  confidence: number
  seasonalPattern?: string
  recommendedReorderPoint: number
  recommendedOrderQuantity: number
  stockoutRisk: 'low' | 'medium' | 'high'
}
