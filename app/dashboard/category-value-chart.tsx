'use client'

import { TrendingUp } from 'lucide-react'
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
    label: 'Inventory Value',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig

interface CategoryValueChartProps {
  categories: Array<{
    name: string
    value: number
    fill: string
  }>
}

export function CategoryValueChart({ categories }: CategoryValueChartProps) {
  const totalValue = categories.reduce((sum, c) => sum + c.value, 0)
  const topCategory = categories.length > 0 ? categories[0] : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Value by Category</CardTitle>
        <CardDescription>Stock value distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={categories}
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
          {topCategory && (
            <>
              {topCategory.name} leads with {formatCurrency(topCategory.value)} <TrendingUp className="h-4 w-4" />
            </>
          )}
        </div>
        <div className="text-muted-foreground leading-none">
          Total inventory value: {formatCurrency(totalValue)}
        </div>
      </CardFooter>
    </Card>
  )
}
