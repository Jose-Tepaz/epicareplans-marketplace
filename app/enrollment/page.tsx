"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { toast } from "sonner"
import type { EnrollmentFormState } from "@/lib/types/enrollment"
import { EnrollmentLayout } from "@/components/enrollment-layout"
import { EnrollmentErrorNotification } from "@/components/enrollment-error-notification"

const TOTAL_STEPS = 9

export default function EnrollmentPage() {
  const router = useRouter()
  const { items: cartItems, clearCart } = useCart()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCartLoaded, setIsCartLoaded] = useState(false)
  const [enrollmentError, setEnrollmentError] = useState<any>(null)

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
    if (isCartLoaded && cartItems.length === 0) {
      router.push("/insurance-options")
    }
  }, [cartItems, router, isCartLoaded])

  // Load saved form data from sessionStorage
  useEffect(() => {
    const savedData = sessionStorage.getItem('enrollmentFormData')
    const insuranceFormData = sessionStorage.getItem('insuranceFormData')
    const userZipCode = localStorage.getItem('userZipCode')

    if (savedData) {
      setFormData({ ...formData, ...JSON.parse(savedData) })
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
  }, [])

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

    try {
      // Validar datos antes de enviar
      const validationErrors = validateEnrollmentData(formData)
      if (validationErrors.length > 0) {
        toast.error('Errores de validación', {
          description: validationErrors.join(', ')
        })
        setIsSubmitting(false)
        return
      }

      // Build enrollment request
      const enrollmentRequest = buildEnrollmentRequest(formData)

      console.log('Submitting enrollment:', enrollmentRequest)

      const response = await fetch('/api/enrollment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enrollmentRequest)
      })

      if (!response.ok) {
        throw new Error(`Enrollment failed: ${response.status}`)
      }

      const result = await response.json()
      console.log('Enrollment response:', result)

      // Check if enrollment was successful
      if (result.success) {
        console.log('Enrollment successful:', result)
        
        // Clear cart and form data
        clearCart()
        sessionStorage.removeItem('enrollmentFormData')

        // Redirect to success page
        router.push('/application-success')
      } else {
        // Store error for detailed display
        setEnrollmentError(result)
        
        // Log detailed error for debugging
        console.error('Enrollment failed:', {
          message: result.message,
          data: result.data,
          warning: result.warning
        })
      }

    } catch (error) {
      console.error('Error submitting enrollment:', error)
      
      // Handle network or other errors
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
      coverages: data.selectedPlans.map(plan => ({
        planKey: plan.planKey || plan.id, // Usar planKey del Quoting API si está disponible
        effectiveDate: new Date(data.effectiveDate).toISOString(),
        monthlyPremium: plan.price,
        paymentFrequency: data.paymentFrequency,
        carrierName: plan.carrierName || "All State",
        agentNumber: process.env.NEXT_PUBLIC_AGENT_NUMBER || "159208",
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
      })),
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
