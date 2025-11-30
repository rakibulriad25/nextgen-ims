'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { generateForecast } from '@/lib/actions/forecast'
import { toast } from 'sonner'
import { Loader2, TrendingUp, Sparkles } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface Product {
  _id: string
  name: string
  sku: string
}

interface BatchForecastDialogProps {
  products: Product[]
}

export function BatchForecastDialog({ products }: BatchForecastDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [forecastPeriod, setForecastPeriod] = useState('30')
  const [historicalPeriod, setHistoricalPeriod] = useState('90')
  const [progress, setProgress] = useState(0)
  const [currentProduct, setCurrentProduct] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setProgress(0)

    let successCount = 0
    let failedCount = 0
    const failedProducts: string[] = []

    try {
      for (let i = 0; i < products.length; i++) {
        const product = products[i]
        setCurrentProduct(product.name)
        setProgress(((i + 1) / products.length) * 100)

        const formData = new FormData()
        formData.append('productId', product._id)
        formData.append('forecastPeriod', forecastPeriod)
        formData.append('historicalPeriod', historicalPeriod)

        const result = await generateForecast(formData)

        if (result.error) {
          failedCount++
          failedProducts.push(`${product.name} (${result.error})`)
        } else {
          successCount++
        }

        // Small delay to avoid overwhelming the AI API
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      if (successCount > 0) {
        toast.success(`Successfully generated ${successCount} forecast${successCount > 1 ? 's' : ''}`)
      }

      if (failedCount > 0) {
        toast.error(`Failed to generate ${failedCount} forecast${failedCount > 1 ? 's' : ''}: ${failedProducts.slice(0, 3).join(', ')}${failedCount > 3 ? ` and ${failedCount - 3} more` : ''}`)
      }

      setOpen(false)
      setProgress(0)
      setCurrentProduct('')
      router.refresh()
    } catch (error) {
      toast.error('Batch forecast generation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Sparkles className="mr-2 h-4 w-4" />
          Generate All Forecasts
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Batch Generate Forecasts</DialogTitle>
          <DialogDescription>
            Generate AI-powered demand forecasts for all {products.length} products
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="forecastPeriod">Forecast Period</Label>
              <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
                <SelectTrigger id="forecastPeriod">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                How far into the future to forecast
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="historicalPeriod">Historical Data Period</Label>
              <Select value={historicalPeriod} onValueChange={setHistoricalPeriod}>
                <SelectTrigger id="historicalPeriod">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                How much historical data to analyze
              </p>
            </div>

            {loading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Processing...</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-xs text-muted-foreground truncate">
                  Current: {currentProduct}
                </p>
              </div>
            )}

            <div className="rounded-lg border bg-muted/50 p-3">
              <p className="text-sm text-muted-foreground">
                ⚠️ This will generate forecasts for all {products.length} products.
                Products with insufficient data (&lt;7 days of sales) will be skipped.
                This may take several minutes.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate All Forecasts
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
