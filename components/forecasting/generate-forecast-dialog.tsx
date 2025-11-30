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
import { Loader2, TrendingUp } from 'lucide-react'

interface Product {
  _id: string
  name: string
  sku: string
}

interface GenerateForecastDialogProps {
  products: Product[]
  productId?: string
  productName?: string
  trigger?: React.ReactNode
}

export function GenerateForecastDialog({
  products,
  productId: initialProductId,
  productName,
  trigger,
}: GenerateForecastDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [productId, setProductId] = useState(initialProductId || '')
  const [forecastPeriod, setForecastPeriod] = useState('30')
  const [historicalPeriod, setHistoricalPeriod] = useState('90')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!productId) {
      toast.error('Please select a product')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('productId', productId)
      formData.append('forecastPeriod', forecastPeriod)
      formData.append('historicalPeriod', historicalPeriod)

      const result = await generateForecast(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Forecast generated successfully')
        setOpen(false)
        setProductId('')
        router.refresh()
      }
    } catch (error) {
      toast.error('Failed to generate forecast')
    } finally {
      setLoading(false)
    }
  }

  const selectedProduct = products.find(p => p._id === productId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <TrendingUp className="mr-2 h-4 w-4" />
            Generate Forecast
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Demand Forecast</DialogTitle>
          <DialogDescription>
            Create an AI-powered demand forecast using historical sales data
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger id="product">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.length === 0 ? (
                    <SelectItem value="none" disabled>No products available</SelectItem>
                  ) : (
                    products.map((product) => (
                      <SelectItem key={product._id} value={product._id}>
                        {product.name} ({product.sku})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select the product to forecast
              </p>
            </div>

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
            <Button type="submit" disabled={loading || !productId}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Forecast
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
