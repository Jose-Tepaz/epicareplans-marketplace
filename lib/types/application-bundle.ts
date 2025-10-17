// ApplicationBundle API Types
// Basado en la documentación de ApplicationBundleAPI.md

export interface ApplicationBundleRequest {
  state: string
  planIds: string[]
  planKeys: string[]
  effectiveDate: string
  dateOfBirth?: string
  agentNumber?: string
  isEFulfillment?: boolean
  isFulfillment?: boolean
  isTrioMedAme?: boolean
  isTrioMedCi?: boolean
  isBundledWithRecuro?: boolean
  paymentFrequency?: string
  termLengthInDays?: number
  isRenewalRider?: boolean
  memberCount?: number
  rateTier?: string
  medSuppEnrollmentType?: string
  userType?: string
  applicationFormNumber?: string
  stmCarrierInformation?: {
    firstTermCarrierName?: string
    secondTermCarrierName?: string
    thirdTermCarrierName?: string
  }
}

export interface PossibleAnswer {
  id: number
  questionId: number
  answerText: string
  answerType: 'Radio' | 'Checkbox' | 'FreeText' | 'Date' | 'MonthYearDate' | 'TextArea'
  isKnockOut?: boolean
  errorMessage?: string
}

export interface ConditionalQuestion {
  questionId: number
  answerId: number
}

export interface EligibilityQuestion {
  questionId: number
  questionText: string
  questionType: 'Eligibility' | 'Authorization' | 'PreEx' | 'HRF' | 'GeneralQuestion' | 'PriorInsurance' | 'Creditable' | 'Hidden'
  sequenceNo: number
  possibleAnswers: PossibleAnswer[]
  condition?: ConditionalQuestion
}

export interface AuthorizationQuestion {
  questionId: number
  questionText: string
  questionType: 'Authorization'
  possibleAnswers: PossibleAnswer[]
}

export interface Application {
  productId: string
  stateId: string
  product: string
  applicationType: 'Individual' | 'Association'
  eligibilityTitle?: string
  eligibilityQuestionHeader?: string
  eligibilityQuestions: EligibilityQuestion[]
  authorizationTitle?: string
  authorizations: AuthorizationQuestion[]
  generalQuestions: any[]
  questionSections: any[]
  formVersion?: string
  formNumber?: string
  carrierName?: string
}

export interface ApplicationBundleResponse {
  applications: Application[]
  authorizationText?: string
  validationErrors: any[]
}

export interface ApplicationBundleError {
  errorCode: string
  errorDetail: string
}

// Mapeo de respuestas para el formulario dinámico
export interface DynamicQuestionResponse {
  questionId: number
  response: string
  dataKey?: string
}

// Estado del formulario dinámico
export interface DynamicFormState {
  questions: EligibilityQuestion[]
  responses: DynamicQuestionResponse[]
  hasKnockoutAnswers: boolean
  knockoutErrors: string[]
}

// Tipos de validación
export interface QuestionValidation {
  isValid: boolean
  errors: string[]
  knockoutAnswers: number[]
}
