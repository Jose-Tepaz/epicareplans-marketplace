import type { 
  RateCartRequest, 
  RateCartResponse, 
  RateCartApplicant,
  FamilyMember 
} from '@/lib/types/enrollment'
import type { InsurancePlan } from '@/lib/types/insurance'

/**
 * Construir un applicant para Rate/Cart desde datos del formulario de explore/insurance-options
 */
export function buildPrimaryApplicant(formData: {
  dateOfBirth: string
  gender: string
  smokes: boolean
  hasPriorCoverage?: boolean
}): RateCartApplicant {
  return {
    birthDate: new Date(formData.dateOfBirth).toISOString(),
    gender: formData.gender === 'male' ? 'Male' : formData.gender === 'female' ? 'Female' : formData.gender,
    relationshipType: 'Primary',
    isSmoker: formData.smokes,
    hasPriorCoverage: formData.hasPriorCoverage || false,
    rateTier: 'Standard',
    memberId: 'primary-001'
  }
}

/**
 * Convertir FamilyMember a formato RateCartApplicant
 */
export function familyMemberToRateCartApplicant(
  member: FamilyMember, 
  index: number
): RateCartApplicant {
  return {
    birthDate: new Date(member.date_of_birth).toISOString(),
    gender: member.gender,
    // Map relationship to Allstate accepted values: None, Primary, Spouse, Dependent
    relationshipType: member.relationship === 'Spouse' ? 'Spouse' : 'Dependent',
    isSmoker: member.smoker,
    hasPriorCoverage: member.has_prior_coverage,
    rateTier: 'Standard',
    memberId: `additional-${String(index + 1).padStart(3, '0')}`
  }
}

/**
 * Construir el request completo para Rate/Cart
 */
export function buildRateCartRequest(
  primaryApplicant: RateCartApplicant,
  familyMembers: FamilyMember[],
  plan: InsurancePlan,
  formData: {
    zipCode: string
    state: string
    effectiveDate?: string
    paymentFrequency?: string
  }
): RateCartRequest {
  // Construir lista de applicants
  const applicants = [
    primaryApplicant,
    ...familyMembers.map((member, index) => 
      familyMemberToRateCartApplicant(member, index)
    )
  ]

  // Determinar effective date (hoy + 1 día si no se proporciona)
  const effectiveDate = formData.effectiveDate 
    ? new Date(formData.effectiveDate).toISOString()
    : new Date(Date.now() + 86400000).toISOString()

  // Payment frequency
  const paymentFrequency = formData.paymentFrequency || 'Monthly'

  return {
    agentId: process.env.NEXT_PUBLIC_AGENT_NUMBER || '159208',
    effectiveDate,
    zipCode: formData.zipCode,
    state: formData.state,
    applicants,
    paymentFrequency,
    plansToRate: [
      {
        planKey: plan.planKey || plan.productCode || plan.id,
        productCode: plan.productCode || plan.planKey || plan.id,
        paymentFrequency
      }
    ]
  }
}

/**
 * Llamar al endpoint Rate/Cart y obtener precio actualizado
 */
export async function getRateCartPricing(
  primaryApplicant: RateCartApplicant,
  familyMembers: FamilyMember[],
  plan: InsurancePlan,
  formData: {
    zipCode: string
    state: string
    effectiveDate?: string
    paymentFrequency?: string
  }
): Promise<RateCartResponse> {
  try {
    const requestBody = buildRateCartRequest(
      primaryApplicant,
      familyMembers,
      plan,
      formData
    )

    console.log('📊 Calling Rate/Cart for plan:', plan.name)
    console.log('📊 Request body:', requestBody)

    const response = await fetch('/api/allstate/rate-cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Rate/Cart API error:', errorData)
      throw new Error(errorData.message || `Rate/Cart failed with status ${response.status}`)
    }

    const data: RateCartResponse = await response.json()
    console.log('✅ Rate/Cart response:', data)

    return data

  } catch (error) {
    console.error('❌ Error calling Rate/Cart:', error)
    throw error
  }
}

/**
 * Obtener precio actualizado para un plan específico
 * Retorna el precio actualizado o el precio original si falla
 */
export async function getUpdatedPlanPrice(
  primaryApplicant: RateCartApplicant,
  familyMembers: FamilyMember[],
  plan: InsurancePlan,
  formData: {
    zipCode: string
    state: string
    effectiveDate?: string
    paymentFrequency?: string
  }
): Promise<{ price: number; originalPrice: number; success: boolean; error?: string }> {
  const originalPrice = plan.price

  try {
    const result = await getRateCartPricing(
      primaryApplicant,
      familyMembers,
      plan,
      formData
    )

    if (result.success && result.plans && result.plans.length > 0) {
      const updatedPlan = result.plans[0]
      // Allstate Rate/Cart devuelve el precio en diferentes campos
      // Prioridad: totalRate > rate > insuranceRate > monthlyPremium
      const newPrice = updatedPlan.totalRate || updatedPlan.rate || updatedPlan.insuranceRate || updatedPlan.monthlyPremium || originalPrice
      
      return {
        price: newPrice,
        originalPrice,
        success: true
      }
    } else {
      return {
        price: originalPrice,
        originalPrice,
        success: false,
        error: result.error || 'No plans returned from Rate/Cart'
      }
    }
  } catch (error) {
    console.error('❌ Error getting updated price:', error)
    return {
      price: originalPrice,
      originalPrice,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Cache simple para evitar llamadas duplicadas a Rate/Cart
 * TTL: 5 minutos
 */
const rateCartCache = new Map<string, { data: RateCartResponse; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

function getCacheKey(
  primaryApplicant: RateCartApplicant,
  familyMembers: FamilyMember[],
  planId: string
): string {
  const memberIds = familyMembers.map(m => m.id).sort().join(',')
  return `${planId}-${primaryApplicant.birthDate}-${memberIds}`
}

/**
 * Obtener precio con cache
 */
export async function getRateCartPricingCached(
  primaryApplicant: RateCartApplicant,
  familyMembers: FamilyMember[],
  plan: InsurancePlan,
  formData: {
    zipCode: string
    state: string
    effectiveDate?: string
    paymentFrequency?: string
  }
): Promise<RateCartResponse> {
  const cacheKey = getCacheKey(primaryApplicant, familyMembers, plan.id)
  const cached = rateCartCache.get(cacheKey)

  // Verificar si el cache es válido
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    console.log('📦 Using cached Rate/Cart result for:', plan.name)
    return cached.data
  }

  // Llamar a la API
  const result = await getRateCartPricing(
    primaryApplicant,
    familyMembers,
    plan,
    formData
  )

  // Guardar en cache
  rateCartCache.set(cacheKey, {
    data: result,
    timestamp: Date.now()
  })

  return result
}

