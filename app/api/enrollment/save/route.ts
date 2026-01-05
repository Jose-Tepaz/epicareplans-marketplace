import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encrypt, getLastFour, detectCardBrand } from '@/lib/utils/encryption'
import type { EnrollmentRequest } from '@/lib/types/enrollment'
import { cookies } from 'next/headers'

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

    const requestBody = await request.json()
    const enrollmentData: EnrollmentRequest = requestBody
    const selectedPlans: any[] = requestBody.selectedPlans || []
    
    console.log('Guardando application para revisión manual...')
    console.log('Selected plans count:', selectedPlans.length)

    // 1. Obtener company_id y carrier_name
    let company_id: string | null = null
    let carrierName: string | null = enrollmentData.coverages[0]?.carrierName || null
    
    // Si no hay carrierName en coverage, intentar obtenerlo de selectedPlans
    if (!carrierName && selectedPlans.length > 0) {
      carrierName = selectedPlans[0]?.carrierName || null
      // Si tenemos carrierSlug pero no carrierName, intentar obtenerlo de la BD
      if (!carrierName && selectedPlans[0]?.carrierSlug) {
        const { data: company } = await supabase
          .from('insurance_companies')
          .select('id, name')
          .ilike('slug', selectedPlans[0].carrierSlug)
          .single()
        
        if (company) {
          carrierName = company.name
        }
      }
    }

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
      // Si no hay carrierName en coverage ni en plans, intentar buscar Allstate por defecto
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

    // 2. Determinar assigned_agent_id para la aplicación
    // Prioridad:
    // 1. Si hay cookie agent_referral_code → usar ese agente
    // 2. Si no hay cookie → usar agente por defecto (is_default = true)
    
    let assigned_agent_id: string | null = null
    const cookieStore = await cookies()
    const agentReferralCode = cookieStore.get('agent_referral_code')?.value
    
    console.log('🍪 Cookies disponibles:', {
      hasAgentCookie: !!agentReferralCode,
      agentReferralCode: agentReferralCode || 'no encontrada',
      allCookies: cookieStore.getAll().map(c => c.name)
    })
    
    if (agentReferralCode) {
      // CASO 1: Cliente viene de un link de agente
      console.log('🔗 Cookie de agente detectada:', agentReferralCode)
      
      // Usar función RPC para verificar el código (bypass RLS con SECURITY DEFINER)
      const { data: verifyResult, error: verifyError } = await supabase
        .rpc('verify_agent_code', {
          link_code: agentReferralCode
        })
      
      console.log('🔍 Verificación de agente por código (RPC):', {
        code: agentReferralCode,
        result: verifyResult,
        error: verifyError?.message
      })
      
      // La función RPC retorna un array, tomar el primer resultado
      const agentInfo = Array.isArray(verifyResult) && verifyResult.length > 0 
        ? verifyResult[0] 
        : null
      
      if (verifyError || !agentInfo || !agentInfo.is_valid) {
        console.warn('⚠️ Agente no encontrado o inactivo por código:', agentReferralCode, {
          error: verifyError?.message,
          agentInfo: agentInfo
        })
        // Continuar con agente por defecto
      } else {
        assigned_agent_id = agentInfo.agent_id
        console.log('✅ Agente asignado desde cookie:', {
          agentId: assigned_agent_id,
          businessName: agentInfo.business_name
        })
      }
    }
    
    // CASO 2: No hay cookie o agente no encontrado → usar agente por defecto
    // Usar función RPC para evitar restricciones RLS
    if (!assigned_agent_id) {
      console.log('🔍 Buscando agente por defecto...')
      
      // Usar función RPC para obtener agente por defecto (bypass RLS con SECURITY DEFINER)
      const { data: defaultAgentResult, error: defaultError } = await supabase
        .rpc('get_default_agent')
      
      console.log('🔍 Búsqueda de agente por defecto (RPC):', {
        result: defaultAgentResult,
        error: defaultError?.message
      })
      
      if (defaultError) {
        console.error('❌ Error buscando agente por defecto:', {
          error: defaultError?.message,
          code: defaultError?.code,
          details: defaultError?.details
        })
      }
      
      // La función RPC retorna un array, tomar el primer resultado
      const defaultAgent = Array.isArray(defaultAgentResult) && defaultAgentResult.length > 0 
        ? defaultAgentResult[0] 
        : null
      
      if (defaultAgent && defaultAgent.agent_id) {
        assigned_agent_id = defaultAgent.agent_id
        console.log('✅ Agente por defecto asignado:', {
          agentId: assigned_agent_id,
          businessName: defaultAgent.business_name
        })
      } else {
        console.warn('⚠️ No se encontró agente por defecto. Intentando obtener agente del usuario...')
        
        // Intentar obtener el agente asignado al usuario como fallback
        const { data: userData } = await supabase
          .from('users')
          .select('agent_profile_id')
          .eq('id', user.id)
          .single()
        
        if (userData?.agent_profile_id) {
          assigned_agent_id = userData.agent_profile_id
          console.log('✅ Usando agente asignado al usuario como fallback:', assigned_agent_id)
        } else {
          console.error('❌ No se encontró ningún agente para asignar')
        }
      }
    }
    
    console.log('👤 Assigned_agent_id final para application:', assigned_agent_id)
    
    if (!assigned_agent_id) {
      console.error('⚠️ ADVERTENCIA: La aplicación se creará sin assigned_agent_id')
    }

    // 3. Limpiar enrollment_data (sin datos de pago sensibles)
    const cleanEnrollmentData = { ...enrollmentData }
    delete cleanEnrollmentData.paymentInformation

    // 4. Crear application en estado pending_approval
    const applicationData: any = {
      user_id: user.id,
      company_id: company_id,
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
    }
    
    // Incluir assigned_agent_id (puede ser null)
    applicationData.assigned_agent_id = assigned_agent_id
    if (assigned_agent_id) {
      console.log('✅ assigned_agent_id incluido en applicationData:', assigned_agent_id)
    } else {
      console.warn('⚠️ assigned_agent_id es null, se incluirá como null en applicationData')
    }
    
    console.log('📝 Application data a insertar:', {
      user_id: applicationData.user_id,
      company_id: applicationData.company_id,
      assigned_agent_id: applicationData.assigned_agent_id || 'null',
      status: applicationData.status
    })
    
    const { data: application, error: appError } = await supabase
      .from('applications')
      .insert(applicationData)
      .select()
      .single()

    if (appError) {
      console.error('Error creating application:', appError)
      throw appError
    }

    console.log('Application created:', application.id)

    // 4.5. Crear notificación para el admin cuando se crea una nueva aplicación
    // Solo si el estado es 'pending_approval' (aplicación enviada para revisión)
    if (application.status === 'pending_approval') {
      try {
        // Llamar a la API del admin dashboard para crear notificaciones
        const adminApiUrl = process.env.ADMIN_DASHBOARD_API_URL || process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL || 'http://localhost:3002'
        await fetch(`${adminApiUrl}/api/notifications/new-application`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            applicationId: application.id,
            clientId: user.id,
          }),
        }).catch((err) => {
          console.error('Error creating admin notification:', err)
          // No fallar el flujo principal si falla la notificación
        })
      } catch (err) {
        console.error('Error creating admin notification:', err)
        // No fallar el flujo principal si falla la notificación
      }
    }

    // 5. Guardar datos de pago
    const paymentInfo = enrollmentData.paymentInformation
    const savedPaymentMethodId = requestBody.savedPaymentMethodId
    const savePaymentMethod = requestBody.savePaymentMethod
    
    if (paymentInfo || savedPaymentMethodId) {
      const paymentData: any = {
        application_id: application.id,
        payment_method: paymentInfo?.accountType === 'CreditCard' ? 'credit_card' : 'ach',
        payment_frequency: enrollmentData.coverages[0]?.paymentFrequency || 'monthly',
        created_by: user.id,
      }

      // Caso 1: Usuario seleccionó un método guardado
      if (savedPaymentMethodId) {
        console.log('📦 Usando método de pago guardado:', savedPaymentMethodId)
        paymentData.user_payment_method_id = savedPaymentMethodId
        
        // Obtener datos visibles del método guardado para referencia
        const { data: savedMethod } = await supabase
          .from('user_payment_methods')
          .select('*')
          .eq('id', savedPaymentMethodId)
          .eq('user_id', user.id)
          .single()
        
        if (savedMethod) {
          if (savedMethod.payment_method === 'credit_card' || savedMethod.payment_method === 'debit_card') {
            paymentData.payment_method = 'credit_card'
            paymentData.card_holder_name = savedMethod.card_holder_name
            paymentData.card_last_four = savedMethod.card_last_four
            paymentData.card_brand = savedMethod.card_brand
            paymentData.card_expiry_month = savedMethod.card_expiry_month
            paymentData.card_expiry_year = savedMethod.card_expiry_year
            // Nota: No guardamos encrypted data aquí, se obtiene del Vault al enviar
          } else {
            paymentData.payment_method = 'ach'
            paymentData.account_holder_name = savedMethod.account_holder_name
            paymentData.account_last_four = savedMethod.account_last_four
            paymentData.account_type = savedMethod.account_type
            paymentData.bank_name = savedMethod.bank_name
          }
        }
      }
      // Caso 2: Usuario ingresó datos nuevos
      else if (paymentInfo) {
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

        // Caso 2b: Usuario quiere guardar el nuevo método para uso futuro
        if (savePaymentMethod && paymentInfo) {
          console.log('💾 Guardando nuevo método de pago para uso futuro...')
          try {
            const newMethodData: any = {
              user_id: user.id,
              payment_method: paymentInfo.accountType === 'CreditCard' ? 'credit_card' : 'bank_account',
              is_default: false,
              is_active: true,
            }

            if (paymentInfo.accountType === 'CreditCard') {
              newMethodData.card_holder_name = `${paymentInfo.accountHolderFirstName} ${paymentInfo.accountHolderLastName}`
              newMethodData.card_last_four = getLastFour(paymentInfo.creditCardNumber || '')
              newMethodData.card_brand = paymentInfo.cardBrand || detectCardBrand(paymentInfo.creditCardNumber || '')
              newMethodData.card_expiry_month = paymentInfo.expirationMonth
              newMethodData.card_expiry_year = paymentInfo.expirationYear
              
              // Guardar datos sensibles en Vault
              const { data: vaultSecretId, error: vaultError } = await supabase.rpc('create_vault_secret', {
                secret_value: JSON.stringify({
                  cardNumber: paymentInfo.creditCardNumber,
                  cvv: paymentInfo.cvv
                }),
                secret_name: `card_${user.id}_${Date.now()}`,
                secret_description: `Card ending in ${newMethodData.card_last_four}`
              })

              if (!vaultError && vaultSecretId) {
                newMethodData.vault_secret_id = vaultSecretId
              }
            } else {
              newMethodData.account_holder_name = `${paymentInfo.accountHolderFirstName} ${paymentInfo.accountHolderLastName}`
              newMethodData.account_last_four = getLastFour(paymentInfo.accountNumber || '')
              newMethodData.account_type = paymentInfo.accountTypeBank?.toLowerCase() || 'checking'
              newMethodData.bank_name = paymentInfo.bankName

              // Guardar datos sensibles en Vault
              const { data: vaultSecretId, error: vaultError } = await supabase.rpc('create_vault_secret', {
                secret_value: JSON.stringify({
                  accountNumber: paymentInfo.accountNumber,
                  routingNumber: paymentInfo.routingNumber
                }),
                secret_name: `bank_${user.id}_${Date.now()}`,
                secret_description: `Bank account ending in ${newMethodData.account_last_four}`
              })

              if (!vaultError && vaultSecretId) {
                newMethodData.vault_secret_id = vaultSecretId
              }
            }

            const { data: newMethod, error: saveMethodError } = await supabase
              .from('user_payment_methods')
              .insert(newMethodData)
              .select()
              .single()

            if (newMethod) {
              paymentData.user_payment_method_id = newMethod.id
              console.log('✅ Nuevo método de pago guardado:', newMethod.id)
            } else if (saveMethodError) {
              console.error('❌ Error guardando método de pago:', saveMethodError)
            }
          } catch (saveErr) {
            console.error('Error al guardar método de pago para futuro:', saveErr)
          }
        }
      }

      const { error: paymentError } = await supabase
        .from('application_payment_info')
        .insert(paymentData)

      if (paymentError) {
        console.error('Error guardando payment info:', paymentError)
        // No fallar el enrollment por error de pago
      } else {
        console.log('Payment info guardada', savedPaymentMethodId ? '(linked to saved method)' : '(encrypted)')
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

    // 7. Obtener agent_code si tenemos assigned_agent_id pero no agent_number
    // Nota: agent_code ya no existe en agent_profiles, usar un valor por defecto
    let agentCode: string | null = null
    if (assigned_agent_id) {
      // Si necesitamos un código de agente para la API externa, usar un valor por defecto
      // o buscar en otra tabla si es necesario
      agentCode = process.env.NEXT_PUBLIC_AGENT_NUMBER || "159208"
      console.log('📝 Usando agent_code por defecto:', agentCode)
    }

    // 8. Guardar coverages con información COMPLETA (para visualización en dashboard)
    const coveragesData = enrollmentData.coverages.map((coverage, index) => {
      // Buscar el plan original del carrito para obtener info completa
      const originalPlan = selectedPlans.find(p => 
        p.planKey === coverage.planKey || 
        p.productCode === coverage.planKey ||
        p.id === coverage.planKey
      )
      
      // Determinar carrier_name: usar el del coverage, si no del plan original, si no del company_id, si no basado en carrierSlug
      let finalCarrierName = coverage.carrierName || originalPlan?.carrierName || carrierName
      
      // Si aún no tenemos carrierName, intentar obtenerlo del carrierSlug
      if (!finalCarrierName) {
        const carrierSlug = originalPlan?.carrierSlug || (coverage as any).carrierSlug
        if (carrierSlug === 'allstate') {
          finalCarrierName = 'Allstate'
        } else if (carrierSlug === 'manhattan-life') {
          finalCarrierName = 'Manhattan Life'
        } else {
          finalCarrierName = carrierName || 'Allstate' // Fallback final
        }
      }
      
      // Determinar agent_number: usar el del coverage, si no del plan original, si no del agent_code obtenido, si no default
      const finalAgentNumber = coverage.agentNumber || originalPlan?.agentNumber || agentCode || process.env.NEXT_PUBLIC_AGENT_NUMBER || "159208"
      
      // Determinar monthly_premium: usar el precio FINAL del plan (después de checkout y recálculo con familiares)
      // El precio del coverage viene de buildEnrollmentRequest que usa plan.price (precio final)
      // Si no está disponible, usar el precio del plan original del carrito
      const finalMonthlyPremium = coverage.monthlyPremium || originalPlan?.price || 0
      
      return {
        application_id: application.id,
        // Campos estándar del coverage
        plan_key: coverage.planKey,
        carrier_name: finalCarrierName,
        carrier_slug: originalPlan?.carrierSlug || null, // Usar del plan original si está disponible
        effective_date: coverage.effectiveDate,
        monthly_premium: finalMonthlyPremium,
        payment_frequency: coverage.paymentFrequency,
        term: coverage.term ? String(coverage.term) : null,
        number_of_terms: coverage.numberOfTerms,
        termination_date: coverage.terminationDate,
        is_automatic_loan_provision_opted_in: coverage.isAutomaticLoanProvisionOptedIn,
        riders: coverage.riders || [],
        discounts: coverage.discounts || [],
        agent_number: finalAgentNumber,
        // Campos adicionales del plan original (para visualización)
        metadata: originalPlan ? {
          planName: originalPlan.name || originalPlan.planName,
          productType: originalPlan.productType,
          planType: originalPlan.planType,
          coverage: originalPlan.coverage,
          benefitsList: originalPlan.benefits, // Array de beneficios
          benefitDescription: originalPlan.benefitDescription,
          brochureUrl: originalPlan.brochureUrl,
          carrierSlug: originalPlan.carrierSlug,
          originalPrice: originalPlan.metadata?.originalPrice || originalPlan.price, // Precio original del plan (antes de Rate/Cart)
          applicantsIncluded: originalPlan.metadata?.applicantsIncluded || 1, // Número de aplicantes incluidos
          priceUpdatedWithRateCart: originalPlan.metadata?.priceUpdatedWithRateCart || false,
          finalPrice: finalMonthlyPremium // Precio final guardado (después de checkout y recálculo)
        } : {}
      }
    })

    // Insertar coverages
    const { data: insertedCoverages, error: coveragesError } = await supabase
      .from('coverages')
      .insert(coveragesData)
      .select()

    if (coveragesError) {
      console.error('Error creating coverages:', coveragesError)
      throw coveragesError
    }

    console.log('Coverages created:', insertedCoverages?.length || coveragesData.length)

    // Actualizar carrier_slug para coverages que no lo tienen
    for (const coverage of insertedCoverages || []) {
      if (!coverage.carrier_slug && coverage.carrier_name) {
        const { data: company } = await supabase
          .from('insurance_companies')
          .select('slug')
          .ilike('name', `%${coverage.carrier_name}%`)
          .single()
        
        if (company) {
          await supabase
            .from('coverages')
            .update({ carrier_slug: company.slug })
            .eq('id', coverage.id)
        }
      }
    }

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
        user_beneficiary_id: ben.userBeneficiaryId || null, // Referencia al beneficiario guardado
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

