import type { PaymentConfig, PaymentTransaction, FieldConfig, FormSection, SubmissionResult, ValidationError, AllstateApiResponse } from '@/lib/types/insurance-config'

/**
 * Obtener configuración de pago de una aseguradora
 */
export async function getPaymentConfig(companySlug: string): Promise<PaymentConfig | null> {
  try {
    const response = await fetch(`/api/insurance-config/payment-config?companySlug=${companySlug}`)
    
    if (!response.ok) {
      console.error('Error fetching payment config:', response.statusText)
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching payment config:', error)
    return null
  }
}

/**
 * Guardar transacción de pago
 */
export async function savePaymentTransaction(transaction: Omit<PaymentTransaction, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const response = await fetch('/api/insurance-config/payment-transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to save payment transaction')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error saving payment transaction:', error)
    throw error
  }
}

/**
 * Obtener transacciones de una aplicación
 */
export async function getApplicationTransactions(applicationId: string): Promise<PaymentTransaction[]> {
  try {
    const response = await fetch(`/api/insurance-config/payment-transaction?applicationId=${applicationId}`)
    
    if (!response.ok) {
      console.error('Error fetching transactions:', response.statusText)
      return []
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return []
  }
}

/**
 * Guardar respuesta completa de Allstate API
 */
export async function saveAllstateApiResponse(
  applicationId: string, 
  apiResponse: AllstateApiResponse
) {
  try {
    const response = await fetch('/api/insurance-config/allstate-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        applicationId,
        apiResponse
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to save Allstate API response')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error saving Allstate API response:', error)
    throw error
  }
}

// Nota: Las funciones getApplicationSubmissionResults y getApplicationValidationErrors
// se pueden implementar como API routes si se necesitan en el futuro
