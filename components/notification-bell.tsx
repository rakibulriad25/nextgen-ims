'use client'

import { Bell, Check, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Badge } from './ui/badge'
import Link from 'next/link'

interface LowStockProduct {
  _id: string
  name: string
  sku: string
  currentStock: number
  reorderPoint: number
  alertType: 'critical' | 'warning'
}

export function NotificationBell() {
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set())
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set())
  const [hasNew, setHasNew] = useState(false)

  // Load read and dismissed notifications from localStorage on mount
  useEffect(() => {
    const storedRead = localStorage.getItem('readLowStockNotifications')
    if (storedRead) {
      try {
        const parsed = JSON.parse(storedRead)
        setReadNotifications(new Set(parsed))
      } catch (error) {
        console.error('Failed to parse read notifications:', error)
      }
    }

    const storedDismissed = localStorage.getItem('dismissedLowStockNotifications')
    if (storedDismissed) {
      try {
        const parsed = JSON.parse(storedDismissed)
        setDismissedNotifications(new Set(parsed))
      } catch (error) {
        console.error('Failed to parse dismissed notifications:', error)
      }
    }
  }, [])

  useEffect(() => {
    const checkLowStock = async () => {
      try {
        const response = await fetch('/api/products/low-stock')
        const data = await response.json()

        if (data.products && Array.isArray(data.products)) {
          const prevCount = lowStockProducts.length
          setLowStockProducts(data.products)

          // Trigger animation if new low stock items appeared
          if (data.products.length > prevCount) {
            setHasNew(true)
            setTimeout(() => setHasNew(false), 2000)
          }

          // Clean up read and dismissed notifications for products that are no longer low stock
          const currentProductIds = new Set(data.products.map((p: LowStockProduct) => p._id))
          setReadNotifications((prev) => {
            const updated = new Set([...prev].filter((id) => currentProductIds.has(id)))
            localStorage.setItem('readLowStockNotifications', JSON.stringify([...updated]))
            return updated
          })
          setDismissedNotifications((prev) => {
            const updated = new Set([...prev].filter((id) => currentProductIds.has(id)))
            localStorage.setItem('dismissedLowStockNotifications', JSON.stringify([...updated]))
            return updated
          })
        }
      } catch (error) {
        console.error('Failed to check low stock:', error)
      }
    }

    checkLowStock()
    const interval = setInterval(checkLowStock, 10000)

    return () => clearInterval(interval)
  }, [lowStockProducts.length])

  const visibleProducts = lowStockProducts
    .filter((p) => !dismissedNotifications.has(p._id))
    .sort((a, b) => (a.alertType === 'critical' ? -1 : 1) - (b.alertType === 'critical' ? -1 : 1))
  const unreadCount = visibleProducts.filter((p) => !readNotifications.has(p._id)).length

  const handleMarkAsRead = (productId: string) => {
    setReadNotifications((prev) => {
      const updated = new Set([...prev, productId])
      localStorage.setItem('readLowStockNotifications', JSON.stringify([...updated]))
      return updated
    })
  }

  const handleMarkAllAsRead = () => {
    const allIds = lowStockProducts.filter((p) => !dismissedNotifications.has(p._id)).map((p) => p._id)
    setReadNotifications(new Set(allIds))
    localStorage.setItem('readLowStockNotifications', JSON.stringify(allIds))
  }

  const handleClearAll = () => {
    const allIds = lowStockProducts.map((p) => p._id)
    setDismissedNotifications(new Set(allIds))
    localStorage.setItem('dismissedLowStockNotifications', JSON.stringify(allIds))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className={`h-5 w-5 ${hasNew ? 'animate-bounce text-orange-500' : ''}`} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Stock Alerts</DropdownMenuLabel>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleMarkAllAsRead}
              >
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            {visibleProducts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:text-destructive"
                onClick={handleClearAll}
              >
                <X className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        {visibleProducts.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No stock alerts
          </div>
        ) : (
          <>
            <div className="max-h-[300px] overflow-y-auto">
              {visibleProducts.map((product) => {
                const isRead = readNotifications.has(product._id)
                return (
                  <DropdownMenuItem
                    key={product._id}
                    asChild
                    className={isRead ? 'opacity-60' : ''}
                  >
                    <Link
                      href="/dashboard/products"
                      className="flex flex-col items-start gap-1 p-3 cursor-pointer relative"
                      onClick={() => handleMarkAsRead(product._id)}
                    >
                      {!isRead && (
                        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />
                      )}
                      <div className="flex items-center justify-between w-full pl-3">
                        <span className="font-medium text-sm">{product.name}</span>
                        <Badge
                          variant={product.alertType === 'critical' ? 'destructive' : 'secondary'}
                          className={`text-xs ${product.alertType === 'warning' ? 'bg-yellow-500 text-white hover:bg-yellow-600' : ''}`}
                        >
                          {product.alertType === 'critical' ? 'Low Stock' : 'Running Low'}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground pl-3">
                        SKU: {product.sku}
                      </span>
                      <div className="text-xs text-muted-foreground pl-3">
                        Stock: {product.currentStock} / Reorder: {product.reorderPoint}
                      </div>
                    </Link>
                  </DropdownMenuItem>
                )
              })}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/products" className="w-full text-center cursor-pointer">
                View All Products
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
