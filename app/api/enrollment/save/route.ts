import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { EnrollmentRequest } from '@/lib/types/enrollment'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body (puede incluir estado inicial opcional)
    const requestBody = await request.json()
    const enrollmentData: EnrollmentRequest = requestBody.enrollmentData || requestBody
    const initialStatus = requestBody.status || 'draft'
    
    console.log('Saving enrollment for user:', user.id, 'with status:', initialStatus)

    // Remover TODOS los datos de pago del enrollment_data por seguridad
    const cleanEnrollmentData = { ...enrollmentData }
    if (cleanEnrollmentData.paymentInformation) {
      // Remover datos sensibles de tarjeta de crédito
      delete cleanEnrollmentData.paymentInformation.creditCardNumber
      delete cleanEnrollmentData.paymentInformation.cvv
      delete cleanEnrollmentData.paymentInformation.cardToken
      
      // Remover datos sensibles de cuenta bancaria
      delete cleanEnrollmentData.paymentInformation.accountNumber
      delete cleanEnrollmentData.paymentInformation.routingNumber
      
      // Mantener solo datos no sensibles para referencia
      cleanEnrollmentData.paymentInformation = {
        accountType: cleanEnrollmentData.paymentInformation.accountType,
        accountHolderFirstName: cleanEnrollmentData.paymentInformation.accountHolderFirstName,
        accountHolderLastName: cleanEnrollmentData.paymentInformation.accountHolderLastName,
        cardBrand: cleanEnrollmentData.paymentInformation.cardBrand,
        expirationMonth: cleanEnrollmentData.paymentInformation.expirationMonth,
        expirationYear: cleanEnrollmentData.paymentInformation.expirationYear,
        bankName: cleanEnrollmentData.paymentInformation.bankName,
        accountType: cleanEnrollmentData.paymentInformation.accountType
      }
    }

    // 1. Crear application
    const { data: application, error: appError } = await supabase
      .from('applications')
      .insert({
        user_id: user.id,
        status: initialStatus,
        carrier_name: enrollmentData.coverages[0]?.carrierName,
        zip_code: enrollmentData.demographics.zipCode,
        email: enrollmentData.demographics.email,
        address1: enrollmentData.demographics.address1,
        address2: enrollmentData.demographics.address2,
        city: enrollmentData.demographics.city,
        state: enrollmentData.demographics.state,
        phone: enrollmentData.demographics.phone,
        alternate_phone: enrollmentData.demographics.alternatePhone,
        zip_code_plus4: enrollmentData.demographics.zipCodePlus4,
        enrollment_date: enrollmentData.enrollmentDate,
        effective_date: enrollmentData.coverages[0]?.effectiveDate,
        enrollment_data: cleanEnrollmentData,
      })
      .select()
      .single()

    if (appError) {
      console.error('Error creating application:', appError)
      throw appError
    }

    console.log('Application created:', application.id)

    // 2. Guardar applicants
    const applicantsData = enrollmentData.demographics.applicants.map(applicant => ({
      application_id: application.id,
      applicant_id: applicant.applicantId,
      first_name: applicant.firstName,
      middle_initial: applicant.middleInitial,
      last_name: applicant.lastName,
      gender: applicant.gender,
      date_of_birth: applicant.dob,
      ssn: applicant.ssn,
      relationship: applicant.relationship,
      smoker: applicant.smoker,
      date_last_smoked: applicant.dateLastSmoked,
      weight: applicant.weight,
      height_feet: applicant.heightFeet,
      height_inches: applicant.heightInches,
      has_prior_coverage: applicant.hasPriorCoverage,
      eligible_rate_tier: applicant.eligibleRateTier,
      quoted_rate_tier: applicant.quotedRateTier,
      med_supp_info: applicant.medSuppInfo,
      medications: applicant.medications,
      question_responses: applicant.questionResponses,
      phone_numbers: applicant.phoneNumbers,
    }))

    const { error: applicantsError } = await supabase
      .from('applicants')
      .insert(applicantsData)

    if (applicantsError) {
      console.error('Error creating applicants:', applicantsError)
      throw applicantsError
    }

    console.log('Applicants created:', applicantsData.length)

    // 3. Guardar coverages
    const coveragesData = enrollmentData.coverages.map(coverage => ({
      application_id: application.id,
      plan_key: coverage.planKey,
      carrier_name: coverage.carrierName,
      effective_date: coverage.effectiveDate,
      monthly_premium: coverage.monthlyPremium,
      payment_frequency: coverage.paymentFrequency,
      term: coverage.term,
      number_of_terms: coverage.numberOfTerms,
      termination_date: coverage.terminationDate,
      is_automatic_loan_provision_opted_in: coverage.isAutomaticLoanProvisionOptedIn,
      riders: coverage.riders,
      discounts: coverage.discounts,
      agent_number: coverage.agentNumber,
    }))

    const { error: coveragesError } = await supabase
      .from('coverages')
      .insert(coveragesData)

    if (coveragesError) {
      console.error('Error creating coverages:', coveragesError)
      throw coveragesError
    }

    console.log('Coverages created:', coveragesData.length)

    // 4. Guardar beneficiaries si existen
    if (enrollmentData.coverages[0]?.beneficiaries && enrollmentData.coverages[0].beneficiaries.length > 0) {
      const beneficiariesData = enrollmentData.coverages[0].beneficiaries.map(ben => ({
        application_id: application.id,
        beneficiary_id: ben.beneficiaryId,
        first_name: ben.firstName,
        middle_name: ben.middleName,
        last_name: ben.lastName,
        relationship: ben.relationship,
        date_of_birth: ben.dateOfBirth,
        allocation_percentage: ben.allocationPercentage,
        addresses: ben.addresses,
        phone_numbers: ben.phoneNumbers,
      }))

      const { error: beneficiariesError } = await supabase
        .from('beneficiaries')
        .insert(beneficiariesData)

      if (beneficiariesError) {
        console.error('Error creating beneficiaries:', beneficiariesError)
        throw beneficiariesError
      }

      console.log('Beneficiaries created:', beneficiariesData.length)
    }

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      message: 'Enrollment saved successfully',
    })

  } catch (error) {
    console.error('Error saving enrollment:', error)
    
    return NextResponse.json(
      {
        error: 'Failed to save enrollment',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

