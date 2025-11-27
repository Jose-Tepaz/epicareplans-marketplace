import type { EnrollmentRequest } from '@/lib/types/enrollment'

export async function submitAllstateEnrollment(enrollmentData: EnrollmentRequest) {
  const ALLSTATE_API_URL = process.env.ALLSTATE_API_URL!
  const ALLSTATE_API_KEY = process.env.ALLSTATE_API_KEY!
  
  // Transformación específica de Allstate
  const allstatePayload = buildAllstatePayload(enrollmentData)
  
  console.log('📋 FULL REQUEST BODY TO ALLSTATE:', JSON.stringify(allstatePayload, null, 2))
  
  const response = await fetch(`${ALLSTATE_API_URL}/Enrollment/CreateEnrollment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ALLSTATE_API_KEY,
    },
    body: JSON.stringify(allstatePayload),
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    let errorData
    try {
      errorData = JSON.parse(errorText)
    } catch {
      errorData = { message: errorText }
    }
    throw new Error(`Allstate API error: ${JSON.stringify(errorData)}`)
  }
  
  return await response.json()
}

function buildAllstatePayload(data: EnrollmentRequest) {
  // Transformaciones específicas de Allstate
  // Allstate NO usa: address2, alternatePhone, zipCodePlus4 en demographics
  const { address2, alternatePhone, zipCodePlus4, ...cleanDemographics } = data.demographics
  
  return {
    demographics: cleanDemographics,
    applicants: data.demographics.applicants.map(applicant => ({
      applicantId: applicant.applicantId,
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      gender: applicant.gender,
      relationship: applicant.relationship,
      ssn: applicant.ssn,
      dob: applicant.dob, // ISO format
      smoker: applicant.smoker,
      weight: applicant.weight,
      heightFeet: applicant.heightFeet,
      heightInches: applicant.heightInches,
      phoneNumbers: applicant.phoneNumbers,
      questionResponses: applicant.questionResponses,
    })),
    coverages: data.coverages.map(c => ({
      planKey: c.planKey,
      monthlyPremium: c.monthlyPremium,
      effectiveDate: c.effectiveDate, // YYYY-MM-DD para Allstate
      paymentFrequency: c.paymentFrequency,
      term: c.term,
      numberOfTerms: c.numberOfTerms,
      terminationDate: c.terminationDate,
      riders: c.riders,
      discounts: c.discounts,
      applicants: c.applicants,
    })),
    paymentInformation: data.paymentInformation,
    partnerInformation: data.partnerInformation,
    attestationInformation: data.attestationInformation,
    enrollmentDate: data.enrollmentDate,
    isEFulfillment: data.isEFulfillment,
  }
}

