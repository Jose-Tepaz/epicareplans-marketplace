/**
 * Insurance Filters Sidebar Component
 * 
 * Sidebar con filtros para planes de seguro:
 * - Plan Type (Accident, Life, Dental, Vision)
 * - Product Type (Supplemental, Primary, Secondary)
 * - Sort (Price, Coverage, Popular)
 * 
 * @module InsuranceFiltersSidebar
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface InsuranceFiltersSidebarProps {
  selectedPlanType: string
  selectedProductType: string
  sortBy: string
  onPlanTypeChange: (value: string) => void
  onProductTypeChange: (value: string) => void
  onSortChange: (value: string) => void
}

export function InsuranceFiltersSidebar({
  selectedPlanType,
  selectedProductType,
  sortBy,
  onPlanTypeChange,
  onProductTypeChange,
  onSortChange
}: InsuranceFiltersSidebarProps) {
  return (
    <aside className="lg:w-64 flex-shrink-0">
      <div className="space-y-6">
        {/* Plan Type Filter */}
        <div>
          <label className="text-sm font-semibold text-gray-900 mb-2 block">Plan Type</label>
          <Select value={selectedPlanType} onValueChange={onPlanTypeChange}>
            <SelectTrigger className="w-full rounded-full border-2 border-gray-300 h-12">
              <SelectValue placeholder="All Plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="accident">Accident Fixed-Benefit</SelectItem>
              <SelectItem value="life">Life Only - Individual</SelectItem>
              <SelectItem value="dental">Dental Plans</SelectItem>
              <SelectItem value="vision">Vision Plans</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Product Type Filter */}
        <div>
          <label className="text-sm font-semibold text-gray-900 mb-2 block">Product Type</label>
          <Select value={selectedProductType} onValueChange={onProductTypeChange}>
            <SelectTrigger className="w-full rounded-full border-2 border-gray-300 h-12">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="supplemental">NHICSupplemental</SelectItem>
              <SelectItem value="primary">Primary Coverage</SelectItem>
              <SelectItem value="secondary">Secondary Coverage</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Filter */}
        <div>
          <label className="text-sm font-semibold text-gray-900 mb-2 block">Sort</label>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-full rounded-full border-2 border-gray-300 h-12">
              <SelectValue placeholder="Default" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="coverage">Coverage Amount</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </aside>
  )
}

