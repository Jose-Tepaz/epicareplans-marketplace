/**
 * Compare Table Component
 * 
 * Componente de tabla para comparar múltiples planes de seguro lado a lado.
 * Muestra información detallada de cada plan en columnas.
 * 
 * @module CompareTable
 */

"use client"

import { Shield, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { InsurancePlan } from "@/lib/types/insurance"
import { useCart } from "@/contexts/cart-context"
import { useCompare } from "@/contexts/compare-context"
import { useState } from "react"
import { InsurancePlanModal } from "@/components/insurance-plan-modal"
import { getLowestPrice } from "@/lib/utils/compare-helpers"

interface CompareTableProps {
  plans: InsurancePlan[]
}

export function CompareTable({ plans }: CompareTableProps) {
  const { addItem, isInCart } = useCart()
  const { removePlanFromCompare } = useCompare()
  const [openModalId, setOpenModalId] = useState<string | null>(null)

  const lowestPrice = getLowestPrice(plans)

  const handleSelectPlan = (plan: InsurancePlan) => {
    addItem(plan)
  }

  const handleRemovePlan = (planId: string) => {
    removePlanFromCompare(planId)
  }

  return (
    <div className="overflow-x-auto">
      {/* Desktop View - Table */}
      <div className="hidden lg:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <th className="p-4 text-left font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10 min-w-[200px]">
                Feature
              </th>
              {plans.map((plan) => (
                <th key={plan.id} className="p-4 text-center border-l border-gray-200 relative min-w-[280px]">
                  <button
                    onClick={() => handleRemovePlan(plan.id)}
                    className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                    aria-label={`Remove ${plan.name}`}
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                  <div className="mt-6 flex flex-col items-center gap-2">
                    <Shield className="w-10 h-10 text-primary" />
                    <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Price Row */}
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white z-10">
                Price
              </td>
              {plans.map((plan) => (
                <td key={plan.id} className="p-4 text-center border-l border-gray-100">
                  <div className={`text-3xl font-bold ${plan.price === lowestPrice ? 'text-green-600' : 'text-primary'}`}>
                    ${plan.price.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">per month</div>
                </td>
              ))}
            </tr>

            {/* Coverage Row */}
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white z-10">
                Coverage
              </td>
              {plans.map((plan) => (
                <td key={plan.id} className="p-4 text-center border-l border-gray-100">
                  <div className="text-gray-700">{plan.coverage}</div>
                </td>
              ))}
            </tr>

            {/* Product Type Row */}
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white z-10">
                Product Type
              </td>
              {plans.map((plan) => (
                <td key={plan.id} className="p-4 text-center border-l border-gray-100">
                  <div className="text-gray-700">{plan.productType}</div>
                </td>
              ))}
            </tr>

            {/* Plan Type Row */}
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white z-10">
                Plan Type
              </td>
              {plans.map((plan) => (
                <td key={plan.id} className="p-4 text-center border-l border-gray-100">
                  <div className="text-gray-700">{plan.planType}</div>
                </td>
              ))}
            </tr>

            {/* Benefits Row */}
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white z-10">
                Benefits
              </td>
              {plans.map((plan) => (
                <td key={plan.id} className="p-4 border-l border-gray-100">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {plan.benefits.map((benefit, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-cyan/10 text-cyan hover:bg-cyan/20 rounded-full px-3 py-1 text-xs font-medium"
                      >
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* Benefit Description Row */}
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white z-10">
                Benefit Description
              </td>
              {plans.map((plan) => (
                <td key={plan.id} className="p-4 text-center border-l border-gray-100">
                  <div className="text-gray-600 text-sm">{plan.benefitDescription}</div>
                </td>
              ))}
            </tr>

            {/* Carrier Name Row */}
            {plans.some(plan => plan.carrierName) && (
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white z-10">
                  Carrier
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} className="p-4 text-center border-l border-gray-100">
                    <div className="text-gray-700">{plan.carrierName || '-'}</div>
                  </td>
                ))}
              </tr>
            )}

            {/* All State Badge Row */}
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white z-10">
                All State
              </td>
              {plans.map((plan) => (
                <td key={plan.id} className="p-4 text-center border-l border-gray-100">
                  {plan.allState && (
                    <Badge className="bg-primary hover:bg-primary text-white rounded-full text-xs px-3 py-1">
                      All state
                    </Badge>
                  )}
                </td>
              ))}
            </tr>

            {/* Brochure Link Row */}
            {plans.some(plan => plan.brochureUrl) && (
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white z-10">
                  Brochure
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} className="p-4 text-center border-l border-gray-100">
                    {plan.brochureUrl ? (
                      <a
                        href={plan.brochureUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-cyan hover:underline font-medium"
                      >
                        Download
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                ))}
              </tr>
            )}

            {/* Action Buttons Row */}
            <tr className="bg-gray-50">
              <td className="p-4 sticky left-0 bg-gray-50 z-10"></td>
              {plans.map((plan) => {
                const inCart = isInCart(plan.id)
                return (
                  <td key={plan.id} className="p-4 border-l border-gray-200">
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => setOpenModalId(plan.id)}
                        variant="outline"
                        className="w-full rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white"
                      >
                        View Details
                      </Button>
                      <Button
                        onClick={() => handleSelectPlan(plan)}
                        disabled={inCart}
                        className={`w-full rounded-full ${
                          inCart
                            ? 'bg-green-600 hover:bg-green-600 text-white'
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
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile View - Cards */}
      <div className="lg:hidden space-y-6">
        {plans.map((plan) => {
          const inCart = isInCart(plan.id)
          const isLowestPrice = plan.price === lowestPrice
          return (
            <div key={plan.id} className="border-2 border-primary rounded-3xl p-6 bg-white">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{plan.name}</h3>
                    {plan.allState && (
                      <Badge className="bg-primary hover:bg-primary text-white rounded-full text-xs px-3 py-1">
                        All state
                      </Badge>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRemovePlan(plan.id)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label={`Remove ${plan.name}`}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="text-center border-b pb-4">
                  <div className={`text-3xl font-bold ${isLowestPrice ? 'text-green-600' : 'text-primary'}`}>
                    ${plan.price.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">per month</div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-1">Coverage</div>
                  <div className="text-gray-700">{plan.coverage}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Product Type</div>
                    <div className="text-gray-700 text-sm">{plan.productType}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Plan Type</div>
                    <div className="text-gray-700 text-sm">{plan.planType}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">Benefits</div>
                  <div className="flex flex-wrap gap-2">
                    {plan.benefits.map((benefit, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-cyan/10 text-cyan hover:bg-cyan/20 rounded-full px-3 py-1 text-xs font-medium"
                      >
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-1">Benefit Description</div>
                  <div className="text-gray-600 text-sm">{plan.benefitDescription}</div>
                </div>

                {plan.carrierName && (
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-1">Carrier</div>
                    <div className="text-gray-700 text-sm">{plan.carrierName}</div>
                  </div>
                )}

                {plan.brochureUrl && (
                  <div className="text-center">
                    <a
                      href={plan.brochureUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-cyan hover:underline font-medium"
                    >
                      Download Brochure
                    </a>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setOpenModalId(plan.id)}
                  variant="outline"
                  className="flex-1 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white"
                >
                  View Details
                </Button>
                <Button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={inCart}
                  className={`flex-1 rounded-full ${
                    inCart
                      ? 'bg-green-600 hover:bg-green-600 text-white'
                      : 'bg-primary hover:bg-primary/90 text-white'
                  }`}
                >
                  {inCart ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      In Cart
                    </>
                  ) : (
                    'Select'
                  )}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modals for viewing details */}
      {plans.map((plan) => (
        <InsurancePlanModal
          key={plan.id}
          plan={plan}
          isOpen={openModalId === plan.id}
          onOpenChange={(open) => !open && setOpenModalId(null)}
        />
      ))}
    </div>
  )
}

