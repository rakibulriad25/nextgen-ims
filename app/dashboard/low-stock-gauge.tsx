'use client'

import { AlertTriangle } from 'lucide-react'
import { PolarGrid, RadialBar, RadialBarChart } from 'recharts'

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
  stock: {
    label: 'Stock Level',
  },
  healthy: {
    label: 'Healthy',
    color: 'var(--chart-1)',
  },
  low: {
    label: 'Low Stock',
    color: 'var(--chart-5)',
  },
} satisfies ChartConfig

interface LowStockGaugeProps {
  lowStockCount: number
  totalProducts: number
}

export function LowStockGauge({ lowStockCount, totalProducts }: LowStockGaugeProps) {
  const lowStockPercentage = totalProducts > 0 ? Math.round((lowStockCount / totalProducts) * 100) : 0
  const healthyPercentage = 100 - lowStockPercentage

  const chartData = [
    { category: 'healthy', value: healthyPercentage, fill: 'var(--color-healthy)' },
    { category: 'low', value: lowStockPercentage, fill: 'var(--color-low)' },
  ]

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Stock Health</CardTitle>
        <CardDescription>Low stock alert gauge</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart data={chartData} innerRadius={30} outerRadius={100}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="category" />}
            />
            <PolarGrid gridType="circle" />
            <RadialBar dataKey="value" />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {lowStockPercentage > 20 ? (
            <>
              {lowStockPercentage}% of products need restocking <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </>
          ) : (
            <>Stock levels healthy ({healthyPercentage}% adequate)</>
          )}
        </div>
        <div className="text-muted-foreground leading-none">
          {lowStockCount} of {totalProducts} products at or below reorder level
        </div>
      </CardFooter>
    </Card>
  )
}
