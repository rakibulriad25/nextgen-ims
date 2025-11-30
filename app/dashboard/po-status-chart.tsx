'use client'

import { Pie, PieChart } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

const chartConfig = {
  count: {
    label: 'Purchase Orders',
  },
  'pending-approval': {
    label: 'Pending',
    color: 'var(--chart-1)',
  },
  approved: {
    label: 'Approved',
    color: 'var(--chart-2)',
  },
  ordered: {
    label: 'Ordered',
    color: 'var(--chart-3)',
  },
  'partially-received': {
    label: 'Partial',
    color: 'var(--chart-4)',
  },
  received: {
    label: 'Received',
    color: 'var(--chart-5)',
  },
  closed: {
    label: 'Closed',
    color: 'hsl(var(--muted))',
  },
} satisfies ChartConfig

interface POStatusChartProps {
  data: Array<{
    status: string
    count: number
    fill: string
  }>
}

export function POStatusChart({ data }: POStatusChartProps) {
  const totalPOs = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Purchase Order Status</CardTitle>
        <CardDescription>Distribution of {totalPOs} active purchase orders</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="status" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
