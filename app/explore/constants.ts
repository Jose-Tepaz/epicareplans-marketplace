/**
 * Constantes del módulo Explore
 * 
 * Centraliza valores constantes para facilitar el mantenimiento
 * y evitar "magic numbers" en el código.
 */

/**
 * Número total de pasos en el formulario de exploración
 * Nota: Este número puede variar según el flujo condicional
 * - "Me": 8 pasos (incluye Insurance Type)
 * - Otros: 7 pasos
 */
export const TOTAL_STEPS = 8

/**
 * Rutas de navegación
 */
export const ROUTES = {
  LOGIN: '/login',
  EXPLORE: '/explore',
  INSURANCE_OPTIONS: '/insurance-options',
} as const

/**
 * Query parameters
 */
export const QUERY_PARAMS = {
  SKIP_ACCOUNT_QUESTION: 'skip-account-question',
  REDIRECT: 'redirect',
  ACTION: 'action',
} as const

/**
 * Keys para localStorage
 */
export const LOCAL_STORAGE_KEYS = {
  USER_ZIP_CODE: 'userZipCode',
  INSURANCE_FORM_DATA: 'insuranceFormData',
  INSURANCE_PLANS: 'insurancePlans',
} as const

/**
 * Keys para sessionStorage
 */
export const SESSION_STORAGE_KEYS = {
  INSURANCE_FORM_DATA: 'insuranceFormData',
  INSURANCE_PLANS: 'insurancePlans',
  EXPLORE_DATA: 'exploreData',
} as const

/**
 * Opciones de cobertura (Looking For)
 */
export const LOOKING_FOR_OPTIONS = [
  { 
    value: 'me', 
    label: 'Me',
    subtitle: 'Individual Coverage',
    description: 'Protection for yourself'
  },
  { 
    value: 'me-family', 
    label: 'Me + Family',
    subtitle: 'Family Protection',
    description: 'Coverage for you and your loved ones'
  },
  { 
    value: 'employees', 
    label: 'Employees',
    subtitle: 'Group Insurance',
    description: 'Business coverage for your team'
  },
  { 
    value: 'pet', 
    label: 'Pet',
    subtitle: 'Pet Coverage',
    description: 'Protection for your furry friends'
  },
] as const

/**
 * Opciones de tipo de seguro (Insurance Type)
 * Solo aparece cuando lookingFor === 'me'
 */
export const INSURANCE_TYPE_OPTIONS = [
  {
    value: 'life',
    label: 'Life',
    subtitle: 'Life Protection',
    description: 'Financial security for your loved ones',
    icon: '👤'
  },
  {
    value: 'health',
    label: 'Health',
    subtitle: 'Medical Coverage',
    description: 'Comprehensive healthcare protection',
    icon: '🏥'
  },
  {
    value: 'supplementary',
    label: 'Supplementary',
    subtitle: 'Extra Benefits',
    description: 'Additional coverage options',
    icon: '➕'
  },
] as const

/**
 * Opciones de "About Your Need"
 * Paso general (no condicional) que aparece después del Progress Overview
 */
export const ABOUT_YOUR_NEED_OPTIONS = [
  {
    value: 'change-plan-economical',
    label: 'Cambiar mi plan actual',
    description: 'Tengo seguro de salud pero necesito cambiarlo por otro mas economico.'
  },
  {
    value: 'change-plan-eligibility',
    label: 'Cambiar mi plan actual',
    description: 'Perdí mi seguro por un cambio en mi elegibilidad y necesito uno nuevo.'
  },
  {
    value: 'temporary-insurance',
    label: 'Seguro Temporal',
    description: 'Estare solo unos meses en el pais y necesito un seguro de termino corto'
  },
  {
    value: 'independent-work',
    label: 'Trabajo independiente',
    description: 'Cambié de trabajo / ahora trabajo por mi cuenta y no tengo seguro.'
  },
  {
    value: 'emergency-protection',
    label: 'Proteccion de emergencia',
    description: 'No quiero quedarme sin protección en caso de una emergencia.'
  },
] as const

/**
 * Opciones de género
 */
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
] as const

/**
 * Opciones de frecuencia de pago
 */
export const PAYMENT_FREQUENCY_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'semi-annually', label: 'Semi-Annually' },
  { value: 'annually', label: 'Annually' },
] as const

/**
 * Configuración de fechas
 */
export const DATE_CONFIG = {
  MIN_AGE: 18, // Edad mínima requerida
  DEFAULT_COVERAGE_START_MONTHS: 1, // Meses en el futuro para inicio de cobertura por defecto
} as const

/**
 * Configuración de validación
 */
export const VALIDATION_CONFIG = {
  ZIP_CODE_LENGTH: 5,
  ZIP_CODE_PATTERN: /^\d{5}$/,
} as const

/**
 * Mensajes de error predeterminados
 */
export const ERROR_MESSAGES = {
  ZIP_CODE_FORMAT: 'Please enter a valid 5-digit ZIP code',
  ZIP_CODE_NOT_FOUND: 'ZIP code not found. Please enter a valid ZIP code.',
  ZIP_CODE_API_ERROR: 'Error validating ZIP code. Please try again.',
  DATE_OF_BIRTH_REQUIRED: 'Please enter your date of birth',
  DATE_OF_BIRTH_MIN_AGE: 'You must be at least 18 years old',
  COVERAGE_START_DATE_REQUIRED: 'Please select a coverage start date',
  COVERAGE_START_DATE_PAST: 'Coverage start date must be today or later',
  LAST_TOBACCO_USE_REQUIRED: 'Please enter when you last used tobacco',
} as const

/**
 * Mensajes de éxito
 */
export const SUCCESS_MESSAGES = {
  ZIP_CODE_VALID: 'Valid ZIP code',
  DATE_OF_BIRTH_VALID: 'Valid date of birth',
  COVERAGE_START_DATE_VALID: 'Valid coverage start date',
  LAST_TOBACCO_USE_VALID: 'Valid last tobacco use',
} as const

/**
 * Logging prefixes (emojis para debugging)
 */
export const LOG_PREFIXES = {
  DEBUG: '🔍',
  SUCCESS: '✅',
  ERROR: '❌',
  WARNING: '⚠️',
  SAVE: '💾',
  NAVIGATE: '🚀',
  LOADING: '⏳',
  INFO: 'ℹ️',
} as const
