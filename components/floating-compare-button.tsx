/**
 * Floating Compare Button Component
 * 
 * Botón flotante que muestra la selección de planes para comparar.
 * Se posiciona arriba del botón del carrito en la esquina inferior derecha.
 * 
 * @module FloatingCompareButton
 */

"use client"

import { useRouter } from "next/navigation"
import { GitCompare, X } from "lucide-react"
import { useCompare } from "@/contexts/compare-context"
import { Button } from "@/components/ui/button"

export function FloatingCompareButton() {
  const router = useRouter()
  const { selectedPlans, clearComparison } = useCompare()

  // Don't render if no plans selected
  if (selectedPlans.length === 0) {
    return null
  }

  const handleCompareClick = () => {
    router.push('/insurance-options/compare')
  }

  return (
    <div className="fixed bottom-32 right-8 z-50 flex flex-col gap-2 items-end animate-in slide-in-from-bottom fade-in duration-300">
      {/* Clear All Button */}
      <Button
        onClick={clearComparison}
        variant="ghost"
        size="sm"
        className=" rounded-full p-0 w-auto h-auto flex items-center justify-center bg-white hover:bg-red-50 border-red-300 text-red-600 hover:text-red-700   shadow-md"
        aria-label="Clear all selected plans"
      >
        <X className="w-4 h-4 mr-0 " />
        <span className=" w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md animate-in zoom-in">
          {selectedPlans.length}
        </span>
      
      </Button>

      {/* Compare Button */}
      <button
        onClick={handleCompareClick}
        className="relative w-16 h-16 bg-cyan hover:bg-cyan/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
        aria-label="Compare selected plans"
      >
        <GitCompare className="w-8 h-8" />
        
       
        
        {/* Tooltip */}
        <span className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Compare {selectedPlans.length} {selectedPlans.length === 1 ? 'plan' : 'plans'}
        </span>
      </button>
    </div>
  )
}

