import type { InsurancePlan } from '@/lib/types/insurance'

// Auth
export interface ManhattanLifeAuthToken {
  access_token: string
  token_type: string
  expires_in: number
}

// Productos
export interface ManhattanLifeProduct {
  productName: string
}

export interface ManhattanLifeProductWithId {
  productId: number
  productName: string
  stateCode: string
}

// Jerarquía
export interface ManhattanLifeRider {
  riderUnitStateId: number
  riderName: string
  unitName: string
  coverageAmount: number | null
  riderCode: string
}

export interface ManhattanLifePlan {
  planUnitStateCodeId: number
  planName: string
  unitName: string
  coverageAmount: number | null
  planCode: string
  riders: ManhattanLifeRider[]
}

export interface ManhattanLifePlanHierarchy {
  productName: string
  stateCode: string
  plans: ManhattanLifePlan[]
}

// Mapeo a InsurancePlan
export interface ManhattanLifeMappedPlan extends InsurancePlan {
  manhattanLife: true
  carrierSlug: 'manhattan-life'
  carrierName: 'Manhattan Life'
  metadata: {
    planUnitStateCodeId: number
    riders: ManhattanLifeRider[]
    ridersCount: number
    productName: string
  }
}

export interface ManhattanLifeQuoteResult {
  plans: ManhattanLifeMappedPlan[]
  agentProducts: ManhattanLifeProduct[]
}

