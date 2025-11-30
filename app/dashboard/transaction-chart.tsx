'use client'

import * as React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const chartConfig = {
  stockIn: {
    label: 'Stock In',
    color: 'var(--chart-1)',
  },
  stockOut: {
    label: 'Stock Out',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

interface TransactionChartProps {
  data: Record<string, { stockIn: number; stockOut: number }>
}

export function TransactionChart({ data }: TransactionChartProps) {
  // Convert data object to array format for chart and sort by date
  const chartData = React.useMemo(() => {
    const entries = Object.entries(data).map(([month, values]) => ({
      month,
      stockIn: values.stockIn,
      stockOut: values.stockOut,
    }))

    // Sort by date (newest first, then reverse to show oldest to newest)
    return entries.sort((a, b) => {
      const dateA = new Date(a.month)
      const dateB = new Date(b.month)
      return dateA.getTime() - dateB.getTime()
    })
  }, [data])

  const stats = React.useMemo(() => {
    const totalStockIn = chartData.reduce((acc, curr) => acc + curr.stockIn, 0)
    const totalStockOut = chartData.reduce((acc, curr) => acc + curr.stockOut, 0)

    // Calculate trend (compare last month vs average of previous months)
    if (chartData.length >= 2) {
      const lastMonth = chartData[chartData.length - 1]
      const previousMonths = chartData.slice(0, -1)
      const avgPrevious = previousMonths.reduce((acc, curr) => acc + curr.stockIn + curr.stockOut, 0) / previousMonths.length
      const lastMonthTotal = lastMonth.stockIn + lastMonth.stockOut
      const trend = ((lastMonthTotal - avgPrevious) / avgPrevious) * 100

      return {
        totalStockIn,
        totalStockOut,
        trend: Math.abs(trend),
        isUp: trend > 0,
      }
    }

    return {
      totalStockIn,
      totalStockOut,
      trend: 0,
      isUp: false,
    }
  }, [chartData])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Overview</CardTitle>
        <CardDescription>
          Stock movements comparison for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('en-US', { month: 'short' })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="stockIn" fill="var(--color-stockIn)" radius={4} />
            <Bar dataKey="stockOut" fill="var(--color-stockOut)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {stats.trend > 0 && (
            <>
              {stats.isUp ? 'Activity up' : 'Activity down'} by {stats.trend.toFixed(1)}% this month
              {stats.isUp ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </>
          )}
          {stats.trend === 0 && 'No trend data available'}
        </div>
        <div className="text-muted-foreground leading-none">
          Total: {stats.totalStockIn.toLocaleString()} items in, {stats.totalStockOut.toLocaleString()} items out
        </div>
      </CardFooter>
    </Card>
  )
}
