"use client"

import { Badge } from "@/components/ui/badge"

interface CarrierBadgeProps {
  carrierSlug?: string
  carrierName?: string
}

export function CarrierBadge({ carrierSlug, carrierName }: CarrierBadgeProps) {
  if (!carrierSlug || !carrierName) {
    return null
  }

  const colors: Record<string, string> = {
    'allstate': 'bg-blue-100 text-blue-800 border-blue-200',
    'manhattan-life': 'bg-purple-100 text-purple-800 border-purple-200'
  }
  
  const colorClass = colors[carrierSlug] || 'bg-gray-100 text-gray-800 border-gray-200'
  
  return (
    <Badge className={`${colorClass} border`} variant="outline">
      {carrierName}
    </Badge>
  )
}

