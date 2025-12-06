'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

interface Product {
  _id: string
  name: string
  sku: string
  currentStock: number
  reorderPoint: number
  alertType: 'critical' | 'warning'
}

export function useLowStockMonitor() {
  const notifiedProductsRef = useRef<Set<string>>(new Set())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const checkLowStock = async () => {
      try {
        const response = await fetch('/api/products/low-stock')
        const data = await response.json()

        if (data.products && Array.isArray(data.products)) {
          // Load read and dismissed notifications from localStorage
          const readStr = localStorage.getItem('readLowStockNotifications')
          const readIds = readStr ? new Set(JSON.parse(readStr)) : new Set()
          const dismissedStr = localStorage.getItem('dismissedLowStockNotifications')
          const dismissedIds = dismissedStr ? new Set(JSON.parse(dismissedStr)) : new Set()

          data.products.forEach((product: Product) => {
            // Only notify if:
            // 1. We haven't notified about this product yet
            // 2. The product hasn't been read by the user
            // 3. The product hasn't been dismissed by the user
            if (
              !notifiedProductsRef.current.has(product._id) &&
              !readIds.has(product._id) &&
              !dismissedIds.has(product._id)
            ) {
              if (product.alertType === 'critical') {
                toast.error(`Low Stock Alert: ${product.name}`, {
                  description: `Current stock: ${product.currentStock} | Reorder point: ${product.reorderPoint}`,
                  duration: 5000,
                })
              } else {
                toast.warning(`Stock Running Low: ${product.name}`, {
                  description: `Likely to stock out soon. Current: ${product.currentStock} | Reorder at: ${product.reorderPoint}`,
                  duration: 5000,
                })
              }
              notifiedProductsRef.current.add(product._id)
            }
          })

          // Clear notified products that are no longer low on stock
          const currentLowStockIds = new Set(data.products.map((p: Product) => p._id))
          notifiedProductsRef.current.forEach((id) => {
            if (!currentLowStockIds.has(id)) {
              notifiedProductsRef.current.delete(id)
            }
          })

          // Clean up dismissed notifications for products no longer in low stock
          if (dismissedStr) {
            const dismissedArray = JSON.parse(dismissedStr) as string[]
            const updatedDismissed = dismissedArray.filter((id) => currentLowStockIds.has(id))
            if (updatedDismissed.length !== dismissedArray.length) {
              localStorage.setItem('dismissedLowStockNotifications', JSON.stringify(updatedDismissed))
            }
          }
        }
      } catch (error) {
        console.error('Failed to check low stock:', error)
      }
    }

    // Check immediately on mount
    checkLowStock()

    // Then check every 10 seconds (for more responsive notifications)
    intervalRef.current = setInterval(checkLowStock, 10000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return null
}
