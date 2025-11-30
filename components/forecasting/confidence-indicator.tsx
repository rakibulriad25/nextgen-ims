import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ConfidenceIndicatorProps {
  level: 'low' | 'medium' | 'high'
  percentage?: number
}

export function ConfidenceIndicator({ level, percentage }: ConfidenceIndicatorProps) {
  const config = {
    low: {
      label: 'Low Confidence',
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      icon: TrendingDown,
    },
    medium: {
      label: 'Medium Confidence',
      className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      icon: Minus,
    },
    high: {
      label: 'High Confidence',
      className: 'bg-green-100 text-green-800 hover:bg-green-100',
      icon: TrendingUp,
    },
  }

  const { label, className, icon: Icon } = config[level]

  return (
    <Badge className={className}>
      <Icon className="mr-1 h-3 w-3" />
      {percentage !== undefined ? `${label} (${(percentage * 100).toFixed(0)}%)` : label}
    </Badge>
  )
}

interface StockoutRiskIndicatorProps {
  risk: 'low' | 'medium' | 'high'
}

export function StockoutRiskIndicator({ risk }: StockoutRiskIndicatorProps) {
  const config = {
    low: {
      label: 'Low Risk',
      className: 'bg-green-100 text-green-800 hover:bg-green-100',
    },
    medium: {
      label: 'Medium Risk',
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    },
    high: {
      label: 'High Risk',
      className: 'bg-red-100 text-red-800 hover:bg-red-100',
    },
  }

  const { label, className } = config[risk]

  return (
    <Badge className={className}>
      {label}
    </Badge>
  )
}
