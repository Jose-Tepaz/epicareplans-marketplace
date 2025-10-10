/**
 * Insurance Empty State Component
 * 
 * Se muestra cuando no hay planes que coincidan con los filtros aplicados.
 * Incluye un botón para limpiar todos los filtros.
 * 
 * @module InsuranceEmptyState
 */

interface InsuranceEmptyStateProps {
  onClearFilters: () => void
}

export function InsuranceEmptyState({ onClearFilters }: InsuranceEmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="bg-gray-50 rounded-lg p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No plans found</h3>
        <p className="text-gray-600 mb-4">
          No insurance plans match your current filters. Try adjusting your criteria.
        </p>
        <button
          onClick={onClearFilters}
          className="text-cyan hover:underline font-medium"
        >
          Clear all filters
        </button>
      </div>
    </div>
  )
}

