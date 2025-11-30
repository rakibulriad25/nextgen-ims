'use client'

import { Package } from 'lucide-react'
import { Bar, BarChart, XAxis, YAxis } from 'recharts'

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
import { formatCurrency } from '@/lib/utils'

const chartConfig = {
  value: {
    label: 'Stock Value',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

interface TopProductsChartProps {
  products: Array<{
    name: string
    value: number
    fill: string
  }>
}

export function TopProductsChart({ products }: TopProductsChartProps) {
  const totalValue = products.reduce((sum, p) => sum + p.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products by Value</CardTitle>
        <CardDescription>Highest stock value items</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={products}
            layout="vertical"
            margin={{
              left: 0,
            }}
          >
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={120}
              tickFormatter={(value) => {
                // Truncate long product names
                return value.length > 20 ? value.slice(0, 20) + '...' : value
              }}
            />
            <XAxis dataKey="value" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel formatter={(value) => formatCurrency(Number(value))} />}
            />
            <Bar dataKey="value" layout="vertical" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Top 5 products represent {formatCurrency(totalValue)} <Package className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Based on current stock × unit price
        </div>
      </CardFooter>
    </Card>
  )
}
