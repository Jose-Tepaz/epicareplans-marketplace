/**
 * Insurance Filters Sidebar Component
 * 
 * Sidebar con filtros para planes de seguro:
 * - Plan Type (Accident, Life, Dental, Vision)
 * - Product Type (Supplemental, Primary, Secondary)
 * - Manhattan Life Products (si hay planes disponibles)
 * - Sort (Price, Coverage, Popular)
 * 
 * @module InsuranceFiltersSidebar
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ManhattanLifeProductFilter } from "@/components/carriers/manhattan-life/product-filter"
import { Label } from "@/components/ui/label"

interface InsuranceFiltersSidebarProps {
  selectedPlanType: string
  selectedProductType: string
  sortBy: string
  selectedCarrier: string
  onPlanTypeChange: (value: string) => void
  onProductTypeChange: (value: string) => void
  onSortChange: (value: string) => void
  onCarrierChange: (value: string) => void
  // Manhattan Life filters
  plans?: any[]
  manhattanLifeAgentProducts?: string[]
  selectedMLProduct?: string
  onMLProductChange?: (value: string) => void
}

export function InsuranceFiltersSidebar({
  selectedPlanType,
  selectedProductType,
  sortBy,
  selectedCarrier,
  onPlanTypeChange,
  onProductTypeChange,
  onSortChange,
  onCarrierChange,
  plans = [],
  manhattanLifeAgentProducts = [],
  selectedMLProduct = "all",
  onMLProductChange = () => {}
}: InsuranceFiltersSidebarProps) {
  // Obtener carriers disponibles
  const carrierEntries = plans.reduce((acc: Record<string, { label: string }>, plan: any) => {
    const slug = plan.carrierSlug || (plan.allState ? 'allstate' : 'other')
    const label = plan.carrierName || (slug === 'allstate' ? 'Allstate' : slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
    if (!acc[slug]) {
      acc[slug] = { label }
    }
    return acc
  }, {})

  if (!carrierEntries['manhattan-life'] && manhattanLifeAgentProducts.length > 0) {
    carrierEntries['manhattan-life'] = { label: 'Manhattan Life' }
  }

  const carrierOptions = Object.entries(carrierEntries).map(([value, data]) => ({
    value,
    label: data.label
  }))

  // Detectar si hay planes de Manhattan Life
  const manhattanLifePlans = plans.filter((p: any) => p.manhattanLife)
  const hasManhattanLifePlans = manhattanLifePlans.length > 0
  const hasAgentProducts = manhattanLifeAgentProducts.length > 0
  const shouldShowMLFilter =
    (hasManhattanLifePlans || hasAgentProducts) &&
    (selectedCarrier === 'all' || selectedCarrier === 'manhattan-life')
  
  // Extraer productos únicos de Manhattan Life
  const derivedProducts = manhattanLifePlans
    .map((p: any) => p.metadata?.productName)
    .filter((name: any) => typeof name === 'string' && name.trim().length > 0)

  const manhattanLifeProducts = [
    ...new Set([
      ...manhattanLifeAgentProducts,
      ...derivedProducts
    ])
  ] as string[]

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

        {/* Carrier Filter */}
        <div>
          <label className="text-sm font-semibold text-gray-900 mb-2 block">Carrier</label>
          <Select value={selectedCarrier} onValueChange={onCarrierChange}>
            <SelectTrigger className="w-full rounded-full border-2 border-gray-300 h-12">
              <SelectValue placeholder="All Carriers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Carriers</SelectItem>
              {carrierOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
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

        {/* Manhattan Life Products Filter - Solo se muestra si hay planes de ML */}
        {shouldShowMLFilter && (
          <div>
            <Label className="text-sm font-semibold text-gray-900 mb-2 block">
              Manhattan Life Products
            </Label>
            <ManhattanLifeProductFilter
              products={manhattanLifeProducts}
              selected={selectedMLProduct}
              onSelect={onMLProductChange}
            />
          </div>
        )}

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

