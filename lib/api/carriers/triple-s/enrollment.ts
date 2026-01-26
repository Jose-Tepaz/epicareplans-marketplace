import type { EnrollmentRequest } from '@/lib/types/enrollment'
import type { TripleSSubmitApplicationRequest, TripleSSubmitApplicationResponse } from './types'
import { tripleSAuth } from './auth'

/**
 * Envía una aplicación de enrollment a Triple S
 * SOLO debe ser llamado desde el Admin Dashboard
 */
export async function submitTripleSEnrollment(
  enrollmentData: EnrollmentRequest
): Promise<{ success: boolean; data?: any; error?: string }> {
  console.log('🏢 Triple S: Starting enrollment submission')

  try {
    // 1. Construir request según documentación
    const submitRequest = buildSubmitRequest(enrollmentData)

    // 2. Llamar a la API
    const baseURL = process.env.TRIPLE_S_BASE_URL || ''
    const url = `${baseURL}/TSVAgent/api/Application/SubmitApplication`

    const response = await tripleSAuth.makeAuthenticatedRequest<TripleSSubmitApplicationResponse>(
      url,
      {
        method: 'POST',
        body: JSON.stringify([submitRequest]) // Enviar como array
      }
    )

    // 3. Procesar respuesta
    if (response.success) {
      console.log('✅ Triple S: Enrollment submitted successfully')
      return {
        success: true,
        data: response.data
      }
    } else {
      console.error('❌ Triple S: Enrollment submission failed:', response.message)
      return {
        success: false,
        error: response.message || response.messageEN || 'Unknown error'
      }
    }
  } catch (error) {
    console.error('❌ Triple S: Error submitting enrollment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Construye el request de envío desde los datos de enrollment
 * TODO: Este es un esqueleto - necesita mapeo completo de todos los campos
 */
function buildSubmitRequest(enrollmentData: EnrollmentRequest): TripleSSubmitApplicationRequest {
  // Obtener process ID según ambiente
  const processId = process.env.NODE_ENV === 'production' ? 3 : 4

  // TODO: Mapear todos los campos según documentación
  // Por ahora, estructura básica
  const request: TripleSSubmitApplicationRequest = {
    applicant: {
      first_name: enrollmentData.demographics?.applicants?.[0]?.firstName || '',
      middle_initial: enrollmentData.demographics?.applicants?.[0]?.middleInitial,
      last_name: enrollmentData.demographics?.applicants?.[0]?.lastName || '',
      second_last_name: '', // TODO: Agregar al enrollment form
      strt_addr_line1: enrollmentData.demographics?.address1 || '',
      strt_addr_line2: enrollmentData.demographics?.address2,
      strt_addr_city: enrollmentData.demographics?.city || '',
      strt_addr_country: 'US',
      strt_addr_zip_code: enrollmentData.demographics?.zipCode || '',
      pstl_addr_line1: enrollmentData.demographics?.address1 || '',
      pstl_addr_line2: enrollmentData.demographics?.address2,
      pstl_addr_city: enrollmentData.demographics?.city || '',
      pstl_addr_country: 'US',
      pstl_addr_zip_code: enrollmentData.demographics?.zipCode || '',
      pstl_addr_zip_code_plus: enrollmentData.demographics?.zipCodePlus4,
      birth_date: enrollmentData.demographics?.applicants?.[0]?.dob || '',
      gender: enrollmentData.demographics?.applicants?.[0]?.gender === 'Male' ? 'M' : 'F',
      ssn: enrollmentData.demographics?.applicants?.[0]?.ssn || '',
      email: enrollmentData.demographics?.email || '',
      telephone: enrollmentData.demographics?.phone || '',
      home_Phone: enrollmentData.demographics?.alternatePhone,
      weight: enrollmentData.demographics?.applicants?.[0]?.weight,
      height: {
        feet: enrollmentData.demographics?.applicants?.[0]?.heightFeet || 0,
        inches: enrollmentData.demographics?.applicants?.[0]?.heightInches || 0
      },
      no_physical_mail: false,
      insuredUWCLS: '' // TODO: Definir con negocio
    },
    coapplicants: [], // TODO: Mapear dependents
    beneficiaries: [], // TODO: Mapear beneficiaries
    seller: {
      first_name: '', // TODO: Obtener de agent profile
      last_name: '',
      phone: '',
      email: '',
      representative_number: '',
      agency_number: ''
    },
    payment_info: {
      payment_type: 'ACH', // TODO: Determinar del enrollment
      payment_Frequency: 'monthly',
      pstl_addr_line1: enrollmentData.demographics?.address1 || '',
      city: enrollmentData.demographics?.city || '',
      country: 'US',
      zip_code: enrollmentData.demographics?.zipCode || '',
      premium: 0 // TODO: Calcular del coverage
    },
    policy_data: {
      lob: '001 - VIDA', // TODO: Mapear según tipo de producto
      applicant_is_not_solicitor: true,
      purchase_date: new Date().toISOString(),
      docTypeId: '1003', // TODO: Confirmar con TSV
      lifecycle: '203', // TODO: Confirmar con TSV
      premium: 0, // TODO: Calcular
      tsv_AgencyNum: '', // TODO: Obtener de agent
      replaces_existing_policy: false,
      plan_Code: '', // TODO: Obtener del quote response
      coverage: '' // TODO: Obtener del quote response
    },
    benefits: [], // TODO: Mapear del quote response
    onbasedata: {
      Solicitud: '', // application ID
      LOB: '001 - VIDA',
      Numero: '',
      docTypeId: '1003',
      lifecycle: '203',
      TSV_Prima: '0',
      SVTS_Date_of_Birth: '',
      TSV_SSN: '',
      TSV_Name: '',
      TSV_Last_Name: '',
      TSV_Maternal_Last: '',
      TSV_AgencyNum: ''
    },
    processId
  }

  return request
}
