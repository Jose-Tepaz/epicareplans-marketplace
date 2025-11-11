"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ManhattanLifeProductFilterProps {
  products: string[]
  selected: string
  onSelect: (value: string) => void
}

export function ManhattanLifeProductFilter({ 
  products, 
  selected, 
  onSelect 
}: ManhattanLifeProductFilterProps) {
  return (
    <Select value={selected} onValueChange={onSelect}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="All ML Products" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Products</SelectItem>
        {products.map(product => (
          <SelectItem key={product} value={product}>
            {product}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

