import type { EnrollmentRequest } from '@/lib/types/enrollment'

export async function submitManhattanEnrollment(enrollmentData: EnrollmentRequest) {
  const MANHATTAN_API_URL = process.env.MANHATTAN_API_URL!
  const MANHATTAN_API_KEY = process.env.MANHATTAN_API_KEY!
  
  // Transformación específica de Manhattan Life
  const manhattanPayload = buildManhattanPayload(enrollmentData)
  
  console.log('📋 FULL REQUEST BODY TO MANHATTAN:', JSON.stringify(manhattanPayload, null, 2))
  
  const response = await fetch(`${MANHATTAN_API_URL}/api/enrollment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MANHATTAN_API_KEY}`,
    },
    body: JSON.stringify(manhattanPayload),
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    let errorData
    try {
      errorData = JSON.parse(errorText)
    } catch {
      errorData = { message: errorText }
    }
    throw new Error(`Manhattan API error: ${JSON.stringify(errorData)}`)
  }
  
  return await response.json()
}

function buildManhattanPayload(data: EnrollmentRequest) {
  // Transformaciones específicas de Manhattan
  // Manhattan puede usar estructura diferente a Allstate
  return {
    applicantInfo: {
      primary: data.demographics.applicants[0],
      dependents: data.demographics.applicants.slice(1),
    },
    coverage: {
      policyType: data.coverages[0].planKey,
      premium: data.coverages[0].monthlyPremium,
      startDate: data.coverages[0].effectiveDate, // Formato ISO completo
      paymentFrequency: data.coverages[0].paymentFrequency,
    },
    demographics: data.demographics,
    paymentInformation: data.paymentInformation,
    enrollmentDate: data.enrollmentDate,
    // ... estructura específica de Manhattan
  }
}

