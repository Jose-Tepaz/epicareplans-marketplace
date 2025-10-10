// Types for All State API integration

export interface AllStateApplicant {
  birthDate: string; // ISO date string
  gender: "Male" | "Female";
  relationshipType: "Primary" | "Spouse" | "Child" | "None";
  isSmoker: boolean;
  dateLastSmoked?: string; // ISO date string, required if isSmoker is true
  hasPriorCoverage?: boolean;
  rateTier?: "Standard" | "Preferred" | "Substandard";
  memberId?: string;
}

export interface AllStateQuoteRequest {
  PlansToRate?: any;
  ExcludeAvailablePlans?: boolean;
  agentId: string;
  effectiveDate: string; // ISO date string
  terminationDate?: string; // ISO date string
  enrollmentDate?: string; // ISO date string
  stmTerm?: number;
  zipCode: string;
  state?: string;
  applicants: AllStateApplicant[];
  insuranceNetwork?: "Undefined" | "PPO" | "HMO";
  stmRenewalTerms?: number;
  stmRenewalRateLock?: boolean;
  isRewrite?: boolean;
  listBillNumber?: string;
  productTypes?: string[];
  paymentFrequency: "Monthly" | "Quarterly" | "Semi-Annually" | "Annually";
  planTypes?: string[];
  medSupp?: {
    enrollmentType?: "Unknown" | "Open" | "Guaranteed";
    medicarePartBEffectiveDate?: string;
    guaranteedIssueCircumstance?: "BirthdayAnniversary" | "LossOfCoverage";
    isPreMacraEligible?: boolean;
    hasHouseholdDiscount?: boolean;
    householdDiscountType?: "None" | "Spouse" | "Family";
    wearablesDiscount?: boolean;
    applicationFormNumber?: string;
  };  
  includeAdditionalBenefits?: boolean;
  includeACABundleDiscounts?: boolean;
  includeStackableDiscounts?: boolean;
}

export interface AllStateBenefit {
  name: string;
  value: number;
  premium: number;
  which: string;
  formattedValue: string;
}

export interface AllStateInsurancePlan {
  id: string;
  enrollerId: string;
  productCode: string;
  planType: string;
  productType: string;
  planName: string;
  activeThruDate: string;
  applicationType: string;
  issueType: string;
  productSubCode: number;
  planKey: string;
  paymentFrequency: string;
  discounts: any[];
  familyComposition: string;
  isAMERider: boolean;
  hasDentalDiscountCard: boolean;
  coverageEffectiveDate: string;
  coverageTerminationDate?: string;
  coverageEnrolledDate: string;
  insuranceNetwork: string;
  baseProducts: string[];
  baseProductName?: string;
  pathToBrochure: string;
  stmRenewalTerms?: number;
  stmRenewalRateLock?: boolean;
  insuranceRate: number;
  standardTierInsuranceRate: number;
  rate: number;
  standardTierRate: number;
  totalRate: number;
  standardTierTotalRate: number;
  rateExcludingMultiProductDiscounts: number;
  providerLink: string;
  benefits: AllStateBenefit[];
  benefitDescription: string;
  numberOfDays: number;
  additionalCoverages: any[];
  memberRates: any[];
  riders: any[];
  isDiscounted: boolean;
  productSourceDetail?: any;
  valid: boolean;
  enrollmentFeeNumber: number;
  productRateComponents: any[];
  applicants: any[];
  waiveFee: boolean;
  isSeniorPlan: boolean;
  carrierName?: string;
}

export interface AllStateQuoteResponse {
  ratedPlans: any[];
  availablePlans: AllStateInsurancePlan[];
  additionalPlansToOffer: any[];
  discountedPlansToOffer: any[];
  monthlyPaymentTotal: number;
  initialPaymentTotal: number;
  enrollmentFeeTotal: number;
}

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
}
