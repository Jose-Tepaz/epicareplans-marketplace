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
import { Slider } from "@/components/ui/slider"
import { Loader2 } from "lucide-react"

interface InsuranceFiltersSidebarProps {
  selectedPlanType: string
  selectedProductType: string
  sortBy: string
  selectedCarrier: string
  selectedInsuranceType?: string
  selectedSeries?: string
  priceRange?: [number, number]
  tripleSFaceAmount?: number
  isFetchingPlans?: boolean
  onPlanTypeChange: (value: string) => void
  onProductTypeChange: (value: string) => void
  onSortChange: (value: string) => void
  onCarrierChange: (value: string) => void
  onInsuranceTypeChange?: (value: string) => void
  onSeriesChange?: (value: string) => void
  onPriceRangeChange?: (value: [number, number]) => void
  onTripleSFaceAmountChange?: (value: number) => void
  plans?: any[]
  dynamicPlanTypes?: string[]
}

export function InsuranceFiltersSidebar({
  selectedPlanType,
  selectedProductType,
  sortBy,
  selectedCarrier,
  selectedInsuranceType = "all",
  selectedSeries = "all",
  priceRange = [0, 1000],
  tripleSFaceAmount = 10000,
  isFetchingPlans = false,
  onPlanTypeChange,
  onProductTypeChange,
  onSortChange,
  onCarrierChange,
  onInsuranceTypeChange,
  onSeriesChange,
  onPriceRangeChange,
  onTripleSFaceAmountChange,
  plans = [],
  dynamicPlanTypes = []
}: InsuranceFiltersSidebarProps) {
  // Obtener carriers disponibles
  const carrierEntries = plans.reduce((acc: Record<string, { label: string }>, plan: any) => {
    const slug = plan.carrierSlug || (plan.allState ? 'allstate' : 'other')
    const label =
      plan.carrierName ||
      (slug === 'allstate'
        ? 'Allstate'
        : slug.replace(/-/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase()))
    if (!acc[slug]) {
      acc[slug] = { label }
    }
    return acc
  }, {})

  if (!carrierEntries['manhattan-life'] && dynamicPlanTypes.length > 0) {
    carrierEntries['manhattan-life'] = { label: 'Manhattan Life' }
  }

  const carrierOptions = Object.entries(carrierEntries).map(([value, data]) => ({
    value,
    label: data.label
  }))

  const sanitizedDynamicPlanTypes = Array.from(
    new Set(
      dynamicPlanTypes
        .filter((name): name is string => typeof name === 'string' && name.trim().length > 0)
        .map(name => name.trim())
    )
  )

  // Extraer series disponibles de Triple S
  const availableSeries = Array.from(
    new Set(
      plans
        .filter(plan => plan.carrierSlug === 'triple-s')
        .map(plan => (plan.metadata as any)?.seriesCategory)
        .filter(Boolean)
    )
  )

  // Verificar si hay planes de Triple S
  const hasTripleSPlans = plans.some(plan => plan.carrierSlug === 'triple-s')

  // Calcular rango de precios dinámico
  const prices = plans.map(p => p.price).filter(p => p > 0)
  const minPrice = prices.length > 0 ? Math.floor(Math.min(...prices)) : 0
  const maxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 1000

  return (
    <aside className="lg:w-64 flex-shrink-0">
      <div className="space-y-6">
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
              {sanitizedDynamicPlanTypes.map(option => (
                <SelectItem key={`dynamic-plan-${option}`} value={option}>
                  {option}
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

        {/* NUEVO: Insurance Type Filter (Vida, Salud, Retiro) */}
        {onInsuranceTypeChange && (
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">
              Tipo de Seguro
            </label>
            <Select value={selectedInsuranceType} onValueChange={onInsuranceTypeChange}>
              <SelectTrigger className="w-full rounded-full border-2 border-gray-300 h-12">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Tipos</SelectItem>
                <SelectItem value="Vida">Vida</SelectItem>
                <SelectItem value="Salud">Salud</SelectItem>
                <SelectItem value="Retiro">Retiro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* NUEVO: Triple S Face Amount Filter */}
        {onTripleSFaceAmountChange && hasTripleSPlans && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 relative">
            <label className="text-sm font-semibold text-gray-900 mb-2 block">
              💰 Monto de Cobertura Triple S
            </label>
            <div className="px-2">
              <Slider
                min={10000}
                max={100000}
                step={10000}
                value={[tripleSFaceAmount]}
                onValueChange={([value]) => onTripleSFaceAmountChange(value)}
                className="mb-3"
                disabled={isFetchingPlans}
              />
              <div className="text-center">
                <span className="text-lg font-bold text-blue-700 flex items-center justify-center gap-2">
                  ${tripleSFaceAmount.toLocaleString()}
                  {isFetchingPlans && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  )}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>$10k</span>
                <span>$100k</span>
              </div>
              {isFetchingPlans ? (
                <p className="text-xs text-blue-700 mt-2 font-semibold animate-pulse">
                  🔄 Recotizando planes...
                </p>
              ) : (
                <p className="text-xs text-gray-600 mt-2">
                  ⚡ Los planes se recotizarán automáticamente
                </p>
              )}
            </div>
          </div>
        )}

        {/* NUEVO: Triple S Series Filter */}
        {onSeriesChange && availableSeries.length > 0 && (
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">
              Serie Triple S
            </label>
            <Select value={selectedSeries} onValueChange={onSeriesChange}>
              <SelectTrigger className="w-full rounded-full border-2 border-gray-300 h-12">
                <SelectValue placeholder="Todas las Series" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Series</SelectItem>
                {availableSeries.map(series => (
                  <SelectItem key={series} value={series}>
                    {series}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* NUEVO: Price Range Filter */}
        {onPriceRangeChange && (
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-2 block">
              Rango de Precio
            </label>
            <div className="px-2">
              <Slider
                min={minPrice}
                max={maxPrice}
                step={10}
                value={priceRange}
                onValueChange={(value) => onPriceRangeChange(value as [number, number])}
                className="mb-3"
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
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

