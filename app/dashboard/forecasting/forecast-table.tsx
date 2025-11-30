'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfidenceIndicator, StockoutRiskIndicator } from '@/components/forecasting/confidence-indicator'
import { Eye, Search } from 'lucide-react'

interface ForecastTableProps {
  forecasts: any[]
}

export function ForecastTable({ forecasts }: ForecastTableProps) {
  const [search, setSearch] = useState('')

  const filteredForecasts = forecasts.filter(forecast => {
    const searchLower = search.toLowerCase()
    return (
      forecast.product?.name?.toLowerCase().includes(searchLower) ||
      forecast.product?.sku?.toLowerCase().includes(searchLower)
    )
  })

  if (forecasts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No forecasts found. Generate your first forecast to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Avg Daily Demand</TableHead>
              <TableHead>Stockout Risk</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Generated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredForecasts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No forecasts match your search
                </TableCell>
              </TableRow>
            ) : (
              filteredForecasts.map((forecast) => (
                <TableRow key={forecast._id}>
                  <TableCell className="font-medium">
                    {forecast.product?.name || 'Unknown'}
                  </TableCell>
                  <TableCell>{forecast.product?.sku || 'N/A'}</TableCell>
                  <TableCell>{forecast.forecastPeriod} days</TableCell>
                  <TableCell>
                    {forecast.averageDailyDemand?.toFixed(1)} units/day
                  </TableCell>
                  <TableCell>
                    <StockoutRiskIndicator risk={forecast.stockoutRisk} />
                  </TableCell>
                  <TableCell>
                    <ConfidenceIndicator
                      level={
                        forecast.aiConfidence >= 0.7 ? 'high' :
                        forecast.aiConfidence >= 0.5 ? 'medium' : 'low'
                      }
                      percentage={forecast.aiConfidence}
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(forecast.generatedAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/forecasting/${forecast._id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
