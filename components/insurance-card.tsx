/**
 * Insurance Card Component
 * 
 * Componente para mostrar tarjetas de planes de seguro con información resumida
 * y un modal detallado con toda la información del plan.
 * 
 * @module InsuranceCard
 * @author EpiCare Marketplace
 * @version 1.0.0
 */

"use client"

import { Shield, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { InsurancePlanModal } from "@/components/insurance-plan-modal"
import { useCart } from "@/contexts/cart-context"
import { useCompare } from "@/contexts/compare-context"
import { useState } from "react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

/**
 * Interface que define la estructura de un plan de seguro
 * 
 * @interface InsurancePlan
 * @property {string} id - Identificador único del plan
 * @property {string} name - Nombre del plan de seguro
 * @property {number} price - Precio mensual del plan
 * @property {string} coverage - Descripción de la cobertura (ej: "$25,000/$50,000 Benefit")
 * @property {string} productType - Tipo de producto (ej: "NHICSupplemental")
 * @property {string[]} benefits - Array con la lista de beneficios del plan
 * @property {boolean} allState - Indica si el plan está disponible en todos los estados
 * @property {string} [brochureUrl] - URL opcional del brochure/folleto del plan
 * @property {string} planType - Tipo de plan (ej: "NICAFB", "Life", "Dental")
 * @property {string} benefitDescription - Descripción detallada de los beneficios
 * @property {string} [carrierName] - Nombre opcional de la aseguradora/carrier
 */
interface InsurancePlan {
  id: string
  name: string
  price: number
  coverage: string
  productType: string
  benefits: string[]
  allState: boolean
  brochureUrl?: string
  planType: string
  benefitDescription: string
  carrierName?: string
}

/**
 * Props para el componente InsuranceCard
 * 
 * @interface InsuranceCardProps
 * @property {InsurancePlan} plan - Objeto con la información del plan de seguro
 */
interface InsuranceCardProps {
  plan: InsurancePlan
}

/**
 * Componente InsuranceCard
 * 
 * Muestra una tarjeta visual con información resumida de un plan de seguro.
 * Incluye:
 * - Información básica: nombre, precio, cobertura, tipo de producto
 * - Vista previa de beneficios (primeros 3)
 * - Botón "See more" que abre un modal con información detallada
 * - Botón "Select this plan" para seleccionar el plan
 * - Enlace para descargar el brochure (si está disponible)
 * 
 * El modal incluye toda la información detallada del plan:
 * - Detalles completos del plan
 * - Lista completa de beneficios
 * - Información del carrier
 * - Área de cobertura
 * 
 * @component
 * @param {InsuranceCardProps} props - Props del componente
 * @returns {JSX.Element} Tarjeta de plan de seguro con modal de detalles
 * 
 * @example
 * ```tsx
 * const plan = {
 *   id: "1",
 *   name: "Accident Fixed-Benefit",
 *   price: 25.15,
 *   coverage: "$25,000/$50,000 Benefit",
 *   productType: "NHICSupplemental",
 *   benefits: ["Coverage A", "Coverage B", "Coverage C"],
 *   allState: true,
 *   planType: "NICAFB",
 *   benefitDescription: "Comprehensive accident coverage",
 *   brochureUrl: "https://example.com/brochure.pdf"
 * }
 * 
 * <InsuranceCard plan={plan} />
 * ```
 */
export function InsuranceCard({ plan }: InsuranceCardProps) {
  // Estado para controlar la apertura/cierre del modal de detalles
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // Hook del carrito
  const { addItem, isInCart } = useCart()
  
  // Hook de comparación
  const { addPlanToCompare, removePlanFromCompare, isInComparison, canAddMore } = useCompare()
  
  // Verificar si el plan ya está en el carrito
  const inCart = isInCart(plan.id)

  // Verificar si el plan está en comparación
  const inComparison = isInComparison(plan.id)

  // Manejar la selección del plan
  const handleSelectPlan = () => {
    addItem(plan)
  }

  // Manejar el checkbox de comparación
  const handleCompareToggle = (checked: boolean) => {
    if (checked) {
      if (canAddMore) {
        addPlanToCompare(plan)
      }
    } else {
      removePlanFromCompare(plan.id)
    }
  }

  return (
    <>
    {/* ===== TARJETA PRINCIPAL ===== */}
    <div className="border-2 border-primary rounded-3xl p-6 bg-white hover:shadow-lg transition-shadow relative">
      
      {/* ===== CHECKBOX DE COMPARACIÓN ===== */}
      <div className="absolute bottom-4 right-4 z-20 group">
        
        <div className="relative flex items-center gap-2">
        <span className="text-xs text-gray-600">Add to comparison</span>
          <Checkbox
            checked={inComparison}
            onCheckedChange={handleCompareToggle}
            disabled={!canAddMore && !inComparison}
            className="size-6 border-2 border-gray-400 data-[state=checked]:bg-primary data-[state=checked]:border-primary disabled:opacity-40"
            aria-label="Add to comparison"
          />
          
       
         
          
        </div>
      </div>
      
      {/* ===== HEADER: Ícono, nombre y precio ===== */}
      {/* Muestra el nombre del plan, badge "All state" (si aplica) y precio mensual */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3 pr-8">
          <div className="w-12 h-12 bg-cyan/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-cyan" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">{plan.name}</h3>
            {plan.allState && (
              <Badge className="bg-primary hover:bg-primary text-white rounded-full text-xs px-3 py-1">All state</Badge>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">${plan.price.toFixed(2)}</div>
          <div className="text-sm text-gray-600">per month</div>
        </div>
      </div>

      {/* ===== INFORMACIÓN DE COBERTURA Y TIPO DE PRODUCTO ===== */}
      {/* Grid de 2 columnas con la cobertura y tipo de producto del plan */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-sm font-semibold text-gray-900 mb-1">Coverage:</div>
          <div className="text-sm text-gray-700">{plan.coverage}</div>
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900 mb-1">Product Type</div>
          <div className="text-sm text-gray-700">{plan.productType}</div>
        </div>
      </div>

      {/* ===== SECCIÓN DE BENEFICIOS ===== */}
      {/* Muestra los primeros 3 beneficios como badges, con indicador de cantidad adicional */}
      <div className="mb-6">
        <div className="text-sm font-semibold text-gray-900 mb-3">Benefits</div>
        <div className="flex flex-wrap gap-2">
          {/* Mapea solo los primeros 3 beneficios para vista previa */}
          {plan.benefits.slice(0, 3).map((benefit, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-cyan/10 text-cyan hover:bg-cyan/20 rounded-full px-3 py-1 text-xs font-medium"
            >
              {benefit}
            </Badge>
          ))}
          {/* Badge indicador de beneficios adicionales si hay más de 3 */}
          {plan.benefits.length > 3 && (
            <Badge
              variant="secondary"
              className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-xs font-medium"
            >
              +{plan.benefits.length - 3} more
            </Badge>
          )}
        </div>
      </div>

      {/* ===== BOTONES DE ACCIÓN ===== */}
      {/* Botón "See more": Abre el modal con información detallada del plan */}
      {/* Botón "Select this plan": Agrega el plan al carrito */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setIsDialogOpen(true)}
          className="flex-1 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white h-12 font-semibold bg-transparent transition-all"
        >
          See more
        </Button>
        <Button 
          onClick={handleSelectPlan}
          disabled={inCart}
          className={`flex-1 rounded-full h-12 font-semibold transition-all ${
            inCart 
              ? 'bg-green-600 hover:bg-green-600 text-white cursor-default' 
              : 'bg-primary hover:bg-primary/90 text-white'
          }`}
        >
          {inCart ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Added to Cart
            </>
          ) : (
            'Select this plan'
          )}
        </Button>
      </div>

      {/* ===== ENLACE DE DESCARGA DEL BROCHURE ===== */}
      {/* Se muestra solo si el plan tiene brochureUrl disponible */}
      {plan.brochureUrl && (
        <div className="mt-4 text-center">
          <a 
            href={plan.brochureUrl} 
            download
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-cyan hover:underline font-medium"
          >
            Brochure Download 
          </a>
        </div>
      )}
    </div>

    {/* ===== MODAL DE DETALLES DEL PLAN ===== */}
    {/* 
      Modal que se abre al hacer clic en "See more"
      Ahora en un componente separado para mejor organización
    */}
    <InsurancePlanModal
      plan={plan}
      isOpen={isDialogOpen}
      onOpenChange={setIsDialogOpen}
    />
    </>
  )
}
