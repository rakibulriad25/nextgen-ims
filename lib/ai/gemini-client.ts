import { streamText } from 'ai'
import type { IAIForecastRequest, IAIForecastResponse } from '@/types'
import { aiForecastResponseSchema } from '@/lib/validations'

const AI_GATEWAY_API_KEY = process.env.AI_GATEWAY_API_KEY

if (!AI_GATEWAY_API_KEY) {
  throw new Error('AI_GATEWAY_API_KEY environment variable is not set')
}

export async function generateForecastWithAI(
  request: IAIForecastRequest
): Promise<IAIForecastResponse> {
  const prompt = buildForecastPrompt(request)

  try {
    const result = streamText({
      model: 'google/gemini-2.5-flash-lite',
      prompt,
    })

    // Collect the full response
    let fullResponse = ''
    for await (const textPart of result.textStream) {
      fullResponse += textPart
    }

    // Extract JSON from response (handle markdown code blocks if present)
    const jsonMatch = fullResponse.match(/```json\n?([\s\S]*?)\n?```/) ||
                     fullResponse.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response')
    }

    const jsonString = jsonMatch[1] || jsonMatch[0]
    const parsedResponse = JSON.parse(jsonString)

    // Validate response structure with Zod
    const validatedResponse = aiForecastResponseSchema.parse(parsedResponse)

    return validatedResponse
  } catch (error) {
    console.error('AI forecast generation failed:', error)
    throw new Error(`Failed to generate forecast: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

function buildForecastPrompt(request: IAIForecastRequest): string {
  const {
    productName,
    sku,
    categoryName,
    currentStock,
    reorderLevel,
    historicalData,
    statistics,
    forecastDays,
  } = request

  const historicalDataText = historicalData
    .map(d => `  - Date: ${d.date}, Quantity Sold: ${d.quantity}, Transactions: ${d.transactionCount}`)
    .join('\n')

  return `You are an expert inventory demand forecasting analyst. Analyze the following historical sales data and provide a detailed demand forecast.

PRODUCT INFORMATION:
- Product Name: ${productName}
- SKU: ${sku}
- Category: ${categoryName}
- Current Stock: ${currentStock} units
- Reorder Level: ${reorderLevel} units

HISTORICAL DATA (Last ${request.historicalData.length} days):
${historicalDataText}

STATISTICAL SUMMARY:
- Total Historical Demand: ${statistics.totalDemand} units
- Average Daily Demand: ${statistics.averageDailyDemand.toFixed(2)} units/day
- Peak Demand: ${statistics.peakDemand} units on ${statistics.peakDate}
- Trend: ${statistics.trend}
- Volatility: ${(statistics.volatility * 100).toFixed(2)}%
- Days with Sales Data: ${statistics.daysWithData}

FORECASTING TASK:
Generate a ${forecastDays}-day demand forecast with the following requirements:

1. **Daily Predictions**: Provide predictions for each of the next ${forecastDays} days
2. **Confidence Intervals**: Calculate upper and lower bounds (90% confidence interval)
3. **Confidence Levels**: Classify each prediction as "low", "medium", or "high" confidence based on data quality and volatility
4. **Pattern Analysis**: Identify any seasonal patterns, trends, or anomalies
5. **Risk Assessment**: Evaluate stockout risk given current inventory levels
6. **Recommendations**: Suggest optimal reorder point and order quantity

IMPORTANT GUIDELINES:
- Base predictions on historical trends and patterns
- Account for the observed trend (${statistics.trend})
- Consider volatility when setting confidence intervals
- If data is limited (< 30 days), mark confidence as "low"
- Confidence intervals should be wider for volatile products
- Reorder recommendations should prevent stockouts with 95% confidence
- Provide actionable insights in plain English

OUTPUT FORMAT (JSON only, no markdown):
{
  "predictions": [
    {
      "date": "YYYY-MM-DD",
      "demand": <predicted quantity as integer>,
      "confidence": "low" | "medium" | "high",
      "upperBound": <upper 90% confidence bound as integer>,
      "lowerBound": <lower 90% confidence bound as integer>
    }
    // ... one entry for each of ${forecastDays} days
  ],
  "insights": "<Natural language summary: describe trends, patterns, risks, and key recommendations in 2-4 sentences>",
  "confidence": <overall forecast confidence as decimal 0.0-1.0>,
  "seasonalPattern": "<Optional: describe any seasonal or cyclical patterns observed>",
  "recommendedReorderPoint": <suggested reorder level as integer>,
  "recommendedOrderQuantity": <suggested order quantity as integer>,
  "stockoutRisk": "low" | "medium" | "high"
}

Generate the forecast now. Return ONLY the JSON object, no additional text or markdown formatting.`
}
