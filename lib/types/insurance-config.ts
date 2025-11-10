/**
 * Tipos para configuración de aseguradoras
 * Soporte para múltiples aseguradoras con campos y pagos específicos
 */

export interface PaymentConfig {
  id: string
  company_id: string
  payment_processor: string
  payment_api_endpoint: string
  tokenization_endpoint: string | null
  supports_credit_card: boolean
  supports_debit_card: boolean
  supports_ach: boolean
  credit_card_config?: {
    brands: string[]
    requires_cvv: boolean
    min_cvv_length: number
  }
  ach_config?: {
    account_types: string[]
    requires_routing: boolean
    routing_length: number
  }
  supported_payment_frequencies?: string[]
  requires_tokenization: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PaymentTransaction {
  id: string
  application_id: string
  company_id: string
  transaction_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  transaction_reference?: string
  amount: number
  currency: string
  payment_method: 'credit_card' | 'debit_card' | 'ach' | 'bank_account'
  payment_token?: string | null
  payment_frequency?: string
  next_payment_date?: string
  payment_schedule?: any
  payment_method_info?: {
    last4?: string
    brand?: string
    account_type?: string
  }
  processor_response?: any
  processor_error?: any
  processed_at?: string
  created_at: string
  updated_at: string
}

export interface FieldConfig {
  id: string
  company_id: string
  field_name: string
  field_category: string
  is_required: boolean
  is_enabled: boolean
  field_type: string
  validation_rules?: any
  error_message?: string
  api_field_name?: string
  api_section?: string
  transformation_rule?: any
  display_label?: string
  display_placeholder?: string
  help_text?: string
  display_order: number
  created_at: string
  updated_at: string
}

export interface FormSection {
  id: string
  company_id: string
  section_name: string
  section_title?: string
  section_description?: string
  is_enabled: boolean
  is_required: boolean
  section_config?: any
  conditional_logic?: any
  display_order: number
  created_at: string
  updated_at: string
}

export interface EnrollmentByCompany {
  company_id: string
  company_slug: string
  plans: any[]
  amount: number
}

export interface MultiCarrierResult {
  company: string
  success: boolean
  error?: any
  application_id?: string
}

export interface SubmissionResult {
  id: string
  application_id: string
  plan_type?: number
  plan_key?: string
  submission_received: boolean
  policy_no?: string
  total_rate?: number
  effective_date?: string
  application_id_external?: number
  partner_application_id?: number
  submission_errors?: any[]
  created_at: string
  updated_at: string
}

export interface ValidationError {
  id: string
  application_id: string
  error_code?: string
  error_detail?: string
  created_at: string
}

