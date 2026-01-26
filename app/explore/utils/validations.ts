/**
 * Funciones de validación para el formulario de exploración
 * 
 * Este archivo centraliza toda la lógica de validación de campos,
 * facilitando el mantenimiento y las pruebas.
 */

import { parseDateLocal, calculateAge } from './dateHelpers'
import { VALIDATION_CONFIG, ERROR_MESSAGES, DATE_CONFIG, LOCAL_STORAGE_KEYS } from '../constants'

/**
 * Valida un código postal de 5 dígitos y verifica su existencia
 * @param zip - Código postal a validar
 * @returns Promise con resultado de validación
 */
export const validateZipCode = async (zip: string): Promise<{
  isValid: boolean
  error: string
}> => {
  // Validación de formato
  if (!zip || !VALIDATION_CONFIG.ZIP_CODE_PATTERN.test(zip)) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.ZIP_CODE_FORMAT
    }
  }

  try {
    // Validación contra API
    const response = await fetch(`/api/address/validate-zip/${zip}`)
    const data = await response.json()
    
    if (data.success) {
      // Guardar ZIP code en localStorage para el enrollment
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER_ZIP_CODE, zip)
      console.log('ZIP code guardado en localStorage:', zip)
      
      return {
        isValid: true,
        error: ""
      }
    } else {
      return {
        isValid: false,
        error: ERROR_MESSAGES.ZIP_CODE_NOT_FOUND
      }
    }
  } catch (error) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.ZIP_CODE_API_ERROR
    }
  }
}

/**
 * Valida la fecha de nacimiento (debe ser mayor de 18 años)
 * @param date - Fecha de nacimiento en formato YYYY-MM-DD
 * @returns Resultado de validación
 */
export const validateDateOfBirth = (date: string): {
  isValid: boolean
  error: string
} => {
  if (!date) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.DATE_OF_BIRTH_REQUIRED
    }
  }

  const birthDate = parseDateLocal(date)
  const age = calculateAge(birthDate)

  if (age < DATE_CONFIG.MIN_AGE) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.DATE_OF_BIRTH_MIN_AGE
    }
  }

  return {
    isValid: true,
    error: ""
  }
}

/**
 * Valida la fecha de inicio de cobertura (debe ser hoy o futura)
 * @param date - Fecha de inicio en formato YYYY-MM-DD
 * @returns Resultado de validación
 */
export const validateCoverageStartDate = (date: string): {
  isValid: boolean
  error: string
} => {
  if (!date) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.COVERAGE_START_DATE_REQUIRED
    }
  }

  const startDate = parseDateLocal(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time to start of day

  if (startDate < today) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.COVERAGE_START_DATE_PAST
    }
  }

  return {
    isValid: true,
    error: ""
  }
}

/**
 * Valida la fecha de último uso de tabaco (requerida si el usuario fuma)
 * @param date - Fecha de último uso
 * @param smokes - Indica si el usuario fuma
 * @returns Resultado de validación
 */
export const validateLastTobaccoUse = (date: string, smokes: boolean | null): {
  isValid: boolean
  error: string
} => {
  if (smokes && !date) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.LAST_TOBACCO_USE_REQUIRED
    }
  }

  return {
    isValid: true,
    error: ""
  }
}

/**
 * Valida un email
 * @param email - Email a validar
 * @returns Resultado de validación
 */
export const validateEmail = (email: string): {
  isValid: boolean
  error: string
} => {
  if (!email || email.trim().length === 0) {
    return {
      isValid: false,
      error: 'Email is required'
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    }
  }

  return {
    isValid: true,
    error: ""
  }
}

/**
 * Valida un número de teléfono (formato básico)
 * @param phone - Teléfono a validar
 * @returns Resultado de validación
 */
export const validatePhone = (phone: string): {
  isValid: boolean
  error: string
} => {
  if (!phone || phone.trim().length === 0) {
    return {
      isValid: false,
      error: 'Phone number is required'
    }
  }

  // Remover espacios, guiones, paréntesis para validar
  const cleaned = phone.replace(/[\s\-\(\)]/g, '')
  // Validar que tenga al menos 10 dígitos
  if (cleaned.length < 10) {
    return {
      isValid: false,
      error: 'Please enter a valid phone number'
    }
  }

  return {
    isValid: true,
    error: ""
  }
}

/**
 * Valida la información personal completa
 * @param firstName - Nombre
 * @param lastName - Apellido
 * @param email - Email
 * @param phone - Teléfono
 * @returns Resultado de validación con errores por campo
 */
export const validatePersonalInformation = (
  firstName: string,
  lastName: string,
  email: string,
  phone: string
): {
  isValid: boolean
  errors: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
  }
} => {
  const errors: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
  } = {}

  // Validar First Name
  if (!firstName || firstName.trim().length === 0) {
    errors.firstName = 'First name is required'
  }

  // Validar Last Name
  if (!lastName || lastName.trim().length === 0) {
    errors.lastName = 'Last name is required'
  }

  // Validar Email
  const emailValidation = validateEmail(email)
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error
  }

  // Validar Phone
  const phoneValidation = validatePhone(phone)
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.error
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
