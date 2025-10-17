// Enrollment form types for All State API

export interface PhoneNumber {
  phoneNumber: string
  phoneType: 'Home' | 'Work' | 'Mobile'
  allowTextMessaging?: boolean
  allowServiceCalls?: boolean
}

export interface Address {
  city: string
  state: string
  country?: string
  streetAddress: string
  secondaryStreetAddress?: string
  type?: string
  zipCode: string
  zipCodePlus4?: string
}

export interface Medication {
  genericName: string
  originalRXDate: string
  frequency: string
  dosage: string
  rxReason: string
  isActivelyTaking: boolean
}

export interface QuestionResponse {
  questionId: number
  response: string
  dataKey?: string
}

export interface MedSuppInfo {
  medicarePartAEffectiveDate?: string
  medicarePartBEffectiveDate?: string
  medicareId?: string
  isPreMACRAEligible?: boolean
}

export interface Applicant {
  gender: string
  dob: string
  smoker: boolean
  relationship: string
  firstName: string
  middleInitial?: string
  lastName: string
  ssn: string
  weight: number
  heightFeet: number
  heightInches: number
  dateLastSmoked?: string
  hasPriorCoverage: boolean
  eligibleRateTier?: string
  quotedRateTier?: string
  questionResponses?: QuestionResponse[]
  applicantId?: string
  medSuppInfo?: MedSuppInfo
  phoneNumbers?: PhoneNumber[]
  medications?: Medication[]
}

export interface Beneficiary {
  beneficiaryId?: number
  firstName: string
  middleName?: string
  lastName: string
  relationship: string
  allocationPercentage: number
  dateOfBirth: string
  addresses: Address[]
  phoneNumbers: PhoneNumber[]
}

export interface Rider {
  code: string
  name: string
}

export interface Coverage {
  planKey: string
  effectiveDate: string
  term?: number
  numberOfTerms?: number
  monthlyPremium: number
  paymentFrequency: string
  terminationDate?: string
  insuranceNetwork?: string
  carrierName?: string
  guaranteedRenewalTerms?: number
  renewalRateGuarantee?: boolean
  partnerApplicationId?: number
  riders?: Rider[]
  agentNumber?: string
  discounts?: string[]
  isListBill?: boolean
  beneficiaries?: Beneficiary[]
  isAutomaticLoanProvisionOptedIn?: boolean
}

export interface PaymentInformation {
  accountHolderFirstName: string
  accountHolderLastName: string
  // Credit Card
  creditCardNumber?: string
  expirationMonth?: number
  expirationYear?: number
  cvv?: string
  cardBrand?: string
  // Bank Account
  routingNumber?: string
  accountNumber?: string
  bankName?: string
  accountType?: 'checking' | 'savings'
  bankDraft?: string
  initialDraftDate?: string
  desiredDraftDate?: number
  // Options
  isSubmitWithoutPayment?: boolean
}

export interface AttestationInformation {
  referenceId?: string
  dateCollected: string
  type: string
  value: string
  clientIPAddress: string
}

export interface PartnerInformation {
  agentNumber: string
  clientCaseID?: string
  confirmationURL?: string
  clientIPAddress: string
}

export interface Demographics {
  zipCode: string
  email: string
  address1: string
  address2?: string
  city: string
  state: string
  phone: string
  alternatePhone?: string
  applicants: Applicant[]
  isEFulfillment?: boolean
  isRewrite?: boolean
  isListBill?: boolean
  listBillNumber?: string
  optionalDiscount?: boolean
  includeAssociationPlans?: boolean
  addresses?: Address[]
  zipCodePlus4?: string
}

export interface EnrollmentRequest {
  demographics: Demographics
  coverages: Coverage[]
  beneficiary?: Beneficiary
  paymentInformation: PaymentInformation
  partnerInformation: PartnerInformation
  questionResponses?: QuestionResponse[]
  attestationInformation: AttestationInformation
  enrollmentDate: string
  isAdditionalInterestedPartyOptedOut?: boolean
  isAutomaticLoanProvisionOptedIn?: boolean
  marketerRedirectUrl?: string
}

// Form state for multi-step form
export interface EnrollmentFormState {
  // Step 1: Personal Information
  firstName: string
  middleInitial: string
  lastName: string
  gender: string
  dateOfBirth: string
  ssn: string
  relationship: string
  email: string
  phone: string
  alternatePhone: string

  // Step 2: Health Information
  weight: number | string
  heightFeet: number | string
  heightInches: number | string
  smoker: boolean
  dateLastSmoked: string
  hasPriorCoverage: boolean
  // Medicare info
  hasMedicare: boolean
  medicarePartAEffectiveDate: string
  medicarePartBEffectiveDate: string
  medicareId: string
  isPreMACRAEligible: boolean

  // Step 3: Address
  address1: string
  address2: string
  city: string
  state: string
  zipCode: string
  zipCodePlus4: string

  // Step 4: Additional Applicants
  additionalApplicants: Applicant[]

  // Step 5: Coverage (from cart)
  selectedPlans: any[]
  effectiveDate: string
  paymentFrequency: string
  isEFulfillment: boolean
  isAutomaticLoanProvisionOptedIn: boolean

  // Step 6: Beneficiaries
  beneficiaries: Beneficiary[]

  // Step 7: Health Questions
  questionResponses: QuestionResponse[]
  medications: Medication[]

  // Step 8: Payment
  paymentMethod: 'credit_card' | 'bank_account'
  accountHolderFirstName: string
  accountHolderLastName: string
  // Credit card
  creditCardNumber: string
  expirationMonth: string
  expirationYear: string
  cvv: string
  cardBrand: string
  // Bank
  routingNumber: string
  accountNumber: string
  bankName: string
  accountType: 'checking' | 'savings' | ''
  desiredDraftDate: number | string
  submitWithoutPayment: boolean

  // Step 9: Attestation
  agreeToTerms: boolean
  signature: string
  signatureDate: string
}
