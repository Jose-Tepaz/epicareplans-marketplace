"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { toast } from "sonner"
import type { EnrollmentFormState } from "@/lib/types/enrollment"
import { EnrollmentLayout } from "@/components/enrollment-layout"

const TOTAL_STEPS = 9

export default function EnrollmentPage() {
  const router = useRouter()
  const { items: cartItems, clearCart } = useCart()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCartLoaded, setIsCartLoaded] = useState(false)

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
        if (!formData.accountHolderFirstName.trim()) {
          return { isValid: false, message: 'Account holder first name is required' }
        }
        if (!formData.accountHolderLastName.trim()) {
          return { isValid: false, message: 'Account holder last name is required' }
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
      console.log('Enrollment successful:', result)

      // Clear cart and form data
      clearCart()
      sessionStorage.removeItem('enrollmentFormData')

      // Redirect to success page
      router.push('/application-success')

    } catch (error) {
      console.error('Error submitting enrollment:', error)
      alert('Error submitting enrollment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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
            firstName: data.firstName,
            middleInitial: data.middleInitial,
            lastName: data.lastName,
            gender: data.gender,
            dob: new Date(data.dateOfBirth).toISOString(),
            smoker: data.smoker,
            relationship: data.relationship,
            ssn: data.ssn,
            weight: Number(data.weight),
            heightFeet: Number(data.heightFeet),
            heightInches: Number(data.heightInches),
            dateLastSmoked: data.dateLastSmoked ? new Date(data.dateLastSmoked).toISOString() : undefined,
            hasPriorCoverage: data.hasPriorCoverage,
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
          ...data.additionalApplicants
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
            applicantId: "primary-001",
            hasPriorCoverage: data.hasPriorCoverage,
            eligibleRateTier: "Standard",
            quotedRateTier: "Standard",
            questionResponses: data.questionResponses
          }
        ],
        beneficiaries: data.beneficiaries.map(ben => ({
          ...ben,
          dateOfBirth: new Date(ben.dateOfBirth).toISOString()
        }))
      })),
      paymentInformation: {
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
          accountType: data.accountType,
          desiredDraftDate: Number(data.desiredDraftDate)
        }),
        isSubmitWithoutPayment: data.submitWithoutPayment
      },
      partnerInformation: {
        agentNumber: process.env.NEXT_PUBLIC_AGENT_NUMBER || "159208",
        clientIPAddress: clientIP
      },
      attestationInformation: {
        dateCollected: new Date().toISOString(),
        type: "Signature",
        value: data.signature,
        clientIPAddress: clientIP
      },
      enrollmentDate: new Date().toISOString()
    }
  }

  const progress = (currentStep / TOTAL_STEPS) * 100

  return (
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
  )
}
