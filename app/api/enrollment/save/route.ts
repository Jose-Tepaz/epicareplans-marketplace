import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encrypt, getLastFour } from '@/lib/utils/encryption'
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

    const enrollmentData: EnrollmentRequest = await request.json()
    
    console.log('Guardando application para revisión manual...')

    // 1. Obtener company_id y carrier_name
    let company_id: string | null = null
    let carrierName: string | null = enrollmentData.coverages[0]?.carrierName || null

    // Si tenemos carrierName, buscar company_id
    if (carrierName) {
      const { data: company } = await supabase
        .from('insurance_companies')
        .select('id, name')
        .ilike('name', `%${carrierName}%`)
        .single()
      
      if (company) {
        company_id = company.id
        carrierName = company.name // Usar el nombre exacto de la BD
        console.log('Company ID:', company_id, 'Carrier Name:', carrierName)
      }
    } else {
      // Si no hay carrierName en coverage, intentar obtenerlo del planKey o buscar por plan
      // Por ahora, intentar buscar Allstate por defecto si no se especifica
      const { data: defaultCompany } = await supabase
        .from('insurance_companies')
        .select('id, name')
        .ilike('slug', 'allstate')
        .single()
      
      if (defaultCompany) {
        company_id = defaultCompany.id
        carrierName = defaultCompany.name
        console.log('Usando compañía por defecto (Allstate):', company_id, carrierName)
      }
    }

    // 2. Obtener agent_id del usuario
    const { data: userData } = await supabase
      .from('users')
      .select('agent_id, role')
      .eq('id', user.id)
      .single()

    let agent_id = userData?.agent_id
    console.log('👤 Usuario agent_id inicial:', agent_id)

    // Si el usuario no tiene agente asignado, intentar asignarlo ahora
    if (!agent_id && userData?.role === 'client') {
      console.log('⚠️ Usuario no tiene agente asignado, buscando agente por defecto...')
      
      // Buscar agente por defecto directamente
      const { data: defaultAgent } = await supabase
        .from('agents')
        .select('id')
        .eq('agent_code', 'DEFAULT-ALLSTATE')
        .eq('is_active', true)
        .single()
      
      if (defaultAgent) {
        // Asignar agente al usuario
        const { error: updateError } = await supabase
          .from('users')
          .update({ agent_id: defaultAgent.id })
          .eq('id', user.id)
        
        if (!updateError) {
          agent_id = defaultAgent.id
          console.log('✅ Agente por defecto asignado al usuario:', agent_id)
        } else {
          console.error('❌ Error asignando agente al usuario:', updateError)
        }
      } else {
        console.warn('⚠️ No se encontró agente DEFAULT-ALLSTATE')
      }
    }

    // Si el usuario tiene agente pero es para otra compañía, buscar el correcto
    if (agent_id && company_id) {
      const { data: baseAgent } = await supabase
        .from('agents')
        .select('user_id, company_id')
        .eq('id', agent_id)
        .single()
      
      if (baseAgent?.user_id && baseAgent.company_id !== company_id) {
        console.log('🔄 Agente del usuario es para otra compañía, buscando agente correcto...')
        const { data: companyAgent } = await supabase
          .from('agents')
          .select('id')
          .eq('user_id', baseAgent.user_id)
          .eq('company_id', company_id)
          .eq('is_active', true)
          .single()
        
        if (companyAgent) {
          agent_id = companyAgent.id
          console.log('✅ Agente encontrado para la compañía:', agent_id)
        }
      }
    }

    // Fallback final: buscar agente por defecto de Allstate
    if (!agent_id) {
      console.log('🔄 Usando fallback: buscando agente DEFAULT-ALLSTATE...')
      const { data: fallbackAgent } = await supabase
        .from('agents')
        .select('id')
        .eq('agent_code', 'DEFAULT-ALLSTATE')
        .eq('is_active', true)
        .single()
      
      if (fallbackAgent) {
        agent_id = fallbackAgent.id
        console.log('✅ Usando agente por defecto (fallback):', agent_id)
      } else if (process.env.DEFAULT_AGENT_ALLSTATE_ID) {
        agent_id = process.env.DEFAULT_AGENT_ALLSTATE_ID
        console.log('✅ Usando agente por defecto desde env:', agent_id)
      } else {
        console.error('❌ No se pudo encontrar ningún agente por defecto')
      }
    }

    console.log('👤 Agent_id final para application:', agent_id)

    // 3. Limpiar enrollment_data (sin datos de pago sensibles)
    const cleanEnrollmentData = { ...enrollmentData }
    delete cleanEnrollmentData.paymentInformation

    // 4. Crear application en estado pending_approval
    const { data: application, error: appError } = await supabase
      .from('applications')
      .insert({
        user_id: user.id,
        company_id: company_id,
        agent_id: agent_id,
        status: 'pending_approval', // ← Estado inicial para revisión
        carrier_name: carrierName,
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
        enrollment_data: cleanEnrollmentData, // Sin payment info
      })
      .select()
      .single()

    if (appError) {
      console.error('Error creating application:', appError)
      throw appError
    }

    console.log('Application created:', application.id)

    // 5. Guardar datos de pago ENCRIPTADOS
    const paymentInfo = enrollmentData.paymentInformation
    
    if (paymentInfo) {
      const paymentData: any = {
        application_id: application.id,
        payment_method: paymentInfo.accountType === 'CreditCard' ? 'credit_card' : 'ach',
        payment_frequency: enrollmentData.coverages[0]?.paymentFrequency || 'monthly',
        created_by: user.id,
      }

      // Encriptar según el tipo de pago
      if (paymentInfo.accountType === 'CreditCard') {
        paymentData.card_holder_name = `${paymentInfo.accountHolderFirstName} ${paymentInfo.accountHolderLastName}`
        paymentData.card_number_encrypted = encrypt(paymentInfo.creditCardNumber || '')
        paymentData.card_last_four = getLastFour(paymentInfo.creditCardNumber || '')
        paymentData.card_brand = paymentInfo.cardBrand
        paymentData.card_expiry_month = paymentInfo.expirationMonth
        paymentData.card_expiry_year = paymentInfo.expirationYear
        paymentData.cvv_encrypted = encrypt(paymentInfo.cvv || '')
      } else {
        // ACH
        paymentData.account_holder_name = `${paymentInfo.accountHolderFirstName} ${paymentInfo.accountHolderLastName}`
        paymentData.account_type = paymentInfo.accountTypeBank
        paymentData.account_number_encrypted = encrypt(paymentInfo.accountNumber || '')
        paymentData.account_last_four = getLastFour(paymentInfo.accountNumber || '')
        paymentData.routing_number_encrypted = encrypt(paymentInfo.routingNumber || '')
        paymentData.bank_name = paymentInfo.bankName
        paymentData.desired_draft_date = paymentInfo.desiredDraftDate
      }

      const { error: paymentError } = await supabase
        .from('application_payment_info')
        .insert(paymentData)

      if (paymentError) {
        console.error('Error guardando payment info:', paymentError)
        // No fallar el enrollment por error de pago
      } else {
        console.log('Payment info guardada (encriptada)')
      }
    }

    // 6. Guardar applicants
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

    // 7. Guardar coverages
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

    // 8. Guardar beneficiaries si existen
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
      status: 'pending_approval',
      message: 'Application guardada exitosamente. Un agente la revisará pronto.',
    })

  } catch (error) {
    console.error('Error saving application:', error)
    
    return NextResponse.json(
      {
        error: 'Failed to save application',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

