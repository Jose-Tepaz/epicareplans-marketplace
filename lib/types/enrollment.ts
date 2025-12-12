export interface FamilyMember {
  id?: string
  user_id?: string
  first_name: string
  middle_initial?: string
  last_name: string
  gender: string
  date_of_birth: string
  ssn?: string
  relationship: string
  smoker: boolean
  date_last_smoked?: string
  weight?: number
  height_feet?: number
  height_inches?: number
  has_prior_coverage: boolean
  included_in_quote?: boolean
  created_at?: string
  updated_at?: string
}

export interface EnrollmentFormData {
  zipCode: string
  state?: string
  dateOfBirth: string
  gender: string
  smokes: boolean
  lastTobaccoUse?: string
  coverageStartDate: string
  paymentFrequency: string
  dependents?: {
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: string
    relationship: string
    smoker: boolean
  }[]
}

export type EnrollmentFormState = any;

export interface RateCartApplicant {
  birthDate: string
  gender: string
  relationshipType: string
  isSmoker: boolean
  hasPriorCoverage: boolean
  rateTier: string
  memberId: string
  dateLastSmoked?: string
}

export interface RateCartRequest {
  agentId: string
  effectiveDate: string
  zipCode: string
  state: string
  applicants: RateCartApplicant[]
  paymentFrequency: string
  plansToRate: {
    planKey: string
    productCode: string
    paymentFrequency: string
  }[]
}

export interface RateCartResponse {
  success: boolean
  plans?: {
    planKey?: string
    productCode?: string
    totalRate?: number
    rate?: number
    insuranceRate?: number
    monthlyPremium?: number
    [key: string]: any
  }[]
  error?: string
}

export interface Medication {
  medicationName: string
  dosage?: string
  frequency?: string
  diagnosis?: string
  genericName?: string
  originalRXDate?: string
  rxReason?: string
  isActivelyTaking?: boolean
}

export interface Beneficiary {
  beneficiaryId?: string
  firstName: string
  middleName?: string
  lastName: string
  relationship: string
  dateOfBirth: string
  allocationPercentage: number
  addresses?: any[]
  phoneNumbers?: any[]
  userBeneficiaryId?: string // Referencia al beneficiario guardado del usuario
}

// Beneficiario guardado del usuario para reutilizar en futuros enrollments
export interface UserBeneficiary {
  id: string
  user_id: string
  first_name: string
  middle_name: string | null
  last_name: string
  relationship: string
  date_of_birth: string
  addresses: any[]
  phone_numbers: any[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Applicant {
  applicantId?: string
  firstName: string
  middleInitial?: string
  lastName: string
  gender: string
  dob: string
  ssn: string
  relationship: string
  smoker: boolean
  dateLastSmoked?: string
  weight?: number
  heightFeet?: number
  heightInches?: number
  hasPriorCoverage: boolean
  eligibleRateTier?: string
  quotedRateTier?: string
  medSuppInfo?: any
  medications?: Medication[]
  questionResponses?: any[]
  phoneNumbers?: any[]
}

export interface Coverage {
  planKey?: string
  carrierName?: string
  effectiveDate?: string
  monthlyPremium?: number
  paymentFrequency?: string
  term?: string
  numberOfTerms?: number
  terminationDate?: string
  isAutomaticLoanProvisionOptedIn?: boolean
  riders?: any[]
  discounts?: any[]
  agentNumber?: string
  beneficiaries?: Beneficiary[]
  productCode?: string
  planName?: string
  applicants?: string[] // Assuming IDs or logic handling this
}

export interface PaymentInformation {
  accountType: 'CreditCard' | 'Checking' | 'Savings'
  accountHolderFirstName: string
  accountHolderLastName: string
  // Credit Card
  creditCardNumber?: string
  cardBrand?: string
  expirationMonth?: string
  expirationYear?: string
  cvv?: string
  // Bank
  accountTypeBank?: 'Checking' | 'Savings'
  accountNumber?: string
  routingNumber?: string
  bankName?: string
  desiredDraftDate?: string
  isSubmitWithoutPayment?: boolean
}

export interface EnrollmentRequest {
  demographics: {
    zipCode: string
    email: string
    address1: string
    address2?: string
    city: string
    state: string
    phone: string
    alternatePhone?: string
    zipCodePlus4?: string
    applicants: Applicant[]
  }
  enrollmentDate: string
  coverages: Coverage[]
  paymentInformation?: PaymentInformation
  attestationInformation?: any
  partnerInformation?: any
  isEFulfillment?: boolean
}
