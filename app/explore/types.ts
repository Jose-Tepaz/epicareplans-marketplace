/**
 * Tipos para el flujo de exploración de seguros
 * 
 * Este archivo contiene todas las interfaces y tipos utilizados
 * en el proceso de recolección de información del usuario.
 */

/**
 * Datos del formulario de exploración
 */
export interface ExploreFormData {
  lookingFor: string
  insuranceType: string // Solo para "Me"
  // Campos específicos de Life Insurance
  coverageAmount: number // $10,000 - $100,000
  noMedicalExams: boolean
  immediateActivation: boolean
  // Paso general: About Your Need
  aboutYourNeed: string
  // Información Personal
  firstName: string
  lastName: string
  email: string
  phone: string
  // Campos comunes
  zipCode: string
  dateOfBirth: string
  gender: string
  smokes: boolean | null
  lastTobaccoUse: string
  coverageStartDate: string
  paymentFrequency: string
}

/**
 * Estados de validación para cada campo del formulario
 */
export interface ValidationStates {
  lookingFor: {
    isValid: boolean
    error: string
  }
  insuranceType: {
    isValid: boolean
    error: string
  }
  aboutYourNeed: {
    isValid: boolean
    error: string
  }
  personalInformation: {
    isValid: boolean
    errors: {
      firstName?: string
      lastName?: string
      email?: string
      phone?: string
    }
  }
  zipCode: {
    isValid: boolean | null
    error: string
  }
  dateOfBirth: {
    isValid: boolean
    error: string
  }
  coverageStartDate: {
    isValid: boolean
    error: string
  }
  lastTobaccoUse: {
    isValid: boolean
    error: string
  }
}

/**
 * Props comunes para los componentes de paso
 */
export interface StepProps {
  onNext: () => void
  onBack: () => void
  isValidating: boolean
  isSubmitting: boolean
  currentStep: number
  totalSteps: number
}
