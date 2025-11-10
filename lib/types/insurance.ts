export type {
  AllstateApplicant,
  AllstateQuoteRequest,
  AllstateQuoteResponse,
  AllstateBenefit,
  AllstateInsurancePlan,
  AllstateApiResponse,
} from '@/lib/api/carriers/allstate'

export type AllStateApplicant = import('@/lib/api/carriers/allstate').AllstateApplicant
export type AllStateQuoteRequest = import('@/lib/api/carriers/allstate').AllstateQuoteRequest
export type AllStateQuoteResponse = import('@/lib/api/carriers/allstate').AllstateQuoteResponse
export type AllStateBenefit = import('@/lib/api/carriers/allstate').AllstateBenefit
export type AllStateInsurancePlan = import('@/lib/api/carriers/allstate').AllstateInsurancePlan
export type AllStateApiResponse = import('@/lib/api/carriers/allstate').AllstateApiResponse

// Form data types for our application
export interface InsuranceFormData {
  zipCode: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  smokes: boolean;
  lastTobaccoUse?: string;
  coverageStartDate: string;
  paymentFrequency: "monthly" | "quarterly" | "semi-annually" | "annually";
}

// Mapped insurance plan for our UI
export interface InsurancePlan {
  id: string;
  name: string;
  price: number;
  coverage: string;
  productType: string;
  benefits: string[];
  allState: boolean;
  planType: string;
  benefitDescription: string;
  brochureUrl?: string;
  carrierName?: string;
  carrierSlug?: string;
  // Campos necesarios para ApplicationBundle API
  productCode?: string;
  planKey?: string;
  metadata?: Record<string, unknown>;
}
