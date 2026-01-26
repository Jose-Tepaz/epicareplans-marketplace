/**
 * Página de Exploración de Seguros
 * 
 * Esta página guía al usuario a través de un proceso de 6 pasos para
 * recopilar información necesaria antes de mostrar opciones de seguro.
 * 
 * Flujo:
 * 1. Pregunta si tiene cuenta (opcional, se puede saltar)
 * 2-7. Si no tiene cuenta o continúa:
 *   - Paso 1: Código Postal
 *   - Paso 2: Fecha de Nacimiento
 *   - Paso 3: Género
 *   - Paso 4: Uso de Tabaco
 *   - Paso 5: Fecha de Inicio de Cobertura
 *   - Paso 6: Frecuencia de Pago
 * 
 * Características:
 * - Pre-llenado automático si el usuario está autenticado
 * - Validación en cada paso
 * - Guardado de progreso en sessionStorage
 * - Redirección automática si ya tiene datos completos
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { getUserProfile } from "@/lib/api/enrollment-db"
import { saveExploreDataToSession } from "@/lib/utils/session-storage"
import { formatDateToLocal } from "./utils/dateHelpers" 

// Componentes
import {
  StepLayout,
  LoadingScreen,
  AccountQuestion,
  StepLookingFor,
  StepInsuranceType,
  StepCustomizeLifeCoverage,
  StepProgressOverview,
  StepAboutYourNeed,
  StepLetsGetToKnowYou,
  StepPersonalInformation,
  StepZipCode,
  StepDateOfBirth,
  StepGender,
  StepTobaccoUse,
  StepCoverageStartDate,
  StepPaymentFrequency,
} from "./components"

// Hook personalizado
import { useExploreForm } from "./hooks/useExploreForm"

// Constantes
import { TOTAL_STEPS, ROUTES, QUERY_PARAMS, LOG_PREFIXES } from "./constants"

export default function ExplorePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()

  // Estados de navegación
  const [step, setStep] = useState(1)
  const [hasAccount, setHasAccount] = useState<boolean | null>(null)
  const [registrationStep, setRegistrationStep] = useState(1)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  // Hook del formulario
  const {
    formData,
    validationStates,
    isValidating,
    isSubmitting,
    updateField,
    validateStep,
    isStepValid,
    submitForm,
    prefillFromProfile,
  } = useExploreForm(user)

  /**
   * Efecto: Detectar si debe saltar la pregunta de cuenta y si usuario ya está logueado
   */
  useEffect(() => {
    const skipAccountQuestion = searchParams.get(QUERY_PARAMS.SKIP_ACCOUNT_QUESTION)
    
    console.log(`${LOG_PREFIXES.DEBUG} Explore - useEffect ejecutado:`, { 
      user: user?.email, 
      skipAccountQuestion,
      loading: authLoading 
    })
    
    if (authLoading) {
      console.log(`${LOG_PREFIXES.LOADING} Auth está cargando, esperando...`)
      return
    }
    
    if (skipAccountQuestion === 'true' || user) {
      console.log(`${LOG_PREFIXES.SUCCESS} Usuario detectado o skip-account-question=true`)
      // Saltar pregunta de cuenta
      setHasAccount(false)
      setStep(2)
      
      // Si hay usuario, cargar su perfil
      if (user) {
        console.log(`${LOG_PREFIXES.DEBUG} Cargando perfil del usuario...`)
        loadUserProfile()
      } else {
        console.log(`${LOG_PREFIXES.INFO} No hay usuario, mostrando formulario vacío`)
        setIsLoadingProfile(false)
      }
    } else {
      console.log(`${LOG_PREFIXES.INFO} No hay usuario ni skip-account-question, mostrando pregunta inicial`)
      setIsLoadingProfile(false)
    }
  }, [user, searchParams, authLoading])

  /**
   * Cargar datos del perfil del usuario
   */
  const loadUserProfile = async () => {
    console.log(`${LOG_PREFIXES.DEBUG} loadUserProfile - Iniciando carga de perfil...`)
    setIsLoadingProfile(true)
    
    try {
      const profile = await getUserProfile()
      console.log(`${LOG_PREFIXES.DEBUG} loadUserProfile - Respuesta de getUserProfile:`, profile)
      
      if (!profile) {
        console.log(`${LOG_PREFIXES.WARNING} No se encontró perfil para el usuario`)
        setIsLoadingProfile(false)
        return
      }
      
      // Pre-llenar datos del formulario
      prefillFromProfile(profile)
      
      console.log(`${LOG_PREFIXES.SUCCESS} Profile data loaded completo`)

      // Si tiene TODOS los datos necesarios, redirigir directamente a insurance-options
      const hasAllRequiredData = 
        profile.zip_code && 
        profile.date_of_birth && 
        profile.gender && 
        (profile.is_smoker !== null && profile.is_smoker !== undefined) &&
        profile.coverage_start_date &&
        profile.payment_frequency

      console.log(`${LOG_PREFIXES.DEBUG} Verificación de datos completos:`, {
        hasZipCode: !!profile.zip_code,
        hasDateOfBirth: !!profile.date_of_birth,
        hasGender: !!profile.gender,
        hasSmokerInfo: (profile.is_smoker !== null && profile.is_smoker !== undefined),
        hasCoverageStartDate: !!profile.coverage_start_date,
        hasPaymentFrequency: !!profile.payment_frequency,
        hasAllRequiredData
      })

      if (hasAllRequiredData) {
        console.log(`${LOG_PREFIXES.SUCCESS} Usuario tiene todos los datos, redirigiendo a insurance-options...`)
        
        // Guardar datos en session storage para insurance-options
        saveExploreDataToSession({
          zip_code: profile.zip_code,
          date_of_birth: profile.date_of_birth,
          gender: profile.gender,
          is_smoker: profile.is_smoker,
          last_tobacco_use: profile.last_tobacco_use || ''
        })
        
        console.log(`${LOG_PREFIXES.SAVE} Datos guardados en sessionStorage`)
        console.log(`${LOG_PREFIXES.NAVIGATE} Redirigiendo a /insurance-options...`)
        router.push(ROUTES.INSURANCE_OPTIONS)
        return
      } else {
        console.log(`${LOG_PREFIXES.WARNING} Faltan datos, mostrando formulario para completar`)
      }
    } catch (error) {
      console.error(`${LOG_PREFIXES.ERROR} Error loading profile:`, error)
    } finally {
      setIsLoadingProfile(false)
    }
  }

  /**
   * Manejar elección de cuenta
   */
  const handleAccountChoice = (choice: boolean) => {
    if (choice === true) {
      // Redirigir a login
      router.push(`${ROUTES.LOGIN}?${QUERY_PARAMS.REDIRECT}=${ROUTES.EXPLORE}&${QUERY_PARAMS.ACTION}=after-login`)
    } else {
      // Continuar con explore
      setHasAccount(false)
      setStep(2)
    }
  }

  /**
   * Manejar retroceso a pregunta de cuenta
   */
  const handleBackToAccountQuestion = () => {
    setStep(1)
    setHasAccount(null)
    setRegistrationStep(1)
  }

  /**
   * Manejar avance al siguiente paso
   */
  const handleRegistrationNext = async () => {
    // Validar paso actual
    const isValid = await validateStep(registrationStep)
    
    if (!isValid) {
      return // No avanzar si la validación falla
    }

    // Si no es el último paso, avanzar
    if (registrationStep < TOTAL_STEPS) {
      setRegistrationStep(registrationStep + 1)
      return
    }

    // Si es el último paso, enviar formulario
    await submitForm()
  }

  /**
   * Manejar retroceso al paso anterior
   */
  const handleRegistrationBack = () => {
    if (registrationStep > 1) {
      setRegistrationStep(registrationStep - 1)
    } else {
      handleBackToAccountQuestion()
    }
  }

  /**
   * Renderizado condicional: Loading
   */
  if (authLoading || isLoadingProfile) {
    return (
      <LoadingScreen
        message={isLoadingProfile ? "Verificando tu información..." : "Loading..."}
        subtitle={isLoadingProfile ? "Un momento por favor" : ""}
      />
    )
  }

  /**
   * Renderizado condicional: Pregunta de cuenta (paso 1)
   */
  if (step === 1) {
    return (
      <StepLayout>
        <AccountQuestion onChoice={handleAccountChoice} />
      </StepLayout>
    )
  }

  /**
   * Calcular el total de pasos dinámicamente según el flujo
   */
  const getTotalSteps = () => {
    // Flujo "Me" + "Life" = 13 pasos (incluye customize life coverage + progress overview + about your need + lets get to know you + personal information)
    if (formData.lookingFor === 'me' && formData.insuranceType === 'life') {
      return 13
    }
    // Flujo "Me" (otros tipos) = 12 pasos (incluye progress overview + about your need + lets get to know you + personal information)
    if (formData.lookingFor === 'me') {
      return 12
    }
    // Otros flujos = 11 pasos (incluye progress overview + about your need + lets get to know you + personal information)
    return 11
  }

  /**
   * Determinar qué paso debe mostrarse según el flujo activo
   */
  const getActualStepNumber = (registrationStep: number): number => {
    const isFlowMe = formData.lookingFor === 'me'
    const isFlowMeLife = isFlowMe && formData.insuranceType === 'life'
    
    // Paso 1 es siempre Looking For
    if (registrationStep === 1) return 1
    
    // Paso 2 depende del flujo
    if (registrationStep === 2) {
      if (isFlowMe) return 2 // Insurance Type
      return 2 // ZIP Code
    }
    
    // Paso 3+ depende del flujo
    if (isFlowMeLife) {
      // Me + Life: tiene paso extra de customize
      return registrationStep
    } else if (isFlowMe) {
      // Me (otros): normal sin customize
      return registrationStep
    } else {
      // Otros: sin insurance type ni customize
      return registrationStep
    }
  }

  /**
   * Renderizado condicional: Formulario de registro
   */
  if (step === 2 && hasAccount === false) {
    const isFlowMe = formData.lookingFor === 'me'
    const isFlowMeLife = isFlowMe && formData.insuranceType === 'life'
    
    // Helpers para acceder a validationStates de forma segura (evita crash si undefined)
    const v = {
      lookingFor: { error: validationStates.lookingFor?.error ?? '', isValid: validationStates.lookingFor?.isValid ?? false },
      insuranceType: { error: validationStates.insuranceType?.error ?? '', isValid: validationStates.insuranceType?.isValid ?? false },
      aboutYourNeed: { error: validationStates.aboutYourNeed?.error ?? '', isValid: validationStates.aboutYourNeed?.isValid ?? false },
      personalInformation: { 
        errors: validationStates.personalInformation?.errors ?? {
          firstName: undefined,
          lastName: undefined,
          email: undefined,
          phone: undefined,
        }, 
        isValid: validationStates.personalInformation?.isValid ?? false 
      },
      zipCode: { error: validationStates.zipCode?.error ?? '', isValid: validationStates.zipCode?.isValid ?? null },
      dateOfBirth: { error: validationStates.dateOfBirth?.error ?? '', isValid: validationStates.dateOfBirth?.isValid ?? false },
      coverageStartDate: { error: validationStates.coverageStartDate?.error ?? '', isValid: validationStates.coverageStartDate?.isValid ?? false },
      lastTobaccoUse: { error: validationStates.lastTobaccoUse?.error ?? '', isValid: validationStates.lastTobaccoUse?.isValid ?? false },
    }
    
    return (  
      <StepLayout>
        {/* Paso 1: ¿A quién buscas proteger? */}
        {registrationStep === 1 && (
          <StepLookingFor
            value={formData.lookingFor}
            onChange={(value) => updateField('lookingFor', value)}
            error={v.lookingFor.error}
            isValid={v.lookingFor.isValid}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={1}
            totalSteps={getTotalSteps()}
          />
        )}

        {/* Paso 2: Insurance Type (solo para "Me") O ZIP Code (para otros) */}
        {registrationStep === 2 && isFlowMe && (
          <StepInsuranceType
            value={formData.insuranceType}
            onChange={(value) => updateField('insuranceType', value)}
            error={v.insuranceType.error}
            isValid={v.insuranceType.isValid}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={2}
            totalSteps={getTotalSteps()}
          />
        )}

        {registrationStep === 2 && !isFlowMe && (
          <StepZipCode
            value={formData.zipCode}
            onChange={(value) => updateField('zipCode', value)}
            error={v.zipCode.error}
            isValid={v.zipCode.isValid}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={2}
            totalSteps={getTotalSteps()}
          />
        )}

        {/* Paso 3: Customize Life Coverage (solo para "Me" + "Life") O Progress Overview (otros) */}
        {registrationStep === 3 && isFlowMeLife && (
          <StepCustomizeLifeCoverage
            coverageAmount={formData.coverageAmount}
            onCoverageAmountChange={(amount) => updateField('coverageAmount', amount)}
            noMedicalExams={formData.noMedicalExams}
            onNoMedicalExamsChange={(checked) => updateField('noMedicalExams', checked)}
            immediateActivation={formData.immediateActivation}
            onImmediateActivationChange={(checked) => updateField('immediateActivation', checked)}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={3}
            totalSteps={getTotalSteps()}
          />
        )}

        {registrationStep === 3 && isFlowMe && !isFlowMeLife && (
          <StepProgressOverview
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={3}
            totalSteps={getTotalSteps()}
          />
        )}

        {registrationStep === 3 && !isFlowMe && (
          <StepProgressOverview
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={3}
            totalSteps={getTotalSteps()}
          />
        )}

        {/* Paso 4: Progress Overview (Me+Life) O About Your Need (Me otros) O About Your Need (otros) */}
        {registrationStep === 4 && isFlowMeLife && (
          <StepProgressOverview
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={4}
            totalSteps={getTotalSteps()}
          />
        )}

        {registrationStep === 4 && isFlowMe && !isFlowMeLife && (
          <StepAboutYourNeed
            value={formData.aboutYourNeed}
            onChange={(value) => updateField('aboutYourNeed', value)}
            error={v.aboutYourNeed.error}
            isValid={v.aboutYourNeed.isValid}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={4}
            totalSteps={getTotalSteps()}
          />
        )}

        {registrationStep === 4 && !isFlowMe && (
          <StepAboutYourNeed
            value={formData.aboutYourNeed}
            onChange={(value) => updateField('aboutYourNeed', value)}
            error={v.aboutYourNeed.error}
            isValid={v.aboutYourNeed.isValid}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={4}
            totalSteps={getTotalSteps()}
          />
        )}

        {/* Paso 5: About Your Need (Me+Life) O Let's Get to Know You (Me otros) O Let's Get to Know You (otros) */}
        {registrationStep === 5 && isFlowMeLife && (
          <StepAboutYourNeed
            value={formData.aboutYourNeed}
            onChange={(value) => updateField('aboutYourNeed', value)}
            error={v.aboutYourNeed.error}
            isValid={v.aboutYourNeed.isValid}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={5}
            totalSteps={getTotalSteps()}
          />
        )}

        {registrationStep === 5 && isFlowMe && !isFlowMeLife && (
          <StepLetsGetToKnowYou
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={5}
            totalSteps={getTotalSteps()}
          />
        )}

        {registrationStep === 5 && !isFlowMe && (
          <StepLetsGetToKnowYou
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={5}
            totalSteps={getTotalSteps()}
          />
        )}

        {/* Paso 6: Let's Get to Know You (Me+Life) O Personal Information (Me otros) O Personal Information (otros) */}
        {registrationStep === 6 && isFlowMeLife && (
          <StepLetsGetToKnowYou
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={6}
            totalSteps={getTotalSteps()}
          />
        )}

        {registrationStep === 6 && isFlowMe && !isFlowMeLife && (
          <StepPersonalInformation
            firstName={formData.firstName}
            onFirstNameChange={(value) => updateField('firstName', value)}
            lastName={formData.lastName}
            onLastNameChange={(value) => updateField('lastName', value)}
            email={formData.email}
            onEmailChange={(value) => updateField('email', value)}
            phone={formData.phone}
            onPhoneChange={(value) => updateField('phone', value)}
            errors={v.personalInformation.errors}
            isValid={v.personalInformation.isValid}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={6}
            totalSteps={getTotalSteps()}
          />
        )}

        {registrationStep === 6 && !isFlowMe && (
          <StepPersonalInformation
            firstName={formData.firstName}
            onFirstNameChange={(value) => updateField('firstName', value)}
            lastName={formData.lastName}
            onLastNameChange={(value) => updateField('lastName', value)}
            email={formData.email}
            onEmailChange={(value) => updateField('email', value)}
            phone={formData.phone}
            onPhoneChange={(value) => updateField('phone', value)}
            errors={v.personalInformation.errors}
            isValid={v.personalInformation.isValid}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={6}
            totalSteps={getTotalSteps()}
          />
        )}

        {/* Paso 7: Personal Information (Me+Life) O ZIP Code (Me otros) O ZIP Code (otros) */}
        {registrationStep === 7 && isFlowMeLife && (
          <StepPersonalInformation
            firstName={formData.firstName}
            onFirstNameChange={(value) => updateField('firstName', value)}
            lastName={formData.lastName}
            onLastNameChange={(value) => updateField('lastName', value)}
            email={formData.email}
            onEmailChange={(value) => updateField('email', value)}
            phone={formData.phone}
            onPhoneChange={(value) => updateField('phone', value)}
            errors={v.personalInformation.errors}
            isValid={v.personalInformation.isValid}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={7}
            totalSteps={getTotalSteps()}
          />
        )}

        {registrationStep === 7 && isFlowMe && !isFlowMeLife && (
          <StepZipCode
            value={formData.zipCode}
            onChange={(value) => updateField('zipCode', value)}
            error={v.zipCode.error}
            isValid={v.zipCode.isValid}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={7}
            totalSteps={getTotalSteps()}
          />
        )}

        {registrationStep === 7 && !isFlowMe && (
          <StepZipCode
            value={formData.zipCode}
            onChange={(value) => updateField('zipCode', value)}
            error={v.zipCode.error}
            isValid={v.zipCode.isValid}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={7}
            totalSteps={getTotalSteps()}
          />
        )}

        {/* Paso 8: ZIP Code (Me+Life) O Date of Birth (Me otros) O Date of Birth (otros) */}
        {registrationStep === 8 && isFlowMeLife && (
          <StepZipCode
            value={formData.zipCode}
            onChange={(value) => updateField('zipCode', value)}
            error={v.zipCode.error}
            isValid={v.zipCode.isValid}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={8}
            totalSteps={getTotalSteps()}
          />
        )}

        {registrationStep === 8 && isFlowMe && !isFlowMeLife && (
          <StepDateOfBirth
            value={formData.dateOfBirth}
            onChange={(value) => updateField('dateOfBirth', value)}
            error={v.dateOfBirth.error}
            isValid={v.dateOfBirth.isValid}
            onDateSelect={(date) => {
              if (date) {
                updateField('dateOfBirth', formatDateToLocal(date))
              } else {
                updateField('dateOfBirth', '')}
            }}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={8}
            totalSteps={getTotalSteps()}
          />
        )}

        {registrationStep === 8 && !isFlowMe && (
          <StepDateOfBirth
            value={formData.dateOfBirth}
            onChange={(value) => updateField('dateOfBirth', value)}
            error={v.dateOfBirth.error}
            isValid={v.dateOfBirth.isValid}
            onDateSelect={(date) => {
              if (date) {
                updateField('dateOfBirth', formatDateToLocal(date))
              } else {
                updateField('dateOfBirth', '')
              }
            }}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={8}
            totalSteps={getTotalSteps()}
          />
        )}

        {/* Paso 8: ZIP Code (Me+Life) O Date of Birth (Me otros) O Date of Birth (otros) */}
        {registrationStep === 8 && isFlowMeLife && (
          <StepZipCode
            value={formData.zipCode}
            onChange={(value) => updateField('zipCode', value)}
            error={v.zipCode.error}
            isValid={v.zipCode.isValid}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={8}
            totalSteps={getTotalSteps()}
          />
        )}

        {registrationStep === 8 && isFlowMe && !isFlowMeLife && (
          <StepDateOfBirth
            value={formData.dateOfBirth}
            onChange={(value) => updateField('dateOfBirth', value)}
            error={v.dateOfBirth.error}
            isValid={v.dateOfBirth.isValid}
            onDateSelect={(date) => {
              if (date) {
                updateField('dateOfBirth', formatDateToLocal(date))
              } else {
                updateField('dateOfBirth', '')
              }
            }}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={8}
            totalSteps={getTotalSteps()}
          />
        )}

        {registrationStep === 8 && !isFlowMe && (
          <StepDateOfBirth
            value={formData.dateOfBirth}
            onChange={(value) => updateField('dateOfBirth', value)}
            error={v.dateOfBirth.error}
            isValid={v.dateOfBirth.isValid}
            onDateSelect={(date) => {
              if (date) {
                updateField('dateOfBirth', formatDateToLocal(date))
              } else {
                updateField('dateOfBirth', '')
              }
            }}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={8}
            totalSteps={getTotalSteps()}
          />
        )}

        {/* Paso 9: Date of Birth (Me+Life) O Gender (Me otros) O Gender (otros) */}
        {registrationStep === 9 && isFlowMeLife && (
          <StepDateOfBirth
            value={formData.dateOfBirth}
            onChange={(value) => updateField('dateOfBirth', value)}
            error={v.dateOfBirth.error}
            isValid={v.dateOfBirth.isValid}
            onDateSelect={(date) => {
              if (date) {
                updateField('dateOfBirth', formatDateToLocal(date))
              } else {
                updateField('dateOfBirth', '')
              }
            }}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={8}
            totalSteps={getTotalSteps()}
          />
        )}

        {registrationStep === 8 && isFlowMe && !isFlowMeLife && (
          <StepGender
            value={formData.gender}
            onChange={(value) => updateField('gender', value)}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={8}
            totalSteps={getTotalSteps()}
          />
        )}

        {registrationStep === 8 && !isFlowMe && (
          <StepGender
            value={formData.gender}
            onChange={(value) => updateField('gender', value)}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={8}
            totalSteps={getTotalSteps()}
          />
        )}

        {/* Paso 9: Gender (Me+Life) O Tobacco Use (Me otros) O Tobacco Use (otros) */}
        {registrationStep === 9 && isFlowMeLife && (
          <StepGender
            value={formData.gender}
            onChange={(value) => updateField('gender', value)}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={9}
            totalSteps={getTotalSteps()}
          />
        )}

        {registrationStep === 9 && isFlowMe && !isFlowMeLife && (
          <StepTobaccoUse
            smokes={formData.smokes}
            onSmokesChange={(smokes) => updateField('smokes', smokes)}
            lastTobaccoUse={formData.lastTobaccoUse}
            onLastTobaccoUseChange={(value) => updateField('lastTobaccoUse', value)}
            onDateSelect={(date) => {
              if (date) {
                updateField('lastTobaccoUse', formatDateToLocal(date))
              } else {
                updateField('lastTobaccoUse', '')
              }
            }}
            error={v.lastTobaccoUse.error}
            isValid={v.lastTobaccoUse.isValid}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={8}
            totalSteps={getTotalSteps()}
          />
        )}

        {registrationStep === 8 && !isFlowMe && (
          <StepTobaccoUse
            smokes={formData.smokes}
            onSmokesChange={(smokes) => updateField('smokes', smokes)}
            lastTobaccoUse={formData.lastTobaccoUse}
            onLastTobaccoUseChange={(value) => updateField('lastTobaccoUse', value)}
            onDateSelect={(date) => {
              if (date) {
                updateField('lastTobaccoUse', formatDateToLocal(date))
              } else {
                updateField('lastTobaccoUse', '')
              }
            }}
            error={v.lastTobaccoUse.error}
            isValid={v.lastTobaccoUse.isValid}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={7}
            totalSteps={getTotalSteps()}
          />
        )}

        {/* Paso 8: Tobacco Use (Me+Life) O Coverage Start Date (Me otros) O Coverage Start Date (otros) */}
        {registrationStep === 8 && isFlowMeLife && (
          <StepTobaccoUse
            smokes={formData.smokes}
            onSmokesChange={(smokes) => updateField('smokes', smokes)}
            lastTobaccoUse={formData.lastTobaccoUse}
            onLastTobaccoUseChange={(value) => updateField('lastTobaccoUse', value)}
            onDateSelect={(date) => {
              if (date) {
                updateField('lastTobaccoUse', formatDateToLocal(date))
              } else {
                updateField('lastTobaccoUse', '')
              }
            }}
            error={v.lastTobaccoUse.error}
            isValid={v.lastTobaccoUse.isValid}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={8}
            totalSteps={getTotalSteps()}
          />
        )}

        {registrationStep === 8 && isFlowMe && !isFlowMeLife && (
          <StepCoverageStartDate
            value={formData.coverageStartDate}
            onChange={(value) => updateField('coverageStartDate', value)}
            onDateSelect={(date) => {
              if (date) {
                updateField('coverageStartDate', formatDateToLocal(date))
              } else {
                updateField('coverageStartDate', '')
              }
            }}
            error={v.coverageStartDate.error}
            isValid={v.coverageStartDate.isValid}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={9}
            totalSteps={getTotalSteps()}
          />
        )}

        {registrationStep === 9 && !isFlowMe && (
          <StepCoverageStartDate
            value={formData.coverageStartDate}
            onChange={(value) => updateField('coverageStartDate', value)}
            onDateSelect={(date) => {
              if (date) {
                updateField('coverageStartDate', formatDateToLocal(date))
              } else {
                updateField('coverageStartDate', '')
              }
            }}
            error={v.coverageStartDate.error}
            isValid={v.coverageStartDate.isValid}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={8}
            totalSteps={getTotalSteps()}
          />
        )}

        {/* Paso 10: Tobacco Use (Me+Life) O Coverage Start Date (Me otros) O Coverage Start Date (otros) */}
        {registrationStep === 10 && isFlowMeLife && (
          <StepTobaccoUse
            smokes={formData.smokes}
            onSmokesChange={(smokes) => updateField('smokes', smokes)}
            lastTobaccoUse={formData.lastTobaccoUse}
            onLastTobaccoUseChange={(value) => updateField('lastTobaccoUse', value)}
            onDateSelect={(date) => {
              if (date) {
                updateField('lastTobaccoUse', formatDateToLocal(date))
              } else {
                updateField('lastTobaccoUse', '')
              }
            }}
            error={v.lastTobaccoUse.error}
            isValid={v.lastTobaccoUse.isValid}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={11}
            totalSteps={getTotalSteps()}
          />
        )}

        {registrationStep === 11 && isFlowMe && !isFlowMeLife && (
          <StepCoverageStartDate
            value={formData.coverageStartDate}
            onChange={(value) => updateField('coverageStartDate', value)}
            onDateSelect={(date) => {
              if (date) {
                updateField('coverageStartDate', formatDateToLocal(date))
              } else {
                updateField('coverageStartDate', '')
              }
            }}
            error={v.coverageStartDate.error}
            isValid={v.coverageStartDate.isValid}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={11}
            totalSteps={getTotalSteps()}
          />
        )}

        {registrationStep === 11 && !isFlowMe && (
          <StepCoverageStartDate
            value={formData.coverageStartDate}
            onChange={(value) => updateField('coverageStartDate', value)}
            onDateSelect={(date) => {
              if (date) {
                updateField('coverageStartDate', formatDateToLocal(date))
              } else {
                updateField('coverageStartDate', '')
              }
            }}
            error={v.coverageStartDate.error}
            isValid={v.coverageStartDate.isValid}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={11}
            totalSteps={getTotalSteps()}
          />
        )}

        {/* Paso 12: Coverage Start Date (Me+Life) O Payment Frequency (Me otros) O Payment Frequency (otros) */}
        {registrationStep === 12 && isFlowMeLife && (
          <StepCoverageStartDate
            value={formData.coverageStartDate}
            onChange={(value) => updateField('coverageStartDate', value)}
            onDateSelect={(date) => {
              if (date) {
                updateField('coverageStartDate', formatDateToLocal(date))
              } else {
                updateField('coverageStartDate', '')
              }
            }}
            error={v.coverageStartDate.error}
            isValid={v.coverageStartDate.isValid}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={12}
            totalSteps={getTotalSteps()}
          />
        )}

        {registrationStep === 12 && isFlowMe && !isFlowMeLife && (
          <StepPaymentFrequency
            value={formData.paymentFrequency}
            onChange={(value) => updateField('paymentFrequency', value)}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={12}
            totalSteps={getTotalSteps()}
          />
        )}

        {registrationStep === 12 && !isFlowMe && (
          <StepPaymentFrequency
            value={formData.paymentFrequency}
            onChange={(value) => updateField('paymentFrequency', value)}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={12}
            totalSteps={getTotalSteps()}
          />
        )}

        {/* Paso 13: Payment Frequency (solo para "Me + Life") */}
        {registrationStep === 13 && isFlowMeLife && (
          <StepPaymentFrequency
            value={formData.paymentFrequency}
            onChange={(value) => updateField('paymentFrequency', value)}
            onNext={handleRegistrationNext}
            onBack={handleRegistrationBack}
            isValidating={isValidating}
            isSubmitting={isSubmitting}
            currentStep={13}
            totalSteps={getTotalSteps()}
          />
        )}
      </StepLayout>
    )
  }

  // Fallback (no debería llegar aquí normalmente)
  return null
}
