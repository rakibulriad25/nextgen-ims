import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, AlertTriangle } from 'lucide-react'
import { StockoutRiskIndicator } from './confidence-indicator'

interface RecommendationCardProps {
  currentStock: number
  reorderLevel: number
  recommendedReorderPoint: number
  recommendedOrderQuantity: number
  stockoutRisk: 'low' | 'medium' | 'high'
  onCreatePO?: () => void
}

export function RecommendationCard({
  currentStock,
  reorderLevel,
  recommendedReorderPoint,
  recommendedOrderQuantity,
  stockoutRisk,
  onCreatePO,
}: RecommendationCardProps) {
  const isLowStock = currentStock <= reorderLevel
  const needsReorder = currentStock <= recommendedReorderPoint

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Current Stock</p>
            <p className="text-2xl font-bold">{currentStock}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Current Reorder Level</p>
            <p className="text-2xl font-bold">{reorderLevel}</p>
          </div>
        </div>

        <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Stockout Risk</p>
            <StockoutRiskIndicator risk={stockoutRisk} />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Recommended Reorder Point</span>
              <span className="font-medium">{recommendedReorderPoint} units</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Recommended Order Quantity</span>
              <span className="font-medium">{recommendedOrderQuantity} units</span>
            </div>
          </div>
        </div>

        {needsReorder && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">
                  Reorder Recommended
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Current stock is below the recommended reorder point. Consider ordering {recommendedOrderQuantity} units.
                </p>
              </div>
            </div>
          </div>
        )}

        {onCreatePO && (
          <Button onClick={onCreatePO} className="w-full" disabled={!needsReorder}>
            Create Purchase Order
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
