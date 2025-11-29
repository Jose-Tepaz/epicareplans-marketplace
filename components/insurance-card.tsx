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

import { Shield, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { InsurancePlanModal } from "@/components/insurance-plan-modal"
import { useCart } from "@/contexts/cart-context"
import { useCompare } from "@/contexts/compare-context"
import { useFamilyMembers } from "@/hooks/use-family-members"
import { useState } from "react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { CarrierBadge } from "@/components/carriers/shared/carrier-badge"
import { RidersModal } from "@/components/carriers/manhattan-life/riders-modal"
import { toast } from "sonner"
import { buildPrimaryApplicant, getUpdatedPlanPrice } from "@/lib/api/carriers/allstate-rate-cart"
import type { ManhattanLifeRider } from "@/lib/api/carriers/manhattan-life/types"
import type { InsurancePlan as BaseInsurancePlan } from "@/lib/types/insurance"

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
type InsurancePlan = BaseInsurancePlan & {
  metadata?: (BaseInsurancePlan["metadata"] extends Record<string, unknown>
    ? BaseInsurancePlan["metadata"]
    : Record<string, unknown>) & {
      riders?: ManhattanLifeRider[]
      ridersCount?: number
    }
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

  // Estado para controlar el modal de riders
  const [showRidersModal, setShowRidersModal] = useState(false)

  // Estado para calcular precio con Rate/Cart
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false)

  // Hook del carrito
  const { addItem, isInCart } = useCart()

  // Hook de comparación
  const { addPlanToCompare, removePlanFromCompare, isInComparison, canAddMore } = useCompare()

  // Hook de family members
  const { familyMembers } = useFamilyMembers()

  // Verificar si el plan ya está en el carrito
  const inCart = isInCart(plan.id)

  // Verificar si el plan está en comparación
  const inComparison = isInComparison(plan.id)

  // Manejar la selección del plan
  const handleSelectPlan = async () => {
    // Filtrar family members que están incluidos en el quote
    const activeFamilyMembers = familyMembers.filter(m => m.included_in_quote !== false)

    // Si no es un plan de Allstate, agregar directamente sin recálculo
    const isAllstatePlan = plan.carrierSlug === 'allstate' || plan.allState
    
    if (!isAllstatePlan) {
      addItem(plan)
      return
    }

    // Para planes de Allstate, SIEMPRE calcular precio con Rate/Cart
    // (incluso si no hay family members, para obtener el precio correcto individual)
    setIsCalculatingPrice(true)

    try {
      // Obtener datos del usuario desde sessionStorage
      const insuranceFormData = sessionStorage.getItem('insuranceFormData')
      
      if (!insuranceFormData) {
        toast.warning('Missing user information', {
          description: 'Adding plan with base price. Complete your profile for accurate multi-person pricing.'
        })
        addItem(plan)
        return
      }

      const formData = JSON.parse(insuranceFormData)

      // Construir primary applicant
      const primaryApplicant = buildPrimaryApplicant({
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        smokes: formData.smokes || false,
        hasPriorCoverage: false
      })

      // Ensure state is present
      let state = formData.state
      if (!state && formData.zipCode) {
        try {
          // Try to fetch state if missing
          console.log('🔍 Fetching state for Rate/Cart...')
          const res = await fetch(`/api/address/validate-zip/${formData.zipCode}`)
          const data = await res.json()
          if (data.success && data.data?.state) {
            state = data.data.state
            // Update session storage for future use
            const updatedFormData = { ...formData, state }
            sessionStorage.setItem('insuranceFormData', JSON.stringify(updatedFormData))
            console.log('✅ State fetched and saved:', state)
          }
        } catch (e) {
          console.error('Failed to fetch state for Rate/Cart', e)
        }
      }

      // Obtener precio actualizado
      console.log('🔄 Calculating price with Rate/Cart for:', plan.name)
      console.log('🔄 Active Family members:', activeFamilyMembers.length)

      const result = await getUpdatedPlanPrice(
        primaryApplicant,
        activeFamilyMembers,
        plan,
        {
          zipCode: formData.zipCode,
          state: state || 'NJ',
          effectiveDate: formData.coverageStartDate,
          paymentFrequency: formData.paymentFrequency || 'Monthly'
        }
      )

      if (result.success) {
        // Crear plan con precio actualizado (siempre, incluso si es el mismo)
        const updatedPlan = {
          ...plan,
          price: result.price,
          metadata: {
            ...plan.metadata,
            originalPrice: result.originalPrice,
            priceUpdatedWithRateCart: true,
            applicantsIncluded: activeFamilyMembers.length + 1
          }
        }

        addItem(updatedPlan)
        
        if (activeFamilyMembers.length > 0) {
          toast.success('Price updated for family coverage', {
            description: `Price: $${result.price.toFixed(2)} for ${activeFamilyMembers.length + 1} applicants`
          })
        } else {
          console.log(`✅ Plan added with individual price: $${result.price.toFixed(2)}`)
        }
      } else {
        // Agregar con precio original si falla o es el mismo
        addItem(plan)
        
        if (!result.success) {
          toast.warning('Using base price', {
            description: result.error || 'Could not calculate multi-person pricing. Added with base price.'
          })
        }
      }

    } catch (error) {
      console.error('❌ Error calculating price:', error)
      
      // Agregar con precio original en caso de error
      addItem(plan)
      
      toast.warning('Using base price', {
        description: 'Could not calculate multi-person pricing. Added with base price.'
      })
    } finally {
      setIsCalculatingPrice(false)
    }
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
      <div className="flex flex-col border-2 border-primary rounded-3xl p-6 bg-white hover:shadow-lg transition-shadow relative">

        {/* ===== HEADER: Ícono, nombre y precio ===== */}
        {/* Muestra el nombre del plan, badge "All state" (si aplica) y precio mensual */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-3 pr-8">
            <div className="w-12 h-12 bg-cyan/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-cyan" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">{plan.name}</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {plan.allState && (
                  <Badge className="bg-primary hover:bg-primary text-white rounded-full text-xs px-3 py-1">All state</Badge>
                )}
                <CarrierBadge carrierSlug={plan.carrierSlug} carrierName={plan.carrierName} />
              </div>
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
        {
          plan.benefits.length > 0 && (
            <div className="mb-6">
              <div className="text-sm font-semibold text-gray-900 mb-3">Benefits</div>
              <div className="flex flex-wrap gap-2">
                {plan.benefits.slice(0, 3).map((benefit, index) => (
                  <Badge key={index} variant="secondary" className="bg-cyan/10 text-cyan hover:bg-cyan/20 rounded-full px-3 py-1 text-xs font-medium">
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>
          )
        }
        

        {/* ===== SECCIÓN DE RIDERS (Manhattan Life) ===== */}
      
        {/* Solo mostrar la sección si hay riders y el número es mayor que 0 */}
        {plan.metadata?.ridersCount !== undefined && plan.metadata.ridersCount > 0 && (
          <div className="mb-6 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  {plan.metadata.ridersCount} riders available
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRidersModal(true)}
                className="text-purple-700 hover:text-purple-900 hover:bg-purple-100"
              >
                View Details
              </Button>
            </div>
          </div>
        )}
       
      

        {/* ===== BOTONES DE ACCIÓN ===== */}
        {/* Botón "See more": Abre el modal con información detallada del plan */}
        {/* Botón "Select this plan": Agrega el plan al carrito */}
        <div className="flex gap-3 mt-auto mb-4">
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(true)}
            className="flex-1 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white h-12 font-semibold bg-transparent transition-all"
          >
            See more
          </Button>
          <Button
            onClick={handleSelectPlan}
            disabled={inCart || isCalculatingPrice}
            className={`flex-1 rounded-full h-12 font-semibold transition-all ${
              inCart
                ? 'bg-green-600 hover:bg-green-600 text-white cursor-default'
                : isCalculatingPrice
                ? 'bg-primary/70 text-white cursor-wait'
                : 'bg-primary hover:bg-primary/90 text-white'
            }`}
          >
            {inCart ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Added to Cart
              </>
            ) : isCalculatingPrice ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Calculating price...
              </>
            ) : (
              'Select this plan'
            )}
          </Button>
        </div>

        {/* ===== ENLACE DE DESCARGA DEL BROCHURE ===== */}
        {/* Se muestra solo si el plan tiene brochureUrl disponible */}
        <div className="flex items-center justify-between ">
          {plan.brochureUrl && (
            <div className=" text-center">
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

          {/* ===== CHECKBOX DE COMPARACIÓN ===== */}
          <div className=" z-20 group ml-auto">

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

        </div>


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

      {/* ===== MODAL DE RIDERS (Manhattan Life) ===== */}
      <RidersModal
        riders={plan.metadata?.riders || []}
        open={showRidersModal}
        onClose={() => setShowRidersModal(false)}
      />
    </>
  )
}
