/**
 * Insurance Plan Modal Component
 * 
 * Modal que muestra información detallada de un plan de seguro.
 * Se abre cuando el usuario hace clic en "See more" en una InsuranceCard.
 * 
 * @module InsurancePlanModal
 * @author EpiCare Marketplace
 * @version 1.0.0
 */

import { Shield, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

/**
 * Interface que define la estructura de un plan de seguro
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
 * Props para el componente InsurancePlanModal
 */
interface InsurancePlanModalProps {
  /** Plan de seguro a mostrar */
  plan: InsurancePlan
  /** Estado que controla si el modal está abierto */
  isOpen: boolean
  /** Función para cambiar el estado del modal */
  onOpenChange: (open: boolean) => void
}

/**
 * Componente InsurancePlanModal
 * 
 * Modal con información completa del plan de seguro:
 * - Precio y badge "All state"
 * - Coverage y Product Type
 * - Detalles del plan (tipo, carrier, área de cobertura)
 * - Lista completa de beneficios
 * - Enlace de descarga del brochure
 * - Botón para seleccionar el plan
 * 
 * @param {InsurancePlanModalProps} props - Props del componente
 * @returns {JSX.Element} Modal con detalles del plan
 * 
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false)
 * 
 * <InsurancePlanModal 
 *   plan={selectedPlan}
 *   isOpen={isOpen}
 *   onOpenChange={setIsOpen}
 * />
 * ```
 */
export function InsurancePlanModal({ plan, isOpen, onOpenChange }: InsurancePlanModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        
        {/* ===== HEADER DEL MODAL ===== */}
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-cyan/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-cyan" />
            </div>
            {plan.name}
          </DialogTitle>
          <DialogDescription className="text-base">
            Detalles completos del plan de seguro
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          
          {/* ===== SECCIÓN DE PRECIO ===== */}
          {/* Muestra el precio mensual destacado con el badge "All state" si aplica */}
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl">
            <div>
              <p className="text-sm text-gray-600 mb-1">Precio mensual</p>
              <p className="text-4xl font-bold text-primary">${plan.price.toFixed(2)}</p>
            </div>
            {plan.allState && (
              <Badge className="bg-primary hover:bg-primary text-white rounded-full text-sm px-4 py-2">
                All state
              </Badge>
            )}
          </div>

          {/* ===== GRID DE COBERTURA Y TIPO DE PRODUCTO ===== */}
          {/* Grid de 2 columnas con tarjetas para Coverage y Product Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-sm font-semibold text-gray-900 mb-2">Coverage</p>
              <p className="text-gray-700">{plan.coverage}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-sm font-semibold text-gray-900 mb-2">Product Type</p>
              <p className="text-gray-700">{plan.productType}</p>
            </div>
          </div>

          {/* ===== DETALLES COMPLETOS DEL PLAN ===== */}
          {/* 
            Sección con información detallada del plan:
            - Plan Type: Tipo de plan (NICAFB, Life, Dental, etc.)
            - Benefit Description: Descripción completa de los beneficios
            - Carrier: Nombre de la aseguradora (si está disponible)
            - Coverage Area: Disponibilidad geográfica del plan
          */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900">Plan Details</h3>
            <div className="space-y-3 p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Plan Type</p>
                  <p className="text-gray-700">{plan.planType}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Benefit Description</p>
                  <p className="text-gray-700">{plan.benefitDescription}</p>
                </div>
              </div>
              {plan.carrierName && (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Carrier</p>
                    <p className="text-gray-700">{plan.carrierName}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Coverage Area</p>
                  <p className="text-gray-700">
                    {plan.allState ? 'Available in all states' : 'Limited availability'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ===== LISTA COMPLETA DE BENEFICIOS ===== */}
          {/* 
            Muestra todos los beneficios del plan en tarjetas individuales
            Cada beneficio tiene un ícono de check en color cyan
            Se itera sobre el array completo de benefits (sin límite)
          */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900">All Benefits</h3>
            <div className="grid gap-2">
              {plan.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-cyan/5 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-cyan mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ===== ENLACE DE DESCARGA DEL BROCHURE ===== */}
          {/* 
            Enlace para descargar el brochure/folleto del plan (si está disponible)
            Solo se muestra si plan.brochureUrl tiene un valor
            El enlace se abre en una nueva pestaña y fuerza la descarga del archivo
          */}
          {plan.brochureUrl && (
            <div className="p-4 bg-gray-50 rounded-2xl text-center">
              <a 
                href={plan.brochureUrl} 
                download
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan hover:underline font-semibold"
              >
                📄 Download Plan Brochure
              </a>
            </div>
          )}

          {/* ===== BOTÓN DE SELECCIÓN DE PLAN ===== */}
          {/* 
            Botón principal para seleccionar el plan
            - Ancho completo (w-full)
            - Al hacer clic cierra el modal (funcionalidad de selección pendiente)
            - TODO: Implementar lógica de selección de plan
          */}
          <Button 
            className="w-full rounded-full bg-primary hover:bg-primary/90 text-white h-12 font-semibold text-lg"
            onClick={() => onOpenChange(false)}
          >
            Select this plan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

