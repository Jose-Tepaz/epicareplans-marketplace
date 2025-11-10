import type { InsurancePlan } from '@/lib/types/insurance'

/**
 * Tipos específicos para la integración con Allstate
 */

export interface AllstateApplicant {
  birthDate: string
  gender: 'Male' | 'Female'
  relationshipType: 'Primary' | 'Spouse' | 'Child' | 'None'
  isSmoker: boolean
  dateLastSmoked?: string
  hasPriorCoverage?: boolean
  rateTier?: 'Standard' | 'Preferred' | 'Substandard'
  memberId?: string
}

export interface AllstateQuoteRequest {
  PlansToRate?: any
  ExcludeAvailablePlans?: boolean
  agentId: string
  effectiveDate: string
  terminationDate?: string
  enrollmentDate?: string
  stmTerm?: number
  zipCode: string
  state?: string
  applicants: AllstateApplicant[]
  insuranceNetwork?: 'Undefined' | 'PPO' | 'HMO'
  stmRenewalTerms?: number
  stmRenewalRateLock?: boolean
  isRewrite?: boolean
  listBillNumber?: string
  productTypes?: string[]
  paymentFrequency: 'Monthly' | 'Quarterly' | 'Semi-Annually' | 'Annually'
  planTypes?: string[]
  medSupp?: {
    enrollmentType?: 'Unknown' | 'Open' | 'Guaranteed'
    medicarePartBEffectiveDate?: string
    guaranteedIssueCircumstance?: 'BirthdayAnniversary' | 'LossOfCoverage'
    isPreMacraEligible?: boolean
    hasHouseholdDiscount?: boolean
    householdDiscountType?: 'None' | 'Spouse' | 'Family'
    wearablesDiscount?: boolean
    applicationFormNumber?: string
  }
  includeAdditionalBenefits?: boolean
  includeACABundleDiscounts?: boolean
  includeStackableDiscounts?: boolean
}

export interface AllstateBenefit {
  name: string
  value: number
  premium: number
  which: string
  formattedValue: string
}

export interface AllstateInsurancePlan {
  id: string
  enrollerId: string
  productCode: string
  planType: string
  productType: string
  planName: string
  activeThruDate: string
  applicationType: string
  issueType: string
  productSubCode: number
  planKey: string
  paymentFrequency: string
  discounts: any[]
  familyComposition: string
  isAMERider: boolean
  hasDentalDiscountCard: boolean
  coverageEffectiveDate: string
  coverageTerminationDate?: string
  coverageEnrolledDate: string
  insuranceNetwork: string
  baseProducts: string[]
  baseProductName?: string
  pathToBrochure: string
  stmRenewalTerms?: number
  stmRenewalRateLock?: boolean
  insuranceRate: number
  standardTierInsuranceRate: number
  rate: number
  standardTierRate: number
  totalRate: number
  standardTierTotalRate: number
  rateExcludingMultiProductDiscounts: number
  providerLink: string
  benefits: AllstateBenefit[]
  benefitDescription: string
  numberOfDays: number
  additionalCoverages: any[]
  memberRates: any[]
  riders: any[]
  isDiscounted: boolean
  productSourceDetail?: any
  valid: boolean
  enrollmentFeeNumber: number
  productRateComponents: any[]
  applicants: any[]
  waiveFee: boolean
  isSeniorPlan: boolean
  carrierName?: string
}

export interface AllstateQuoteResponse {
  ratedPlans: any[]
  availablePlans: AllstateInsurancePlan[]
  additionalPlansToOffer: any[]
  discountedPlansToOffer: any[]
  monthlyPaymentTotal: number
  initialPaymentTotal: number
  enrollmentFeeTotal: number
}

export interface AllstateApiResponse {
  links?: Record<string, { rel: string; href: string; method: string }>
  memberId?: string
  submissionResults?: Array<{
    planType: number
    submissionReceived: boolean
    submissionErrors: string[]
    policyNo: string
    totalRate: number
    effectiveDate: string
    applicationID: number
    partnerApplicationId: number
  }>
  validationErrors?: Array<{
    errorCode: string
    errorDetail: string
  }>
  memberPortalUrl?: string
  pendingAttestationCeremonies?: Array<{
    attestationCeremonyToken: string
    signee: string
  }>
  attestationStatus?: string
}

export type AllstateMappedPlan = InsurancePlan & {
  allState: true
  carrierSlug: 'allstate'
}

