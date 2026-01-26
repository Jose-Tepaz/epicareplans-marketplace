import type { InsurancePlan } from '@/lib/types/insurance'

// ============================================
// AUTENTICACIÓN
// ============================================

export interface TripleSLoginRequest {
  Username: string
  Password: string
}

export interface TripleSAuthToken {
  token: string
  expiresAt: Date
}

// ============================================
// CATÁLOGO DE PRODUCTOS
// ============================================

export interface TripleSProfile {
  name: string
  series: TripleSSeries[]
}

export interface TripleSSeries {
  name: string
  description: string
  code: string // "S1", "S2", "S4", "S9"
  products: TripleSProduct[]
}

export interface TripleSProduct {
  key: string // "Cáncer - Individual - Ind"
  name: string // "Cáncer"
  coverageType?: string // "Ind", "Fam", "Coup", "SP"
}

// ============================================
// COTIZACIÓN
// ============================================

export interface TripleSQuoteRequest {
  Username: string
  Password: string
  ProductInfo: {
    ProductKey: string
    PaymentMethodKey: string // "E" = EFT/ACH
    PaymentModePayments: number // 12=monthly, 4=quarterly, 1=annual (número)
    FetchDetails: boolean
    RiderCategories: Array<{
      CategoryName: string
      IsActive: boolean
      FaceAmountText: string
      SelectedSpecDescription?: string
    }>
  }
  FamilyInfo: {
    SeriesAccessCode: string
    EffectiveDateOverride: string | null
    Primary: {
      IsEnabled: boolean
      IsSelected: boolean
      GenderShortForm: "M" | "F"
      RiskKey: "S" | "N" // Smoker/Non-smoker
      DateOfBirth: string
    }
    ClientReEntry: boolean
  }
}

export interface TripleSQuoteResponse {
  minimumPremium: string
  targetPremium: string
  canCreateApplication: boolean
  requiredRiderCategoriesInfo: Array<{
    category: { name: string; isTerm: boolean }
    categoryName: string
    isActive: boolean
    isOptional: boolean
    faceAmount: number
    faceAmountText: string
    minFaceAmount_Slider: number
    maxFaceAmount_Slider: number
    faceAmountSliderStep: number
    minFaceAmountText?: string
    maxFaceAmountText?: string
    hasMultipleSpecs: boolean
    availableSpecs?: Array<{ description: string }>
    isValid: boolean
    errors: string[]
  }>
}

// ============================================
// PLAN MAPEADO PARA MARKETPLACE
// ============================================

export interface TripleSMappedPlan extends InsurancePlan {
  tripleS: true
  seriesCode: string
  productKey: string
  minimumPremium: number
  targetPremium: number
  faceAmount: number
  minFaceAmount: number
  maxFaceAmount: number
  faceAmountStep: number
  availableSpecs?: string[]
}

// ============================================
// RESULTADO DE COTIZACIÓN
// ============================================

export interface TripleSQuoteResult {
  plans: TripleSMappedPlan[]
  catalog: TripleSProfile[]
}

// ============================================
// ENROLLMENT / SUBMISSION
// ============================================

export interface TripleSSubmitApplicationRequest {
  applicant: {
    first_name: string
    middle_initial?: string
    last_name: string
    second_last_name?: string
    strt_addr_line1: string
    strt_addr_line2?: string
    strt_addr_city: string
    strt_addr_country: string
    strt_addr_zip_code: string
    pstl_addr_line1: string
    pstl_addr_line2?: string
    pstl_addr_city: string
    pstl_addr_country: string
    pstl_addr_zip_code: string
    pstl_addr_zip_code_plus?: string
    birth_date: string
    gender: "M" | "F"
    ssn: string
    email: string
    telephone: string
    home_Phone?: string
    comments?: string
    work_company?: string
    job_description?: string
    weight?: number
    height?: {
      feet: number
      inches: number
    }
    no_physical_mail?: boolean
    insuredUWCLS?: string
  }
  coapplicants: any[]
  beneficiaries: Array<{
    first_name: string
    middle_initial?: string
    last_name: string
    second_last_name?: string
    birth_date: string
    relationship: string
    gender: "M" | "F"
    percentage: number
  }>
  seller: {
    first_name: string
    middle_initial?: string
    last_name: string
    second_last_name?: string
    phone: string
    email: string
    representative_number: string
    agent_market_code?: string
    agency_number: string
  }
  payment_info: {
    payment_type: "ACH" | "Credit Card"
    payment_Frequency: string
    bank_name?: string
    account_owner_name?: string
    account_type?: string
    routing_number?: string
    account_number?: string
    card_holder_name?: string
    card_number?: string
    card_type?: string
    expiration_month?: string
    expiration_year?: string
    pstl_addr_line1: string
    pstl_addr_line2?: string
    city: string
    country: string
    zip_code: string
    premium: number
    payment_date?: string
  }
  policy_data: {
    lob: string
    applicant_is_not_solicitor: boolean
    policy_number?: string
    purchase_date: string
    docTypeId: string
    lifecycle: string
    premium: number
    tsv_AgencyNum: string
    replaces_existing_policy: boolean
    plan_Code: string
    coverage: string
  }
  benefits: Array<{
    prem: number
    plan_Code: string
    units: number
    benefit_amout: number
  }>
  onbasedata: {
    base64?: string
    Solicitud: string
    LOB: string
    Numero: string
    docTypeId: string
    lifecycle: string
    fileName?: string
    TSV_Prima: string
    SVTS_Date_of_Birth: string
    TSV_SSN: string
    TSV_Name: string
    TSV_Last_Name: string
    TSV_Maternal_Last: string
    TSV_AgencyNum: string
  }
  processId: number
}

export interface TripleSSubmitApplicationResponse {
  data: any
  success: boolean
  messageCode: string
  message: string
  messageEN: string
}
