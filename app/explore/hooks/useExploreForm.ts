/**
 * Hook personalizado para manejar el estado y lógica del formulario de exploración
 * 
 * Este hook centraliza toda la lógica del formulario, incluyendo:
 * - Estado del formulario
 * - Estados de validación
 * - Funciones de validación
 * - Navegación entre pasos
 * - Envío de datos
 */

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { ExploreFormData, ValidationStates } from '../types'
import {
  validateZipCode,
  validateDateOfBirth,
  validateCoverageStartDate,
  validateLastTobaccoUse,
  validatePersonalInformation,
} from '../utils/validations'
import { saveExploreDataToSession } from '@/lib/utils/session-storage'
import { saveExploreDataToProfile } from '@/lib/api/enrollment-db'
import { formatDateToLocal, getFutureDate } from '../utils/dateHelpers'
import { DATE_CONFIG, ROUTES, SESSION_STORAGE_KEYS } from '../constants'

export const useExploreForm = (user: any) => {
  const router = useRouter()

  // Estado del formulario
  const [formData, setFormData] = useState<ExploreFormData>({
    lookingFor: '',
    insuranceType: '',
    // Life insurance específico
    coverageAmount: 20000, // Default: $20,000
    noMedicalExams: true, // Default: checked
    immediateActivation: true, // Default: checked
    // Paso general: About Your Need
    aboutYourNeed: '',
    // Información Personal
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    // Campos comunes
    zipCode: '',
    dateOfBirth: '',
    gender: '',
    smokes: null,
    lastTobaccoUse: '',
    coverageStartDate: formatDateToLocal(getFutureDate(DATE_CONFIG.DEFAULT_COVERAGE_START_MONTHS)),
    paymentFrequency: '',
  })

  // Estados de validación
  const [validationStates, setValidationStates] = useState<ValidationStates>({
    lookingFor: { isValid: false, error: '' },
    insuranceType: { isValid: false, error: '' },
    aboutYourNeed: { isValid: false, error: '' },
    personalInformation: { 
      isValid: false, 
      errors: {} 
    },
    zipCode: { isValid: null, error: '' },
    dateOfBirth: { isValid: false, error: '' },
    coverageStartDate: { isValid: false, error: '' },
    lastTobaccoUse: { isValid: false, error: '' },
  })

  // Estados de loading
  const [isValidating, setIsValidating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Actualiza un campo del formulario
   */
  const updateField = useCallback(<K extends keyof ExploreFormData>(
    field: K,
    value: ExploreFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpiar error de validación al escribir (solo para campos con validación)
    const validationKeys: (keyof ValidationStates)[] = [
      'lookingFor', 'insuranceType', 'aboutYourNeed', 'personalInformation', 
      'zipCode', 'dateOfBirth', 'coverageStartDate', 'lastTobaccoUse'
    ]
    
    // Campos que afectan personalInformation
    const personalInfoFields = ['firstName', 'lastName', 'email', 'phone']
    if (personalInfoFields.includes(field)) {
      setValidationStates(prev => ({
        ...prev,
        personalInformation: {
          ...prev.personalInformation,
          errors: {}
        }
      }))
    }
    if (validationKeys.includes(field as keyof ValidationStates)) {
      setValidationStates(prev => {
        const current = prev[field as keyof ValidationStates]
        return {
          ...prev,
          [field]: {
            ...(current ?? {}),
            error: ''
          }
        }
      })
    }
  }, [])

  /**
   * Valida un paso específico del formulario
   */
  const validateStep = useCallback(async (step: number): Promise<boolean> => {
    setIsValidating(true)
    let isValid = true

    const isFlowMe = formData.lookingFor === 'me'
    const isFlowMeLife = isFlowMe && formData.insuranceType === 'life'

    try {
      // Paso 1: Looking For (todos)
      if (step === 1) {
        isValid = formData.lookingFor.trim().length > 0
      }
      
      // Paso 2: Insurance Type (Me) o ZIP Code (otros)
      else if (step === 2) {
        if (isFlowMe) {
          isValid = formData.insuranceType.trim().length > 0
        } else {
          const result = await validateZipCode(formData.zipCode)
          setValidationStates(prev => ({ ...prev, zipCode: result }))
          isValid = result.isValid
        }
      }
      
      // Paso 3: Customize Life (Me+Life) O Progress Overview (otros)
      else if (step === 3) {
        if (isFlowMeLife) {
          // No hay validación especial para customize life (siempre válido)
          isValid = true
        } else {
          // Progress Overview - siempre válido (no captura datos)
          isValid = true
        }
      }
      
      // Paso 4: Progress Overview (Me+Life) O About Your Need (Me otros) O About Your Need (otros)
      else if (step === 4) {
        if (isFlowMeLife) {
          // Progress Overview - siempre válido (no captura datos)
          isValid = true
        } else {
          // About Your Need - validar selección
          isValid = formData.aboutYourNeed.trim().length > 0
          setValidationStates(prev => ({
            ...prev,
            aboutYourNeed: {
              isValid,
              error: isValid ? '' : 'Please select an option'
            }
          }))
        }
      }
      
      // Paso 5: About Your Need (Me+Life) O Let's Get to Know You (Me otros) O Let's Get to Know You (otros)
      else if (step === 5) {
        if (isFlowMeLife) {
          // About Your Need - validar selección
          isValid = formData.aboutYourNeed.trim().length > 0
          setValidationStates(prev => ({
            ...prev,
            aboutYourNeed: {
              isValid,
              error: isValid ? '' : 'Please select an option'
            }
          }))
        } else {
          // Let's Get to Know You - siempre válido (no captura datos)
          isValid = true
        }
      }
      
      // Paso 6: Let's Get to Know You (Me+Life) O Personal Information (Me otros) O Personal Information (otros)
      else if (step === 6) {
        if (isFlowMeLife) {
          // Let's Get to Know You - siempre válido (no captura datos)
          isValid = true
        } else {
          // Personal Information - validar todos los campos
          const result = validatePersonalInformation(
            formData.firstName,
            formData.lastName,
            formData.email,
            formData.phone
          )
          setValidationStates(prev => ({
            ...prev,
            personalInformation: result
          }))
          isValid = result.isValid
        }
      }
      
      // Paso 7: Personal Information (Me+Life) O ZIP Code (Me otros) O ZIP Code (otros)
      else if (step === 7) {
        if (isFlowMeLife) {
          // Personal Information - validar todos los campos
          const result = validatePersonalInformation(
            formData.firstName,
            formData.lastName,
            formData.email,
            formData.phone
          )
          setValidationStates(prev => ({
            ...prev,
            personalInformation: result
          }))
          isValid = result.isValid
        } else if (isFlowMe) {
          const result = await validateZipCode(formData.zipCode)
          setValidationStates(prev => ({ ...prev, zipCode: result }))
          isValid = result.isValid
        } else {
          const result = await validateZipCode(formData.zipCode)
          setValidationStates(prev => ({ ...prev, zipCode: result }))
          isValid = result.isValid
        }
      }
      
      // Paso 8: ZIP Code (Me+Life) O Date of Birth (Me otros) O Date of Birth (otros)
      else if (step === 8) {
        if (isFlowMeLife) {
          const result = await validateZipCode(formData.zipCode)
          setValidationStates(prev => ({ ...prev, zipCode: result }))
          isValid = result.isValid
        } else if (isFlowMe) {
          const result = validateDateOfBirth(formData.dateOfBirth)
          setValidationStates(prev => ({ ...prev, dateOfBirth: result }))
          isValid = result.isValid
        } else {
          const result = validateDateOfBirth(formData.dateOfBirth)
          setValidationStates(prev => ({ ...prev, dateOfBirth: result }))
          isValid = result.isValid
        }
      }
      
      // Paso 8: Date of Birth (Me+Life) O Gender (Me otros) O Gender (otros)
      else if (step === 8) {
        if (isFlowMeLife) {
          const result = validateDateOfBirth(formData.dateOfBirth)
          setValidationStates(prev => ({ ...prev, dateOfBirth: result }))
          isValid = result.isValid
        } else {
          isValid = true // Gender no requiere validación especial
        }
      }
      
      // Paso 9: Gender (Me+Life) O Tobacco (Me otros) O Tobacco (otros)
      else if (step === 9) {
        if (isFlowMeLife) {
          isValid = true // Gender no requiere validación especial
        } else if (formData.smokes) {
          const result = validateLastTobaccoUse(formData.lastTobaccoUse, formData.smokes)
          setValidationStates(prev => ({ ...prev, lastTobaccoUse: result }))
          isValid = result.isValid
        }
      }
      
      // Paso 10: Tobacco (Me+Life) O Coverage Start Date (Me otros) O Coverage Start Date (otros)
      else if (step === 10) {
        if (isFlowMeLife) {
          if (formData.smokes) {
            const result = validateLastTobaccoUse(formData.lastTobaccoUse, formData.smokes)
            setValidationStates(prev => ({ ...prev, lastTobaccoUse: result }))
            isValid = result.isValid
          }
        } else {
          const result = validateCoverageStartDate(formData.coverageStartDate)
          setValidationStates(prev => ({ ...prev, coverageStartDate: result }))
          isValid = result.isValid
        }
      }
      
      // Paso 11: Coverage Start Date (Me+Life) O Payment Frequency (Me otros) O Payment Frequency (otros)
      else if (step === 11) {
        if (isFlowMeLife) {
          const result = validateCoverageStartDate(formData.coverageStartDate)
          setValidationStates(prev => ({ ...prev, coverageStartDate: result }))
          isValid = result.isValid
        } else {
          isValid = true // Payment Frequency no requiere validación especial
        }
      }
      
      // Paso 12: Payment Frequency (solo Me+Life)
      else if (step === 12) {
        isValid = true // Payment Frequency no requiere validación especial
      }
    } finally {
      setIsValidating(false)
    }

    return isValid
  }, [formData])

  /**
   * Verifica si un paso está completo y puede avanzar
   */
  const isStepValid = useCallback((step: number): boolean => {
    const isFlowMe = formData.lookingFor === 'me'
    const isFlowMeLife = isFlowMe && formData.insuranceType === 'life'
    
    // Paso 1: Looking For (todos)
    if (step === 1) {
      return formData.lookingFor.trim().length > 0
    }
    
    // Paso 2: Insurance Type (Me) o ZIP Code (otros)
    if (step === 2) {
      return isFlowMe
        ? formData.insuranceType.trim().length > 0
        : formData.zipCode.trim().length > 0
    }
    
    // Paso 3: Customize Life (Me+Life) O Progress Overview (otros)
    if (step === 3) {
      return true // Siempre válido (Customize Life o Progress Overview)
    }
    
    // Paso 4: Progress Overview (Me+Life) O About Your Need (Me otros) O About Your Need (otros)
    if (step === 4) {
      if (isFlowMeLife) return true // Progress Overview siempre válido
      return formData.aboutYourNeed.trim().length > 0
    }
    
    // Paso 5: About Your Need (Me+Life) O Let's Get to Know You (Me otros) O Let's Get to Know You (otros)
    if (step === 5) {
      if (isFlowMeLife) return formData.aboutYourNeed.trim().length > 0
      return true // Let's Get to Know You siempre válido
    }
    
    // Paso 6: Let's Get to Know You (Me+Life) O Personal Information (Me otros) O Personal Information (otros)
    if (step === 6) {
      if (isFlowMeLife) return true // Let's Get to Know You siempre válido
      return formData.firstName.trim().length > 0 && 
             formData.lastName.trim().length > 0 && 
             formData.email.trim().length > 0 && 
             formData.phone.trim().length > 0
    }
    
    // Paso 7: Personal Information (Me+Life) O ZIP Code (Me otros) O ZIP Code (otros)
    if (step === 7) {
      if (isFlowMeLife) {
        return formData.firstName.trim().length > 0 && 
               formData.lastName.trim().length > 0 && 
               formData.email.trim().length > 0 && 
               formData.phone.trim().length > 0
      }
      return formData.zipCode.trim().length > 0
    }
    
    // Paso 8: ZIP Code (Me+Life) O Date of Birth (Me otros) O Date of Birth (otros)
    if (step === 8) {
      if (isFlowMeLife) return formData.zipCode.trim().length > 0
      return formData.dateOfBirth.trim().length > 0
    }
    
    // Paso 9: Date of Birth (Me+Life) O Gender (Me otros) O Gender (otros)
    if (step === 9) {
      if (isFlowMeLife) return formData.dateOfBirth.trim().length > 0
      return formData.gender.trim().length > 0
    }
    
    // Paso 10: Gender (Me+Life) O Tobacco (Me otros) O Tobacco (otros)
    if (step === 10) {
      if (isFlowMeLife) return formData.gender.trim().length > 0
      return formData.smokes !== null && (formData.smokes === false || formData.lastTobaccoUse.trim().length > 0)
    }
    
    // Paso 11: Tobacco (Me+Life) O Coverage Start Date (Me otros) O Coverage Start Date (otros)
    if (step === 11) {
      if (isFlowMeLife) {
        return formData.smokes !== null && (formData.smokes === false || formData.lastTobaccoUse.trim().length > 0)
      }
      return formData.coverageStartDate.trim().length > 0
    }
    
    // Paso 12: Coverage Start Date (Me+Life) O Payment Frequency (Me otros) O Payment Frequency (otros)
    if (step === 12) {
      if (isFlowMeLife) return formData.coverageStartDate.trim().length > 0
      return formData.paymentFrequency.trim().length > 0
    }
    
    // Paso 13: Payment Frequency (solo Me+Life)
    if (step === 13) {
      return formData.paymentFrequency.trim().length > 0
    }
    
    return false
  }, [formData])

  /**
   * Envía el formulario final y redirige a opciones de seguro
   */
  const submitForm = useCallback(async (): Promise<void> => {
    setIsSubmitting(true)

    try {
      // Guardar datos en sessionStorage (formato anterior para compatibilidad)
      console.log('💾 Saving form data to sessionStorage:', formData)
      sessionStorage.setItem(SESSION_STORAGE_KEYS.INSURANCE_FORM_DATA, JSON.stringify(formData))

      // Guardar datos de explore para el perfil (formato nuevo)
      const exploreData = {
        zip_code: formData.zipCode,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        is_smoker: formData.smokes || false,
        last_tobacco_use: formData.smokes ? formData.lastTobaccoUse : undefined,
      }
      saveExploreDataToSession(exploreData)
      console.log('💾 Saving explore data for profile:', exploreData)

      // Si el usuario está autenticado, guardar inmediatamente en el perfil
      if (user) {
        try {
          console.log('✅ User is authenticated, saving explore data to profile...')
          await saveExploreDataToProfile(exploreData)
          console.log('✅ Explore data saved to profile successfully')
        } catch (error) {
          console.error('❌ Error saving explore data to profile:', error)
          // Continuar de todas formas
        }
      }

      // Intentar obtener cotizaciones
      try {
        const response = await fetch('/api/insurance/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        
        if (response.ok) {
          const result = await response.json()
          sessionStorage.setItem(SESSION_STORAGE_KEYS.INSURANCE_PLANS, JSON.stringify(result.plans))
        }
      } catch (error) {
        console.error('Error fetching insurance quotes:', error)
        // Continuar incluso si falla la API
      }

      // Redirigir a opciones de seguro
      router.push(ROUTES.INSURANCE_OPTIONS)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, user, router])

  /**
   * Pre-llena el formulario con datos del perfil del usuario
   */
  const prefillFromProfile = useCallback((profile: any) => {
    console.log('📝 Pre-llenando datos del formulario desde perfil...')
    
    const updates: Partial<ExploreFormData> = {}
    
    if (profile.date_of_birth) {
      updates.dateOfBirth = profile.date_of_birth
      console.log('  ✓ date_of_birth:', profile.date_of_birth)
    }
    if (profile.gender) {
      updates.gender = profile.gender
      console.log('  ✓ gender:', profile.gender)
    }
    if (profile.is_smoker !== null && profile.is_smoker !== undefined) {
      updates.smokes = profile.is_smoker
      console.log('  ✓ is_smoker:', profile.is_smoker)
    }
    if (profile.last_tobacco_use) {
      updates.lastTobaccoUse = profile.last_tobacco_use
      console.log('  ✓ last_tobacco_use:', profile.last_tobacco_use)
    }
    if (profile.zip_code) {
      updates.zipCode = profile.zip_code
      console.log('  ✓ zip_code:', profile.zip_code)
    }
    if (profile.coverage_start_date) {
      updates.coverageStartDate = profile.coverage_start_date
      console.log('  ✓ coverage_start_date:', profile.coverage_start_date)
    }
    if (profile.payment_frequency) {
      updates.paymentFrequency = profile.payment_frequency
      console.log('  ✓ payment_frequency:', profile.payment_frequency)
    }

    setFormData(prev => ({ ...prev, ...updates }))
  }, [])

  return {
    formData,
    validationStates,
    isValidating,
    isSubmitting,
    updateField,
    validateStep,
    isStepValid,
    submitForm,
    prefillFromProfile,
  }
}
