'use client'

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Area, AreaChart } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { IForecastPrediction } from '@/types'
import { format } from 'date-fns'

interface ForecastChartProps {
  predictions: IForecastPrediction[]
  title?: string
  description?: string
}

const chartConfig = {
  predicted: {
    label: 'Predicted Demand',
    color: 'hsl(var(--chart-1))',
  },
  upperBound: {
    label: 'Upper Bound',
    color: 'hsl(var(--chart-2))',
  },
  lowerBound: {
    label: 'Lower Bound',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig

export function ForecastChart({ predictions, title, description }: ForecastChartProps) {
  const chartData = predictions.map(p => ({
    date: format(new Date(p.date), 'MMM dd'),
    predicted: p.predictedDemand,
    upperBound: p.upperBound,
    lowerBound: p.lowerBound,
    confidence: p.confidenceLevel,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || 'Demand Forecast'}</CardTitle>
        <CardDescription>
          {description || 'Predicted demand with 90% confidence intervals'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.toFixed(0)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />

            {/* Confidence interval area */}
            <Area
              type="monotone"
              dataKey="upperBound"
              stackId="confidence"
              stroke="none"
              fill="hsl(var(--chart-2))"
              fillOpacity={0.2}
            />
            <Area
              type="monotone"
              dataKey="lowerBound"
              stackId="confidence"
              stroke="none"
              fill="hsl(var(--chart-3))"
              fillOpacity={0.2}
            />

            {/* Predicted demand line */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
