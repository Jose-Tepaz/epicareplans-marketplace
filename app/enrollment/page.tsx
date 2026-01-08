"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import type { EnrollmentFormState } from "@/lib/types/enrollment"
import { EnrollmentLayout } from "@/components/enrollment-layout"
import { EnrollmentErrorNotification } from "@/components/enrollment-error-notification"
import { updateUserProfile, recordEnrollmentStartAPI } from "@/lib/api/enrollment-db"
import { splitPlansByCompany, evaluateMultiCarrierResults, getMultiCarrierMessage } from "@/lib/api/enrollment-split"
import { createClient } from "@/lib/supabase/client"
import { getFamilyMembers, familyMemberToApplicant } from "@/lib/api/family-members"
import { buildPrimaryApplicant, getUpdatedPlanPrice, familyMemberToRateCartApplicant } from "@/lib/api/carriers/allstate-rate-cart"
import type { FamilyMember } from "@/lib/types/enrollment"

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
  const [isRecalculating, setIsRecalculating] = useState(false)
  
  // Estado para validación del paso 1 (preguntas de elegibilidad)
  // Inicialmente false para deshabilitar el botón Next hasta que se validen las preguntas
  // El componente Step1DynamicQuestions actualizará este estado cuando las preguntas se carguen y validen
  const [step1Validation, setStep1Validation] = useState<{ isValid: boolean; errors: string[]; hasBeenValidated: boolean }>({
    isValid: false,
    errors: [],
    hasBeenValidated: false
  })

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
          
          // Cargar family members
          try {
            console.log('🔍 Cargando family members...')
            const familyMembers = await getFamilyMembers()
            
            if (familyMembers.length > 0) {
              // Filtrar solo los miembros incluidos en la cotización
              const activeMembers = familyMembers.filter(m => m.included_in_quote !== false)
              console.log('✅ Family members encontrados:', familyMembers.length)
              console.log('✅ Family members activos para enrollment:', activeMembers.length)
              
              // Convertir family members a formato Applicant
              const additionalApplicants = activeMembers.map((member: any, index: number) => 
                familyMemberToApplicant(member, index)
              )
              
              setFormData((prev: any) => ({
                ...prev,
                additionalApplicants
              }))
              
              console.log('✅ Additional applicants pre-cargados desde family members')
            }
          } catch (familyError) {
            console.error('❌ Error cargando family members:', familyError)
            // No es un error crítico, continuar con el flujo
          }
          
          if (userProfile) {
            console.log('✅ Perfil del usuario encontrado:', userProfile)
            setFormData((prev: any) => ({
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
            
            setFormData((prev: any) => ({
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
        setFormData((prev: any) => ({ ...prev, ...parsedData }))
      }

      // 3. Usar email del usuario autenticado si no hay datos
      if (user?.email && !savedData) {
        console.log('✅ Usuario autenticado, usando email:', user.email)
        setFormData((prev: any) => ({ ...prev, email: user.email || prev.email }))
      }

    // Cargar ZIP code del explore page
    if (userZipCode) {
      setFormData((prev: any) => ({ ...prev, zipCode: userZipCode }))
      console.log('ZIP code cargado del localStorage:', userZipCode)
    }

    // Pre-fill from insurance form if available
    if (insuranceFormData) {
      const insuranceData = JSON.parse(insuranceFormData)
      setFormData((prev: any) => ({
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
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  // Validation functions for each step
  // Handler para recibir el estado de validación del paso 1 (preguntas)
  const handleStep1ValidationChange = useCallback((isValid: boolean, errors: string[]) => {
    setStep1Validation({ isValid, errors, hasBeenValidated: true })
  }, [])

  const validateStep = (step: number): { isValid: boolean; message?: string } => {
    switch (step) {
      case 1: // ApplicationBundle Questions (NUEVO)
        // Si aún no se ha validado (las preguntas no se han cargado), permitir avanzar
        // El componente Step1DynamicQuestions notificará cuando las preguntas se carguen
        if (!step1Validation.hasBeenValidated) {
          // Las preguntas aún no se han cargado - esto podría ser el primer render
          // Verificar si hay respuestas ya almacenadas
          const hasResponses = formData.questionResponses && formData.questionResponses.length > 0
          if (!hasResponses) {
            return { 
              isValid: false, 
              message: 'Por favor espere a que las preguntas de elegibilidad se carguen y respóndalas todas' 
            }
          }
        }
        
        // Validar que todas las preguntas estén respondidas para todos los aplicantes
        if (!step1Validation.isValid) {
          const applicantsCount = 1 + (formData.additionalApplicants?.length || 0)
          if (applicantsCount > 1) {
            return { 
              isValid: false, 
              message: `Por favor responda todas las preguntas de elegibilidad para los ${applicantsCount} aplicantes` 
            }
          }
          return { 
            isValid: false, 
            message: 'Por favor responda todas las preguntas de elegibilidad antes de continuar' 
          }
        }
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
          const totalAllocation = formData.beneficiaries.reduce((sum: number, ben: any) => sum + ben.allocationPercentage, 0)
          if (totalAllocation !== 100) {
            return { isValid: false, message: 'Beneficiary allocation must total 100%' }
          }
        }
        return { isValid: true }

      case 8: // Payment Information (antes Paso 8)
        // Si envía sin pago, no validar campos de pago
        if (formData.submitWithoutPayment) {
          return { isValid: true }
        }
        
        // Si usa un método de pago guardado, solo validar que esté seleccionado
        if (formData.savedPaymentMethodId) {
          console.log('✅ Usando método de pago guardado:', formData.savedPaymentMethodId)
          return { isValid: true }
        }
        
        // Si no usa método guardado, validar todos los campos
        if (!formData.accountHolderFirstName?.trim()) {
          return { isValid: false, message: 'Account holder first name is required' }
        }
        if (!formData.accountHolderLastName?.trim()) {
          return { isValid: false, message: 'Account holder last name is required' }
        }

        if (formData.paymentMethod === 'credit_card') {
          if (!formData.creditCardNumber?.trim()) return { isValid: false, message: 'Card number is required' }
          if (formData.creditCardNumber.replace(/\s/g, '').length < 13) {
            return { isValid: false, message: 'Invalid card number' }
          }
          if (!formData.expirationMonth) return { isValid: false, message: 'Expiration month is required' }
          if (!formData.expirationYear) return { isValid: false, message: 'Expiration year is required' }
          if (!formData.cvv?.trim()) return { isValid: false, message: 'CVV is required' }
          if (formData.cvv.length < 3) return { isValid: false, message: 'CVV must be 3-4 digits' }
          if (!formData.cardBrand) return { isValid: false, message: 'Card brand is required' }
        } else if (formData.paymentMethod === 'bank_account') {
          if (!formData.bankName?.trim()) return { isValid: false, message: 'Bank name is required' }
          if (!formData.routingNumber?.trim()) return { isValid: false, message: 'Routing number is required' }
          if (formData.routingNumber.length !== 9) return { isValid: false, message: 'Routing number must be 9 digits' }
          if (!formData.accountNumber?.trim()) return { isValid: false, message: 'Account number is required' }
          if (!formData.accountType) return { isValid: false, message: 'Account type is required' }
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

  const handleRecalculateQuotes = async (currentFormData?: EnrollmentFormState) => {
    setIsRecalculating(true)
    try {
      // Usar el formData pasado como parámetro o el estado actual
      const dataToUse = currentFormData || formData
      
      // IMPORTANTE: dataToUse.additionalApplicants ya contiene SOLO los miembros activos
      // porque FamilyMembersManager filtra por included_in_quote antes de llamar a onMemberChange
      // Por lo tanto, podemos usar directamente dataToUse.additionalApplicants
      
      // Convertir additionalApplicants a formato FamilyMember para Rate/Cart
      const familyMembers: FamilyMember[] = dataToUse.additionalApplicants.map((app: any) => ({
        first_name: app.firstName,
        last_name: app.lastName,
        date_of_birth: app.dob, // Ya está en formato YYYY-MM-DD o ISO
        gender: app.gender,
        relationship: app.relationship,
        smoker: app.smoker,
        has_prior_coverage: app.hasPriorCoverage || false,
      })) as FamilyMember[]

      // Construir Primary Applicant para Rate/Cart
      const primaryApplicant = buildPrimaryApplicant({
        dateOfBirth: dataToUse.dateOfBirth,
        gender: dataToUse.gender,
        smokes: dataToUse.smoker,
        hasPriorCoverage: false // Default
      })

      // Obtener state si no está disponible
      let state = dataToUse.state
      if (!state && dataToUse.zipCode) {
        try {
          console.log('🔍 Fetching state for Enrollment Rate/Cart...')
          const res = await fetch(`/api/address/validate-zip/${dataToUse.zipCode}`)
          const data = await res.json()
          if (data.success && data.data?.state) {
            state = data.data.state
            console.log('✅ State fetched for enrollment:', state)
          }
        } catch (e) {
          console.error('Failed to fetch state for Enrollment Rate/Cart', e)
          state = 'NJ' // Fallback
        }
      }

      console.log('🔄 Recalculando precios con Rate/Cart antes de ir a cobertura...')
      console.log(`📊 Familiares incluidos en recotización: ${familyMembers.length}`)
      console.log(`📋 Detalles de familiares:`, familyMembers.map(m => ({ 
        name: `${m.first_name} ${m.last_name}`, 
        relationship: m.relationship,
        dob: m.date_of_birth,
        gender: m.gender,
        smoker: m.smoker
      })))

      // Iterar sobre los planes seleccionados y actualizar precio usando Rate/Cart
      let changesCount = 0
      const updatedPlans = [...dataToUse.selectedPlans]
      
      for (let i = 0; i < updatedPlans.length; i++) {
        const plan = updatedPlans[i]
        
        // Solo recotizar si es un plan de Allstate
        if (plan.carrierSlug === 'allstate' || plan.allState) {
          console.log(`🔄 Recalculando precio para: ${plan.name} (${plan.id})`)
          
          const result = await getUpdatedPlanPrice(
            primaryApplicant,
            familyMembers, // getUpdatedPlanPrice espera FamilyMember[], no RateCartApplicant[]
            plan,
            {
              zipCode: dataToUse.zipCode,
              state: state || 'NJ',
              effectiveDate: dataToUse.effectiveDate,
              paymentFrequency: dataToUse.paymentFrequency || 'Monthly'
            }
          )

          if (result.success) {
            const newApplicants = 1 + familyMembers.length
            const meta = plan.metadata as { applicantsIncluded?: number; originalPrice?: number } | undefined
            
            if (plan.price !== result.price || meta?.applicantsIncluded !== newApplicants) {
              console.log(`✅ Precio actualizado para ${plan.name}: $${plan.price} -> $${result.price} (Applicants: ${newApplicants})`)
              updatedPlans[i] = {
                ...plan,
                price: result.price,
                metadata: {
                  ...plan.metadata,
                  originalPrice: meta?.originalPrice || plan.price,
                  priceUpdatedWithRateCart: true,
                  applicantsIncluded: newApplicants
                }
              }
              changesCount++
            }
          } else {
            console.warn(`⚠️ No se pudo recalcular precio para ${plan.name}:`, result.error)
          }
        }
      }

      if (changesCount > 0) {
        updateFormData('selectedPlans', updatedPlans)
        toast.success('Prices updated', { 
          description: `Prices adjusted for ${changesCount} plan(s) based on ${familyMembers.length} family member(s).` 
        })
      } else {
        console.log('ℹ️ No se encontraron cambios de precio en los planes')
      }
    } catch (err) {
      console.error('❌ Error inesperado al recalcular:', err)
      toast.error('Error updating prices', { description: 'Proceeding with current prices.' })
    } finally {
      setIsRecalculating(false)
    }
  }

  const handleNext = async () => {
    const validation = validateStep(currentStep)

    if (!validation.isValid) {
      toast.error(validation.message || 'Please complete all required fields', {
        description: 'All fields marked with * are required',
        duration: 4000,
      })
      return
    }

    // Si estamos en el paso 5 (Additional Applicants) y vamos al 6 (Coverage), recalcular precios
    if (currentStep === 5) {
      // Pequeño delay para asegurar que el estado se haya actualizado después de marcar/desmarcar familiares
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Recalcular precios usando los aplicantes definidos en el formulario
      // En este paso, los 'additionalApplicants' son los que el usuario ha confirmado
      // formData.additionalApplicants ya contiene SOLO los miembros activos (marcados para quoting)
      console.log('📋 Estado actual de additionalApplicants antes de recalcular:', formData.additionalApplicants.length)
      console.log('📋 Detalles de additionalApplicants:', formData.additionalApplicants.map((app: any) => ({
        name: `${app.firstName} ${app.lastName}`,
        relationship: app.relationship,
        dob: app.dob
      })))
      
      // Usar el estado actualizado para el recálculo
      await handleRecalculateQuotes(formData)
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
            status: 'draft',
            savedPaymentMethodId: formData.savedPaymentMethodId,
            savePaymentMethod: formData.savePaymentMethod
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
              parent_application_id: parentApplicationId,
              savedPaymentMethodId: formData.savedPaymentMethodId,
              savePaymentMethod: formData.savePaymentMethod
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
          
          // NOTA: Ya no enviamos a la API de la aseguradora desde aquí
          // El enrollment se guarda en estado 'pending_approval' para revisión manual
          // Un admin/agent lo enviará manualmente desde el dashboard de administración
          console.log(`✅ Enrollment guardado en estado 'pending_approval' para ${companyData.company_slug}`)
          
          // Agregar resultado exitoso
          results.push({ 
            company: companyData.company_slug, 
            success: true,
            application_id: applicationId
          })
          console.log(`✅ ${companyData.company_slug} guardado exitosamente para revisión`)
          
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
      const totalAllocation = data.beneficiaries.reduce((sum: number, ben: any) => sum + ben.allocationPercentage, 0)
      if (totalAllocation !== 100) {
        errors.push(`Beneficiary allocation must equal 100% (current: ${totalAllocation}%)`)
      }
    }
    
    return errors
  }

  // Función para limpiar objetos eliminando undefined/null (pero NO strings vacíos)
  const cleanObject = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(item => cleanObject(item))
    }
    if (obj !== null && typeof obj === 'object') {
      return Object.fromEntries(
        Object.entries(obj)
          .filter(([_, v]) => v !== undefined && v !== null)
          .map(([k, v]) => [k, cleanObject(v)])
      )
    }
    return obj
  }

  const buildEnrollmentRequest = (data: EnrollmentFormState, companySlug?: string, plans?: any[]) => {
    const plansToUse = plans || data.selectedPlans
    console.log('🔍 buildEnrollmentRequest - data.selectedPlans:', data.selectedPlans)
    console.log('🔍 buildEnrollmentRequest - plansToUse:', plansToUse)
    console.log('🔍 buildEnrollmentRequest - cartItems:', cartItems)
    console.log('🔍 buildEnrollmentRequest - companySlug:', companySlug)
    
    // Get client IP (in production, this should be done server-side)
    const clientIP = "0.0.0.0" // Placeholder
    
    // Determinar si es Allstate para aplicar estructura específica
    const isAllstate = companySlug === 'allstate' || !companySlug // Si no se especifica, asumir Allstate por compatibilidad

    // Construir applicants base
    // Para Allstate, questionResponses es REQUERIDO para TODOS los applicants
    const primaryQuestionResponses = data.questionResponses && data.questionResponses.length > 0 
      ? data.questionResponses 
      : []
    
    const allApplicants = [
      {
        applicantId: "primary-001",
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        dob: new Date(data.dateOfBirth).toISOString(),
        smoker: data.smoker,
        relationship: data.relationship === 'Self' ? 'Primary' : data.relationship,
        ssn: data.ssn,
        weight: Number(data.weight),
        heightFeet: Number(data.heightFeet),
        heightInches: Number(data.heightInches),
        phoneNumbers: [{
          phoneNumber: data.phone,
          phoneType: "Mobile",
          allowTextMessaging: true,
          allowServiceCalls: true
        }],
        questionResponses: primaryQuestionResponses
      },
      ...data.additionalApplicants.map((app: any, index: number) => {
        // Para additional applicants, usar sus questionResponses o copiar del primary
        const appQuestionResponses = app.questionResponses && app.questionResponses.length > 0 
          ? app.questionResponses 
          : primaryQuestionResponses // Usar los del primary como fallback
        
        // Mapear relationship a valores válidos de Allstate: Primary, Spouse, Dependent
        const mapRelationship = (rel: string): string => {
          if (!rel) return 'Dependent'
          const relLower = rel.toLowerCase()
          if (relLower === 'primary' || relLower === 'self') return 'Primary'
          if (relLower === 'spouse' || relLower === 'wife' || relLower === 'husband') return 'Spouse'
          // Cualquier otro valor (Child, Dependent, etc.) se mapea a Dependent
          return 'Dependent'
        }
        
        const mappedRelationship = mapRelationship(app.relationship)
        
        return {
          applicantId: `additional-${String(index + 1).padStart(3, '0')}`,
          firstName: app.firstName,
          lastName: app.lastName,
          gender: app.gender,
          dob: new Date(app.dob).toISOString(),
          smoker: app.smoker,
          relationship: mappedRelationship,
          ssn: app.ssn,
          weight: Number(app.weight),
          heightFeet: Number(app.heightFeet),
          heightInches: Number(app.heightInches),
          phoneNumbers: app.phoneNumbers || [{
            phoneNumber: app.phone || data.phone,
            phoneType: mappedRelationship === 'Dependent' ? 'Home' : 'Mobile',
            allowTextMessaging: mappedRelationship !== 'Dependent',
            allowServiceCalls: true
          }],
          questionResponses: appQuestionResponses
        }
      })
    ]

    // Construir demographics según carrier
    // Para Allstate: orden exacto según estructura esperada
    const demographics = isAllstate ? {
      zipCode: data.zipCode,
      email: data.email,
      address1: data.address1,
      city: data.city,
      state: data.state,
      phone: data.phone,
      applicants: allApplicants,
      isEFulfillment: true
    } : {
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
      applicants: allApplicants.map(app => ({
        ...app,
        middleInitial: app.middleInitial,
        dateLastSmoked: app.dateLastSmoked ? new Date(app.dateLastSmoked).toISOString() : undefined,
        hasPriorCoverage: app.hasPriorCoverage,
        eligibleRateTier: app.eligibleRateTier || "Standard",
        quotedRateTier: app.quotedRateTier || "Standard",
        medications: app.medications,
        ...(app.medSuppInfo && { medSuppInfo: app.medSuppInfo })
      }))
    }

    // Construir coverages según carrier
    const coverages = plansToUse.map((plan: any) => {
      console.log('🔍 Plan data for coverage:', {
        id: plan.id,
        planKey: plan.planKey,
        name: plan.name,
        price: plan.price,
        carrierName: plan.carrierName,
        productCode: plan.productCode,
        planType: plan.planType
      })
      
      if (isAllstate) {
        // Estructura específica para Allstate
        // Formatear effectiveDate como YYYY-MM-DD (no ISO completo)
        const effectiveDate = new Date(data.effectiveDate)
        const formattedEffectiveDate = `${effectiveDate.getFullYear()}-${String(effectiveDate.getMonth() + 1).padStart(2, '0')}-${String(effectiveDate.getDate()).padStart(2, '0')}`
        
        return {
          planKey: plan.planKey || plan.productCode || plan.id,
          // Usar el precio FINAL del plan (después de checkout y recálculo con familiares)
          monthlyPremium: plan.price,
          effectiveDate: formattedEffectiveDate,
          paymentFrequency: data.paymentFrequency,
          carrierName: plan.carrierName || "Allstate", // Agregar carrierName para guardar en BD
          agentNumber: plan.agentNumber || process.env.NEXT_PUBLIC_AGENT_NUMBER || "159208", // Agregar agentNumber
          applicants: allApplicants.map(app => ({
            applicantId: app.applicantId,
            eligibleRateTier: "Standard"
          }))
        }
      } else {
        // Estructura genérica para otros carriers
        return {
          planKey: plan.planKey || plan.productCode || plan.id,
          effectiveDate: new Date(data.effectiveDate).toISOString(),
          // Usar el precio FINAL del plan (después de checkout y recálculo con familiares)
          monthlyPremium: plan.price,
          paymentFrequency: data.paymentFrequency,
          carrierName: plan.carrierName || "All State",
          agentNumber: process.env.NEXT_PUBLIC_AGENT_NUMBER || "159208",
          planType: plan.planType,
          productType: plan.productType,
          isAutomaticLoanProvisionOptedIn: data.isAutomaticLoanProvisionOptedIn,
          applicants: [
            {
              applicantId: "primary-001"
            }
          ],
          beneficiaries: data.beneficiaries.map((ben: any, index: number) => ({
            beneficiaryId: index + 1,
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
      }
    })

    // Construir paymentInformation según carrier
    const paymentInformation = isAllstate ? {
      accountHolderFirstName: data.accountHolderFirstName,
      accountHolderLastName: data.accountHolderLastName,
      accountType: data.paymentMethod === 'credit_card' ? 'CreditCard' : 'ACH',
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
        accountTypeBank: data.accountType === 'checking' ? 'checking' : 'savings',
        bankDraft: data.accountType === 'checking' ? 'Checking' : 'Savings',
        desiredDraftDate: Number(data.desiredDraftDate)
      })
    } : {
      accountType: data.paymentMethod === 'credit_card' ? 'CreditCard' : 'ACH',
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
    }

    // Construir partnerInformation según carrier
    const partnerInformation = isAllstate ? {
      agentNumber: process.env.NEXT_PUBLIC_AGENT_NUMBER || "159208",
      clientCaseID: `CASE_${Date.now()}`
    } : {
      agentNumber: process.env.NEXT_PUBLIC_AGENT_NUMBER || "159208",
      clientIPAddress: clientIP
    }

    const enrollmentRequest = {
      demographics,
      coverages,
      paymentInformation,
      partnerInformation,
      attestationInformation: {
        referenceId: `APP-${Date.now()}`,
        dateCollected: new Date().toISOString(),
        type: "ApplicantEsign",
        value: data.signature || "",
        clientIPAddress: clientIP
      },
      enrollmentDate: new Date().toISOString()
    }
    
    // Limpiar el objeto de campos undefined/null
    const cleanedRequest = cleanObject(enrollmentRequest)
    
    // Log del objeto final de coverages antes de retornar
    console.log('🔍 Final coverages object:', cleanedRequest.coverages)
    console.log('🔍 Enrollment request structure for:', isAllstate ? 'Allstate' : companySlug || 'default')
    
    return cleanedRequest
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
        isSubmitting={isSubmitting || isRecalculating}
        progress={progress}
        onStep1ValidationChange={handleStep1ValidationChange}
        isStep1Valid={step1Validation.isValid}
      />
    </>
  )
}
