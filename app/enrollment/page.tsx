"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import type { EnrollmentFormState } from "@/lib/types/enrollment"
import { EnrollmentLayout } from "@/components/enrollment-layout"
import { EnrollmentErrorNotification } from "@/components/enrollment-error-notification"
import { updateUserProfile, updateApplicationWithApiResponse, recordEnrollmentStartAPI } from "@/lib/api/enrollment-db"
import { splitPlansByCompany, evaluateMultiCarrierResults, getMultiCarrierMessage } from "@/lib/api/enrollment-split"
import { getPaymentConfig, savePaymentTransaction } from "@/lib/api/insurance-config"
import { saveAllstateApiResponse } from "@/lib/api/carriers/allstate"
import { createClient } from "@/lib/supabase/client"

const TOTAL_STEPS = 9

export default function EnrollmentPage() {
  const router = useRouter()
  const { items: cartItems, clearCart } = useCart()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCartLoaded, setIsCartLoaded] = useState(false)
  const [enrollmentError, setEnrollmentError] = useState<any>(null)
  const [isEnrollmentComplete, setIsEnrollmentComplete] = useState(false)

  // Form state
  const [formData, setFormData] = useState<EnrollmentFormState>({
    // Step 1: Personal Information
    firstName: "",
    middleInitial: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    ssn: "",
    relationship: "Primary",
    email: "",
    phone: "",
    alternatePhone: "",

    // Step 2: Health Information
    weight: "",
    heightFeet: "",
    heightInches: "",
    smoker: false,
    dateLastSmoked: "",
    hasPriorCoverage: false,
    hasMedicare: false,
    medicarePartAEffectiveDate: "",
    medicarePartBEffectiveDate: "",
    medicareId: "",
    isPreMACRAEligible: false,

    // Step 3: Address
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    zipCodePlus4: "",

    // Step 4: Additional Applicants
    additionalApplicants: [],

    // Step 5: Coverage
    selectedPlans: cartItems || [],
    effectiveDate: "",
    paymentFrequency: "Monthly",
    isEFulfillment: true,
    isAutomaticLoanProvisionOptedIn: false,

    // Step 6: Beneficiaries
    beneficiaries: [],

    // Step 7: Health Questions
    questionResponses: [],
    medications: [],

    // Step 8: Payment
    paymentMethod: "credit_card",
    accountHolderFirstName: "",
    accountHolderLastName: "",
    creditCardNumber: "",
    expirationMonth: "",
    expirationYear: "",
    cvv: "",
    cardBrand: "",
    routingNumber: "",
    accountNumber: "",
    bankName: "",
    accountType: "",
    desiredDraftDate: "",
    submitWithoutPayment: false,

    // Step 9: Attestation
    agreeToTerms: false,
    signature: "",
    signatureDate: new Date().toISOString().split('T')[0]
  })

  // Wait for cart to load from localStorage before checking
  useEffect(() => {
    // Give CartContext time to load from localStorage
    const timer = setTimeout(() => {
      setIsCartLoaded(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Check if user has plans in cart (only after cart is loaded)
  useEffect(() => {
    if (isCartLoaded && cartItems.length === 0 && !isEnrollmentComplete) {
      router.push("/insurance-options")
    }
  }, [cartItems, router, isCartLoaded, isEnrollmentComplete])

  // Load saved form data from sessionStorage and database
  useEffect(() => {
    const loadSavedData = async () => {
      console.log('🔍 Iniciando carga de datos - user:', user)
      const savedData = sessionStorage.getItem('enrollmentFormData')
      const insuranceFormData = sessionStorage.getItem('insuranceFormData')
      const userZipCode = localStorage.getItem('userZipCode')

      // 1. Cargar datos de la base de datos si el usuario está autenticado
      if (user?.id) {
        try {
          console.log('🔍 Cargando datos del usuario desde la base de datos...')
          const supabase = createClient()
          
          // Obtener el perfil del usuario
          const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (profileError) {
            console.error('❌ Error obteniendo perfil:', profileError)
          }
          
          if (userProfile) {
            console.log('✅ Perfil del usuario encontrado:', userProfile)
            setFormData(prev => ({
              ...prev,
              email: userProfile.email || prev.email,
              firstName: userProfile.first_name || prev.firstName,
              lastName: userProfile.last_name || prev.lastName,
              phone: userProfile.phone || prev.phone,
              address1: userProfile.address || prev.address1,
              city: userProfile.city || prev.city,
              state: userProfile.state || prev.state,
              zipCode: userProfile.zip_code || prev.zipCode,
              dateOfBirth: userProfile.date_of_birth || prev.dateOfBirth,
              gender: userProfile.gender || prev.gender,
              smoker: userProfile.is_smoker || prev.smoker,
              dateLastSmoked: userProfile.last_tobacco_use || prev.dateLastSmoked,
              effectiveDate: userProfile.coverage_start_date || prev.effectiveDate
            }))
          }
          
          // Obtener la última aplicación del usuario para autocompletar
          const { data: lastApplication, error: applicationError } = await supabase
            .from('applications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
          
          if (applicationError && applicationError.code !== 'PGRST116') {
            console.error('❌ Error obteniendo aplicación:', applicationError)
          }
          
          if (lastApplication && lastApplication.enrollment_data) {
            console.log('✅ Última aplicación encontrada, autocompletando datos...')
            const enrollmentData = lastApplication.enrollment_data
            
            setFormData(prev => ({
              ...prev,
              // Datos personales
              firstName: enrollmentData.demographics?.applicants?.[0]?.firstName || prev.firstName,
              lastName: enrollmentData.demographics?.applicants?.[0]?.lastName || prev.lastName,
              gender: enrollmentData.demographics?.applicants?.[0]?.gender || prev.gender,
              dateOfBirth: enrollmentData.demographics?.applicants?.[0]?.dob || prev.dateOfBirth,
              ssn: enrollmentData.demographics?.applicants?.[0]?.ssn || prev.ssn,
              phone: enrollmentData.demographics?.phone || prev.phone,
              alternatePhone: enrollmentData.demographics?.alternatePhone || prev.alternatePhone,
              // Dirección
              address1: enrollmentData.demographics?.address1 || prev.address1,
              address2: enrollmentData.demographics?.address2 || prev.address2,
              city: enrollmentData.demographics?.city || prev.city,
              state: enrollmentData.demographics?.state || prev.state,
              zipCode: enrollmentData.demographics?.zipCode || prev.zipCode,
              zipCodePlus4: enrollmentData.demographics?.zipCodePlus4 || prev.zipCodePlus4,
              // Salud
              weight: enrollmentData.demographics?.applicants?.[0]?.weight || prev.weight,
              heightFeet: enrollmentData.demographics?.applicants?.[0]?.heightFeet || prev.heightFeet,
              heightInches: enrollmentData.demographics?.applicants?.[0]?.heightInches || prev.heightInches,
              smoker: enrollmentData.demographics?.applicants?.[0]?.smoker || prev.smoker,
              dateLastSmoked: enrollmentData.demographics?.applicants?.[0]?.dateLastSmoked || prev.dateLastSmoked,
              hasPriorCoverage: enrollmentData.demographics?.applicants?.[0]?.hasPriorCoverage || prev.hasPriorCoverage,
              // Cobertura
              effectiveDate: enrollmentData.coverages?.[0]?.effectiveDate || prev.effectiveDate,
              paymentFrequency: enrollmentData.coverages?.[0]?.paymentFrequency || prev.paymentFrequency
            }))
          }
        } catch (error) {
          console.error('❌ Error cargando datos del usuario:', error)
        }
      }

      // 2. Cargar datos de sessionStorage (solo si existen y no hay datos de la BD)
      if (savedData && !user?.id) {
        const parsedData = JSON.parse(savedData)
        console.log('🔍 Cargando datos de sessionStorage:', parsedData)
        setFormData(prev => ({ ...prev, ...parsedData }))
      }

      // 3. Usar email del usuario autenticado si no hay datos
      if (user?.email && !savedData) {
        console.log('✅ Usuario autenticado, usando email:', user.email)
        setFormData(prev => ({ ...prev, email: user.email || prev.email }))
      }

    // Cargar ZIP code del explore page
    if (userZipCode) {
      setFormData(prev => ({ ...prev, zipCode: userZipCode }))
      console.log('ZIP code cargado del localStorage:', userZipCode)
    }

    // Pre-fill from insurance form if available
    if (insuranceFormData) {
      const insuranceData = JSON.parse(insuranceFormData)
      setFormData(prev => ({
        ...prev,
        zipCode: insuranceData.zipCode || prev.zipCode,
        dateOfBirth: insuranceData.dateOfBirth || prev.dateOfBirth,
        gender: insuranceData.gender === 'male' ? 'Male' : insuranceData.gender === 'female' ? 'Female' : prev.gender,
        smoker: insuranceData.smokes || prev.smoker,
        dateLastSmoked: insuranceData.lastTobaccoUse || prev.dateLastSmoked,
        effectiveDate: insuranceData.coverageStartDate || prev.effectiveDate,
        paymentFrequency: insuranceData.paymentFrequency === 'monthly' ? 'Monthly' :
                         insuranceData.paymentFrequency === 'quarterly' ? 'Quarterly' :
                         insuranceData.paymentFrequency === 'semi-annually' ? 'Semi-Annually' :
                         insuranceData.paymentFrequency === 'annually' ? 'Annually' : prev.paymentFrequency
      }))
      }
    }
    
    loadSavedData()
  }, [user])

  // Save form data to sessionStorage on change
  useEffect(() => {
    sessionStorage.setItem('enrollmentFormData', JSON.stringify(formData))
  }, [formData])

  const updateFormData = (field: keyof EnrollmentFormState, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Validation functions for each step
  const validateStep = (step: number): { isValid: boolean; message?: string } => {
    switch (step) {
      case 1: // ApplicationBundle Questions (NUEVO)
        // Las preguntas dinámicas se validan en el componente Step7DynamicQuestions
        return { isValid: true }

      case 2: // Personal Information (antes Paso 1)
        if (!formData.firstName.trim()) return { isValid: false, message: 'First name is required' }
        if (!formData.lastName.trim()) return { isValid: false, message: 'Last name is required' }
        if (!formData.gender) return { isValid: false, message: 'Gender is required' }
        if (!formData.dateOfBirth) return { isValid: false, message: 'Date of birth is required' }
        if (!formData.ssn.trim()) return { isValid: false, message: 'SSN is required' }
        if (formData.ssn.replace(/\D/g, '').length !== 9) return { isValid: false, message: 'SSN must be 9 digits' }
        if (!formData.email.trim()) return { isValid: false, message: 'Email is required' }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return { isValid: false, message: 'Invalid email format' }
        if (!formData.phone.trim()) return { isValid: false, message: 'Phone number is required' }
        return { isValid: true }

      case 3: // Health Information (antes Paso 2)
        if (!formData.weight || Number(formData.weight) <= 0) return { isValid: false, message: 'Weight is required' }
        if (!formData.heightFeet || Number(formData.heightFeet) <= 0) return { isValid: false, message: 'Height (feet) is required' }
        if (formData.heightInches === '' || Number(formData.heightInches) < 0 || Number(formData.heightInches) > 11) {
          return { isValid: false, message: 'Height (inches) must be between 0-11' }
        }
        if (formData.smoker && !formData.dateLastSmoked) {
          return { isValid: false, message: 'Date last smoked is required for smokers' }
        }
        return { isValid: true }

      case 4: // Address (antes Paso 3)
        if (!formData.address1.trim()) return { isValid: false, message: 'Street address is required' }
        if (!formData.city.trim()) return { isValid: false, message: 'City is required' }
        if (!formData.state) return { isValid: false, message: 'State is required' }
        if (!formData.zipCode.trim()) return { isValid: false, message: 'ZIP code is required' }
        if (!/^\d{5}$/.test(formData.zipCode)) return { isValid: false, message: 'ZIP code must be 5 digits' }
        return { isValid: true }

      case 5: // Additional Applicants (antes Paso 4)
        return { isValid: true }

      case 6: // Coverage Selection (antes Paso 5)
        if (!formData.effectiveDate) return { isValid: false, message: 'Effective date is required' }
        const effectiveDate = new Date(formData.effectiveDate)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (effectiveDate < today) return { isValid: false, message: 'Effective date must be today or later' }
        if (!formData.paymentFrequency) return { isValid: false, message: 'Payment frequency is required' }
        return { isValid: true }

      case 7: // Beneficiaries (antes Paso 6)
        if (formData.beneficiaries.length > 0) {
          const totalAllocation = formData.beneficiaries.reduce((sum, ben) => sum + ben.allocationPercentage, 0)
          if (totalAllocation !== 100) {
            return { isValid: false, message: 'Beneficiary allocation must total 100%' }
          }
        }
        return { isValid: true }

      case 8: // Payment Information (antes Paso 8)
        if (!formData.submitWithoutPayment) {
          if (!formData.accountHolderFirstName.trim()) {
            return { isValid: false, message: 'Account holder first name is required' }
          }
          if (!formData.accountHolderLastName.trim()) {
            return { isValid: false, message: 'Account holder last name is required' }
          }
        }

        if (!formData.submitWithoutPayment) {
          if (formData.paymentMethod === 'credit_card') {
            if (!formData.creditCardNumber.trim()) return { isValid: false, message: 'Card number is required' }
            if (formData.creditCardNumber.replace(/\s/g, '').length < 13) {
              return { isValid: false, message: 'Invalid card number' }
            }
            if (!formData.expirationMonth) return { isValid: false, message: 'Expiration month is required' }
            if (!formData.expirationYear) return { isValid: false, message: 'Expiration year is required' }
            if (!formData.cvv.trim()) return { isValid: false, message: 'CVV is required' }
            if (formData.cvv.length < 3) return { isValid: false, message: 'CVV must be 3-4 digits' }
            if (!formData.cardBrand) return { isValid: false, message: 'Card brand is required' }
          } else if (formData.paymentMethod === 'bank_account') {
            if (!formData.bankName.trim()) return { isValid: false, message: 'Bank name is required' }
            if (!formData.routingNumber.trim()) return { isValid: false, message: 'Routing number is required' }
            if (formData.routingNumber.length !== 9) return { isValid: false, message: 'Routing number must be 9 digits' }
            if (!formData.accountNumber.trim()) return { isValid: false, message: 'Account number is required' }
            if (!formData.accountType) return { isValid: false, message: 'Account type is required' }
          }
        }
        return { isValid: true }

      case 9: // Review & Confirmation (antes Paso 9)
        if (!formData.signature.trim()) return { isValid: false, message: 'Signature is required' }
        if (!formData.agreeToTerms) return { isValid: false, message: 'You must agree to terms and conditions' }
        return { isValid: true }

      default:
        return { isValid: true }
    }
  }

  const handleNext = () => {
    const validation = validateStep(currentStep)

    if (!validation.isValid) {
      toast.error(validation.message || 'Please complete all required fields', {
        description: 'All fields marked with * are required',
        duration: 4000,
      })
      return
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleStepClick = (step: number) => {
    setCurrentStep(step)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const results: Array<{ company: string; success: boolean; error?: any; application_id?: string }> = []

    try {
      // 1. Validar datos
      const validationErrors = validateEnrollmentData(formData)
      if (validationErrors.length > 0) {
        toast.error('Errores de validación', {
          description: validationErrors.join(', ')
        })
        setIsSubmitting(false)
        return
      }

      // 2. DIVIDIR PLANES POR ASEGURADORA
      const companySplit = splitPlansByCompany(formData.selectedPlans)
      const isMultiCarrier = companySplit.length > 1
      
      console.log('📊 Planes divididos por aseguradora:', companySplit)
      console.log('🔄 Es multi-carrier:', isMultiCarrier)
      
      // 3. CREAR APPLICATION PADRE (si es multi-carrier)
      let parentApplicationId: string | null = null
      if (isMultiCarrier) {
        console.log('👨‍👩‍👧‍👦 Creando application padre para multi-carrier...')
        const parentApp = await fetch('/api/enrollment/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...buildEnrollmentRequest(formData),
            is_multi_carrier: true,
            status: 'draft'
          })
        })
        
        if (!parentApp.ok) {
          throw new Error('Failed to create parent application')
        }
        
        const parentResult = await parentApp.json()
        parentApplicationId = parentResult.applicationId
        console.log('✅ Application padre creado:', parentApplicationId)
      }
      
      // 4. PROCESAR CADA ASEGURADORA POR SEPARADO
      for (const companyData of companySplit) {
        try {
          console.log(`🏢 Procesando enrollment para: ${companyData.company_slug}`)
          
          // 4a. Guardar en BD
          const saveResponse = await fetch('/api/enrollment/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...buildEnrollmentRequest(formData),
              selectedPlans: companyData.plans,
              parent_application_id: parentApplicationId
            })
          })
          
          if (!saveResponse.ok) {
            throw new Error(`Failed to save enrollment for ${companyData.company_slug}`)
          }
          
          const saveResult = await saveResponse.json()
          const applicationId = saveResult.applicationId
          console.log(`✅ Enrollment guardado para ${companyData.company_slug}:`, applicationId)
          
          // Registrar inicio del enrollment en el historial
          try {
            if (user?.id) {
              await recordEnrollmentStartAPI(applicationId, user.id)
              console.log(`📝 Historial de enrollment iniciado para ${companyData.company_slug}`)
            } else {
              console.warn('⚠️ Usuario no disponible para registrar historial')
            }
          } catch (historyError) {
            console.error('❌ Error registrando inicio de enrollment:', historyError)
          }
          
          // 4b. Construir payment data (SIN tokenización por ahora)
          const paymentData = formData.paymentMethod === 'credit_card' ? {
            accountHolderFirstName: formData.accountHolderFirstName,
            accountHolderLastName: formData.accountHolderLastName,
            creditCardNumber: formData.creditCardNumber,
            expirationMonth: formData.expirationMonth,
            expirationYear: formData.expirationYear,
            cvv: formData.cvv,
            cardBrand: formData.cardBrand,
            cardToken: null
          } : {
            accountHolderFirstName: formData.accountHolderFirstName,
            accountHolderLastName: formData.accountHolderLastName,
            routingNumber: formData.routingNumber,
            accountNumber: formData.accountNumber,
            accountType: formData.accountType,
            bankName: formData.bankName,
            cardToken: null
          }
          
          // 4c. Enviar a API (pero no fallar si hay error)
          const enrollmentRequest = {
            ...buildEnrollmentRequest(formData),
            coverages: companyData.plans.map(plan => ({
              planKey: plan.planKey,
              monthlyPremium: plan.price,
              effectiveDate: formData.effectiveDate,
              paymentFrequency: formData.paymentFrequency
            })),
            paymentInformation: paymentData
          }
          
          console.log(`🚀 Enviando a API de ${companyData.company_slug}...`)
          let apiResponse, apiResult, apiSuccess = false
          try {
            apiResponse = await fetch('/api/enrollment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(enrollmentRequest)
            })
            
            apiResult = await apiResponse.json()
            // La API puede devolver success: false pero el enrollment se guardó correctamente
            // Consideramos exitoso si no hay error de conexión y tenemos respuesta
            // Los errores de configuración de plan no son fallos críticos
            const isPlanConfigError = apiResult.data?.isPlanConfigurationError
            const hasApiResponse = apiResult && (apiResult.success !== undefined || apiResult.data || apiResult.message)
            apiSuccess = apiResponse.ok && hasApiResponse
            
            if (apiSuccess) {
              if (isPlanConfigError) {
                console.log(`⚠️ API de ${companyData.company_slug} con advertencia de configuración:`, apiResult)
              } else {
                console.log(`✅ API de ${companyData.company_slug} exitosa:`, apiResult)
              }
            } else {
              console.log(`❌ API de ${companyData.company_slug} falló:`, apiResult)
            }
          } catch (apiError) {
            console.log(`❌ Error en API de ${companyData.company_slug}:`, apiError)
            apiSuccess = false
            apiResult = { error: apiError.message }
          }
          
          // 4d. Guardar transacción (opcional, no fallar si hay error)
          try {
            // Obtener el UUID de la aseguradora Allstate
            const supabase = createClient()
            const allstateCompany = await supabase
              .from('insurance_companies')
              .select('id')
              .eq('slug', 'allstate')
              .single()
            
            console.log('🔍 Allstate company lookup:', allstateCompany)
            
            if (allstateCompany.error || !allstateCompany.data) {
              console.warn('⚠️ Allstate company not found, saltando payment transaction:', allstateCompany.error)
            } else {
              // Mapear payment_frequency a valores válidos de la tabla
              const validPaymentFrequencies = {
                'Monthly': 'Monthly',
                'Quarterly': 'Quarterly', 
                'SemiAnnual': 'SemiAnnual',
                'Annual': 'Annual',
                'SinglePayment': 'SinglePayment',
                'None': 'None'
              }
              
              const mappedFrequency = validPaymentFrequencies[formData.paymentFrequency] || 'Monthly'
              
              const paymentTransactionData = {
                application_id: applicationId,
                company_id: allstateCompany.data.id,
                transaction_status: apiSuccess ? 'completed' : 'failed',
                amount: Number(companyData.amount), // Asegurar que sea número
                currency: 'USD',
                payment_method: formData.paymentMethod === 'bank_account' ? 'ach' : 'credit_card',
                payment_frequency: mappedFrequency,
                next_payment_date: calculateNextPaymentDate(mappedFrequency, formData.effectiveDate),
                payment_schedule: generatePaymentSchedule(mappedFrequency, formData.effectiveDate, companyData.amount),
                // Solo información de historial, sin datos sensibles
                payment_method_info: {
                  method_type: formData.paymentMethod,
                  brand: formData.cardBrand || null
                },
                processor_response: apiSuccess ? apiResult : null,
                processor_error: apiSuccess ? null : apiResult
              }
              
              console.log('🔍 Datos de payment transaction a enviar:', paymentTransactionData)
              await savePaymentTransaction(paymentTransactionData)
              console.log(`✅ Payment transaction guardada para ${companyData.company_slug}`)
            }
          } catch (paymentError) {
            console.warn('⚠️ Error guardando payment transaction (no crítico):', paymentError)
          }
          
          // 4e. Guardar respuesta completa de Allstate (siempre que tengamos respuesta)
          if (apiResult) {
            console.log(`💾 Guardando respuesta completa de ${companyData.company_slug}...`)
            try {
              await saveAllstateApiResponse(applicationId, apiResult)
              console.log(`✅ Respuesta de ${companyData.company_slug} guardada en BD`)
            } catch (responseError) {
              console.warn('⚠️ Error guardando respuesta de Allstate (no crítico):', responseError)
            }
          }
          
          // 4f. Actualizar estado de la aplicación
          if (apiSuccess) {
            await updateApplicationWithApiResponse(
              applicationId,
              apiResult.data,
              null,
              'submitted'
            )
            results.push({ 
              company: companyData.company_slug, 
              success: true,
              application_id: applicationId
            })
            console.log(`✅ ${companyData.company_slug} procesado exitosamente`)
          } else {
            await updateApplicationWithApiResponse(
              applicationId,
              null,
              apiResult,
              'submission_failed'
            )
            results.push({ 
              company: companyData.company_slug, 
              success: false, 
              error: apiResult,
              application_id: applicationId
            })
            console.log(`⚠️ ${companyData.company_slug} falló:`, apiResult)
          }
          
        } catch (error) {
          console.error(`❌ Error procesando ${companyData.company_slug}:`, error)
          results.push({ 
            company: companyData.company_slug, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }
      
      // 5. ACTUALIZAR PERFIL DE USUARIO (solo una vez)
      console.log('📝 Actualizando perfil de usuario...')
      await updateUserProfile({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        address: formData.address1,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        profile_completed: true
      })
      console.log('✅ Perfil de usuario actualizado')
      
      // 6. EVALUAR RESULTADOS
      const evaluation = evaluateMultiCarrierResults(results)
      const message = getMultiCarrierMessage(results)
      
      console.log('📊 Resultados del enrollment:', evaluation)
      
      if (evaluation.allSuccess || evaluation.someSuccess) {
        // Todo exitoso o parcialmente exitoso - redirigir a página de éxito
        console.log(`✅ Enrollment ${evaluation.allSuccess ? 'completamente' : 'parcialmente'} exitoso`)
        
        if (evaluation.someSuccess && !evaluation.allSuccess) {
          // Si es parcialmente exitoso, mostrar advertencia antes de redirigir
          toast.warning(message.title, {
            description: message.message,
            duration: 5000
          })
        }
        
        // Marcar enrollment como completo ANTES de limpiar el carrito
        setIsEnrollmentComplete(true)
        
        clearCart()
        sessionStorage.removeItem('enrollmentFormData')
        router.push('/application-success')
      } else {
        // Todo falló
        console.log('❌ Enrollment falló completamente')
        toast.error(message.title, {
          description: message.message
        })
        setEnrollmentError({
          message: message.title,
          data: {
            isTestData: false,
            isPlanConfigurationError: false,
            isValidationError: false,
            requiresRealData: false
          },
          warning: message.message
        })
      }

    } catch (error) {
      console.error('❌ Error en enrollment:', error)
      
      // Mostrar error al usuario
      let errorMessage = 'Error de conexión'
      let errorDescription = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión e intenta nuevamente.'
      
      if (error instanceof Error) {
        if (error.message.includes('500')) {
          errorMessage = 'Error del servidor'
          errorDescription = 'El servidor está experimentando problemas. Por favor, intenta nuevamente en unos minutos.'
        } else if (error.message.includes('400')) {
          errorMessage = 'Error de validación'
          errorDescription = 'Los datos enviados no son válidos. Por favor, revisa la información.'
        }
      }
      
      toast.error(errorMessage, {
        description: errorDescription,
        duration: 10000
      })
      
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función auxiliar para calcular próxima fecha de pago
  const calculateNextPaymentDate = (frequency: string, effectiveDate: string): string => {
    const startDate = new Date(effectiveDate)
    
    switch (frequency) {
      case 'Monthly':
      case 'SocialSecurityMonthly':
        return new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate()).toISOString().split('T')[0]
      case 'Quarterly':
        return new Date(startDate.getFullYear(), startDate.getMonth() + 3, startDate.getDate()).toISOString().split('T')[0]
      case 'SemiAnnual':
        return new Date(startDate.getFullYear(), startDate.getMonth() + 6, startDate.getDate()).toISOString().split('T')[0]
      case 'Annual':
        return new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate()).toISOString().split('T')[0]
      case 'SinglePayment':
      case 'None':
        // Para pago único o sin pago, no hay próxima fecha
        return null as any
      default:
        return new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate()).toISOString().split('T')[0]
    }
  }

  // Función auxiliar para generar cronograma de pagos
  const generatePaymentSchedule = (frequency: string, effectiveDate: string, amount: number): any => {
    const startDate = new Date(effectiveDate)
    const schedule = []
    
    // Para pago único o sin pago, no generar cronograma
    if (frequency === 'SinglePayment' || frequency === 'None') {
      return []
    }
    
    const monthsToAdd = frequency === 'Monthly' || frequency === 'SocialSecurityMonthly' ? 1 : 
                       frequency === 'Quarterly' ? 3 :
                       frequency === 'SemiAnnual' ? 6 : 12
    
    // Generar próximos 12 pagos (o menos para frecuencias largas)
    const maxPayments = frequency === 'Annual' ? 2 : 12
    
    for (let i = 1; i <= maxPayments; i++) {
      const paymentDate = new Date(startDate.getFullYear(), startDate.getMonth() + (monthsToAdd * i), startDate.getDate())
      schedule.push({
        payment_number: i,
        due_date: paymentDate.toISOString().split('T')[0],
        amount: amount,
        status: 'pending'
      })
    }
    
    return schedule
  }

  // Función auxiliar para validar tarjeta con algoritmo de Luhn
  const validateLuhn = (cardNumber: string): boolean => {
    let sum = 0
    let isEven = false
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i], 10)
      
      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }
      
      sum += digit
      isEven = !isEven
    }
    
    return sum % 10 === 0
  }

  const validateEnrollmentData = (data: EnrollmentFormState): string[] => {
    const errors: string[] = []
    
    // Campos requeridos
    if (!data.firstName?.trim()) errors.push("First name is required")
    if (!data.lastName?.trim()) errors.push("Last name is required")
    if (!data.email?.trim()) errors.push("Email is required")
    if (!data.phone?.trim()) errors.push("Phone is required")
    if (!data.address1?.trim()) errors.push("Address is required")
    if (!data.city?.trim()) errors.push("City is required")
    if (!data.state?.trim()) errors.push("State is required")
    if (!data.zipCode?.trim()) errors.push("ZIP code is required")
    if (!data.dateOfBirth) errors.push("Date of birth is required")
    if (!data.ssn?.trim()) errors.push("SSN is required")
    if (!data.gender?.trim()) errors.push("Gender is required")
    if (!data.effectiveDate) errors.push("Effective date is required")
    if (data.selectedPlans.length === 0) errors.push("At least one plan must be selected")
    
    // Validar formatos
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push("Invalid email format")
    }
    
    const phoneDigits = data.phone?.replace(/\D/g, '')
    if (phoneDigits && phoneDigits.length !== 10) {
      errors.push("Phone must be 10 digits")
    }
    
    const ssnDigits = data.ssn?.replace(/\D/g, '')
    if (ssnDigits && ssnDigits.length !== 9) {
      errors.push("SSN must be 9 digits")
    }
    
    if (data.zipCode && !/^\d{5}$/.test(data.zipCode)) {
      errors.push("ZIP code must be 5 digits")
    }
    
    // Validar payment
    if (!data.submitWithoutPayment) {
      if (!data.accountHolderFirstName?.trim()) errors.push("Account holder first name is required")
      if (!data.accountHolderLastName?.trim()) errors.push("Account holder last name is required")
      
      if (data.paymentMethod === 'credit_card') {
        if (!data.creditCardNumber?.trim()) errors.push("Credit card number is required")
        if (!data.expirationMonth) errors.push("Expiration month is required")
        if (!data.expirationYear) errors.push("Expiration year is required")
        if (!data.cvv?.trim()) errors.push("CVV is required")
        if (!data.cardBrand?.trim()) errors.push("Card brand is required")
        
        // Validar número de tarjeta con algoritmo de Luhn
        const cardNumber = data.creditCardNumber?.replace(/\D/g, '')
        if (cardNumber && !validateLuhn(cardNumber)) {
          errors.push("Invalid credit card number")
        }
      } else {
        if (!data.routingNumber?.trim()) errors.push("Routing number is required")
        if (!data.accountNumber?.trim()) errors.push("Account number is required")
        if (!data.bankName?.trim()) errors.push("Bank name is required")
        if (!data.accountType) errors.push("Account type is required")
        
        if (data.routingNumber && !/^\d{9}$/.test(data.routingNumber)) {
          errors.push("Routing number must be 9 digits")
        }
      }
    }
    
    // Validar beneficiaries allocation
    if (data.beneficiaries.length > 0) {
      const totalAllocation = data.beneficiaries.reduce((sum, ben) => sum + ben.allocationPercentage, 0)
      if (totalAllocation !== 100) {
        errors.push(`Beneficiary allocation must equal 100% (current: ${totalAllocation}%)`)
      }
    }
    
    return errors
  }

  const buildEnrollmentRequest = (data: EnrollmentFormState) => {
    console.log('🔍 buildEnrollmentRequest - data.selectedPlans:', data.selectedPlans)
    console.log('🔍 buildEnrollmentRequest - cartItems:', cartItems)
    
    // Get client IP (in production, this should be done server-side)
    const clientIP = "0.0.0.0" // Placeholder

    return {
      demographics: {
        zipCode: data.zipCode,
        email: data.email,
        address1: data.address1,
        address2: data.address2,
        city: data.city,
        state: data.state,
        phone: data.phone,
        alternatePhone: data.alternatePhone,
        zipCodePlus4: data.zipCodePlus4,
        isEFulfillment: data.isEFulfillment,
        applicants: [
          {
            applicantId: "primary-001",  // AGREGAR
            firstName: data.firstName,
            middleInitial: data.middleInitial,
            lastName: data.lastName,
            gender: data.gender,
            dob: new Date(data.dateOfBirth).toISOString(),
            smoker: data.smoker,
              relationship: data.relationship === 'Self' ? 'Primary' : data.relationship,
            ssn: data.ssn,
            weight: Number(data.weight),
            heightFeet: Number(data.heightFeet),
            heightInches: Number(data.heightInches),
            dateLastSmoked: data.dateLastSmoked ? new Date(data.dateLastSmoked).toISOString() : undefined,
            hasPriorCoverage: data.hasPriorCoverage,
            eligibleRateTier: "Standard",
            quotedRateTier: "Standard",
            phoneNumbers: [{  // AGREGAR
              phoneNumber: data.phone,
              phoneType: "Mobile",
              allowTextMessaging: true,
              allowServiceCalls: true
            }],
            ...(data.hasMedicare && {
              medSuppInfo: {
                medicarePartAEffectiveDate: data.medicarePartAEffectiveDate ? new Date(data.medicarePartAEffectiveDate).toISOString() : undefined,
                medicarePartBEffectiveDate: data.medicarePartBEffectiveDate ? new Date(data.medicarePartBEffectiveDate).toISOString() : undefined,
                medicareId: data.medicareId,
                isPreMACRAEligible: data.isPreMACRAEligible
              }
            }),
            medications: data.medications,
            questionResponses: data.questionResponses
          },
          ...data.additionalApplicants.map((app, index) => ({
            ...app,
            applicantId: `additional-${String(index + 1).padStart(3, '0')}`,  // AGREGAR
            dob: new Date(app.dob).toISOString(),
            dateLastSmoked: app.dateLastSmoked ? new Date(app.dateLastSmoked).toISOString() : undefined
          }))
        ]
      },
      coverages: data.selectedPlans.map(plan => {
        console.log('🔍 Plan data for coverage:', {
          id: plan.id,
          planKey: plan.planKey,
          name: plan.name,
          price: plan.price,
          carrierName: plan.carrierName,
          productCode: plan.productCode,
          planType: plan.planType
        })
        
        return {
          planKey: plan.planKey || plan.productCode || plan.id, // Usar planKey, productCode o id como fallback
          effectiveDate: new Date(data.effectiveDate).toISOString(),
          monthlyPremium: plan.price,
          paymentFrequency: data.paymentFrequency,
          carrierName: plan.carrierName || "All State", // Valor por defecto
          agentNumber: process.env.NEXT_PUBLIC_AGENT_NUMBER || "159208",
          // Campos adicionales que podrían ser necesarios
          planType: plan.planType,
          productType: plan.productType,
          isAutomaticLoanProvisionOptedIn: data.isAutomaticLoanProvisionOptedIn,
          applicants: [
            {
              applicantId: "primary-001"
              // REMOVED: hasPriorCoverage, questionResponses, eligibleRateTier, quotedRateTier 
              // (should only be in demographics.applicants)
            }
          ],
          beneficiaries: data.beneficiaries.map((ben, index) => ({
            beneficiaryId: index + 1,  // AGREGAR
            firstName: ben.firstName,
            middleName: ben.middleName,
            lastName: ben.lastName,
            relationship: ben.relationship,
            allocationPercentage: ben.allocationPercentage,
            dateOfBirth: new Date(ben.dateOfBirth).toISOString(),
            addresses: ben.addresses,
            phoneNumbers: ben.phoneNumbers
          }))
        }
      }),
      paymentInformation: {
        accountType: data.paymentMethod === 'credit_card' ? 'CreditCard' : 'ACH',  // AGREGAR
        accountHolderFirstName: data.accountHolderFirstName,
        accountHolderLastName: data.accountHolderLastName,
        ...(data.paymentMethod === 'credit_card' ? {
          creditCardNumber: data.creditCardNumber,
          expirationMonth: Number(data.expirationMonth),
          expirationYear: Number(data.expirationYear),
          cvv: data.cvv,
          cardBrand: data.cardBrand
        } : {
          routingNumber: data.routingNumber,
          accountNumber: data.accountNumber,
          bankName: data.bankName,
          bankDraft: data.accountType === 'checking' ? 'Checking' : 'Savings',
          desiredDraftDate: Number(data.desiredDraftDate)
        }),
        isSubmitWithoutPayment: data.submitWithoutPayment
      },
      partnerInformation: {
        agentNumber: process.env.NEXT_PUBLIC_AGENT_NUMBER || "159208",
        clientIPAddress: clientIP
      },
      attestationInformation: {
        referenceId: `APP-${Date.now()}`,  // AGREGAR
        dateCollected: new Date().toISOString(),
        type: "ApplicantEsign",  // CAMBIAR
        value: data.signature,
        clientIPAddress: clientIP
      },
      enrollmentDate: new Date().toISOString()
    }
    
    // Log del objeto final de coverages antes de retornar
    console.log('🔍 Final coverages object:', enrollmentRequest.coverages)
    
    return enrollmentRequest
  }

  const progress = (currentStep / TOTAL_STEPS) * 100

  return (
    <>
      {enrollmentError && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <EnrollmentErrorNotification
            error={enrollmentError}
            onRetry={() => {
              setEnrollmentError(null)
              // Optionally retry the enrollment
            }}
            onDismiss={() => setEnrollmentError(null)}
          />
        </div>
      )}
      
      <EnrollmentLayout
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        formData={formData}
        updateFormData={updateFormData}
        onNext={handleNext}
        onBack={handleBack}
        onStepClick={handleStepClick}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        progress={progress}
      />
    </>
  )
}
