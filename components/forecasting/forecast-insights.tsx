import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lightbulb } from 'lucide-react'

interface ForecastInsightsProps {
  insights: string
  seasonalPattern?: string
}

export function ForecastInsights({ insights, seasonalPattern }: ForecastInsightsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{insights}</p>
        {seasonalPattern && (
          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="text-xs font-medium">Seasonal Pattern Detected</p>
            <p className="text-sm text-muted-foreground mt-1">{seasonalPattern}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
