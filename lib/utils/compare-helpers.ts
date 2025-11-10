/**
 * Compare Helpers
 * 
 * Funciones utilitarias para la funcionalidad de comparación de planes.
 */

import { InsurancePlan } from "@/lib/types/insurance"

/**
 * Obtiene el precio más bajo de una lista de planes
 */
export function getLowestPrice(plans: InsurancePlan[]): number {
  if (plans.length === 0) return 0
  return Math.min(...plans.map(plan => plan.price))
}

/**
 * Obtiene el precio más alto de una lista de planes
 */
export function getHighestPrice(plans: InsurancePlan[]): number {
  if (plans.length === 0) return 0
  return Math.max(...plans.map(plan => plan.price))
}

/**
 * Obtiene el plan con el precio más bajo
 */
export function getCheapestPlan(plans: InsurancePlan[]): InsurancePlan | null {
  if (plans.length === 0) return null
  return plans.reduce((cheapest, plan) => 
    plan.price < cheapest.price ? plan : cheapest
  )
}

/**
 * Formatea datos para comparación
 */
export function formatComparisonData(plans: InsurancePlan[]) {
  if (plans.length === 0) return null

  const comparisonData = {
    lowestPrice: getLowestPrice(plans),
    highestPrice: getHighestPrice(plans),
    priceRange: getHighestPrice(plans) - getLowestPrice(plans),
    averagePrice: plans.reduce((sum, plan) => sum + plan.price, 0) / plans.length,
    totalPlans: plans.length,
    uniquePlanTypes: [...new Set(plans.map(plan => plan.planType))],
    uniqueProductTypes: [...new Set(plans.map(plan => plan.productType))],
  }

  return comparisonData
}

/**
 * Valida que la selección de comparación sea válida
 */
export function validateCompareSelection(plans: InsurancePlan[]): boolean {
  // Validar máximo de 4 planes
  if (plans.length > 4) {
    console.error('Cannot compare more than 4 plans')
    return false
  }

  // Validar que todos los planes tengan un ID único
  const planIds = plans.map(plan => plan.id)
  const uniqueIds = new Set(planIds)
  if (planIds.length !== uniqueIds.size) {
    console.error('Duplicate plan IDs found')
    return false
  }

  return true
}

/**
 * Compara dos planes y devuelve las diferencias
 */
export function comparePlans(plan1: InsurancePlan, plan2: InsurancePlan) {
  const differences = []

  if (plan1.price !== plan2.price) {
    differences.push({
      field: 'price',
      plan1: plan1.price,
      plan2: plan2.price,
      difference: plan1.price - plan2.price,
    })
  }

  if (plan1.coverage !== plan2.coverage) {
    differences.push({
      field: 'coverage',
      plan1: plan1.coverage,
      plan2: plan2.coverage,
    })
  }

  if (plan1.productType !== plan2.productType) {
    differences.push({
      field: 'productType',
      plan1: plan1.productType,
      plan2: plan2.productType,
    })
  }

  if (plan1.planType !== plan2.planType) {
    differences.push({
      field: 'planType',
      plan1: plan1.planType,
      plan2: plan2.planType,
    })
  }

  return differences
}

