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
  // Algunas variantes del backend/serialización pueden exponer el flag con diferente casing.
  // Se mantiene opcional para compatibilidad.
  isKnockout?: boolean
  errorMessage?: string
}

export interface QuestionVisibilityRule {
  questionId: number
  values?: number[]
  isDefaultHidden: boolean
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
  // Algunas respuestas del API incluyen reglas de visibilidad por valores de otras preguntas.
  questionVisibilityRules?: QuestionVisibilityRule[]
  // Si no viene informado, algunos flujos asumen que la pregunta es requerida por defecto.
  isRequired?: boolean
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
  // Forma legacy: ciertos flujos manejan IDs seleccionados como número(s).
  answerIds?: number | number[]
}

// Estado del formulario dinámico
export interface DynamicFormState {
  questions: EligibilityQuestion[]
  questionSections?: any[]
  responses: DynamicQuestionResponse[]
  hasKnockoutAnswers: boolean
  knockoutAnswers: number[]
}

// Tipos de validación
export interface QuestionValidation {
  isValid: boolean
  errors: string[]
  knockoutAnswers: number[]
}
