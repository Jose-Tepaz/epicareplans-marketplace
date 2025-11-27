"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { toast } from "sonner"
import { DynamicQuestionsForm } from "@/components/dynamic-questions-form"
import { DebugApplicationBundle } from "@/components/debug-application-bundle"
import { DebugCartPlans } from "@/components/debug-cart-plans"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, CheckCircle, User, Users } from "lucide-react"
import type { EnrollmentFormState, Applicant } from "@/lib/types/enrollment"
import type { 
  EligibilityQuestion, 
  DynamicQuestionResponse, 
  QuestionValidation,
  DynamicFormState 
} from "@/lib/types/application-bundle"

// Interfaz para representar un aplicante con sus datos básicos
interface ApplicantInfo {
  id: string
  name: string
  relationship: string
  isPrimary: boolean
  index: number // -1 para primary, 0+ para additional
}

interface Step1DynamicQuestionsProps {
  formData: EnrollmentFormState
  updateFormData: (field: keyof EnrollmentFormState, value: any) => void
  onValidationChange?: (isValid: boolean, errors: string[]) => void
}

export function Step1DynamicQuestions({ formData, updateFormData, onValidationChange }: Step1DynamicQuestionsProps) {
  const [dynamicQuestions, setDynamicQuestions] = useState<EligibilityQuestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [validation, setValidation] = useState<QuestionValidation>({
    isValid: true,
    errors: [],
    knockoutAnswers: []
  })
  const [isFormValidForNext, setIsFormValidForNext] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [dateError, setDateError] = useState<string | null>(null)
  const [showDateFix, setShowDateFix] = useState(false)
  const [newEffectiveDate, setNewEffectiveDate] = useState<string>('')
  const [activeApplicantTab, setActiveApplicantTab] = useState<string>('primary')
  
  // Estado para rastrear la validación de cada aplicante
  const [applicantValidations, setApplicantValidations] = useState<Record<string, { isValid: boolean; errors: string[] }>>({})

  // Construir la lista de todos los aplicantes - memoizado para evitar re-renders infinitos
  const allApplicants: ApplicantInfo[] = useMemo(() => [
    {
      id: 'primary',
      name: `${formData.firstName || 'Primary'} ${formData.lastName || 'Applicant'}`.trim(),
      relationship: 'Primary',
      isPrimary: true,
      index: -1
    },
    ...(formData.additionalApplicants || []).map((app, index) => ({
      id: `additional-${index}`,
      name: `${app.firstName || 'Additional'} ${app.lastName || 'Applicant'}`.trim(),
      relationship: app.relationship || 'Dependent',
      isPrimary: false,
      index
    }))
  ], [formData.firstName, formData.lastName, formData.additionalApplicants])

  // Obtener las respuestas de un aplicante específico
  const getApplicantResponses = (applicantId: string): DynamicQuestionResponse[] => {
    if (applicantId === 'primary') {
      return formData.questionResponses || []
    }
    const index = parseInt(applicantId.replace('additional-', ''))
    return formData.additionalApplicants?.[index]?.questionResponses || []
  }

  // NOTA: Las respuestas de cada aplicante se actualizan directamente en applicantResponsesHandlers

  // Cargar preguntas dinámicas cuando el componente se monta, asegurando effectiveDate válido
  useEffect(() => {
    if (!hasLoaded && formData.selectedPlans.length > 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      let eff = formData.effectiveDate
      const fromStorageRaw = typeof window !== 'undefined' ? (sessionStorage.getItem('enrollmentFormData') || localStorage.getItem('enrollmentFormData')) : null
      if (!eff && fromStorageRaw) {
        try {
          const stored = JSON.parse(fromStorageRaw)
          if (stored?.effectiveDate) eff = stored.effectiveDate
        } catch {}
      }

      const isInvalid = !eff || (new Date(eff).setHours(0,0,0,0) < today.getTime())
      if (isInvalid) {
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const tomorrowStr = tomorrow.toISOString().split('T')[0]
        // Pre-normalizar antes de llamar API para evitar parpadeo de error
        updateFormData('effectiveDate', tomorrowStr)
        setNewEffectiveDate(tomorrowStr)
        loadDynamicQuestions(tomorrowStr)
      } else {
        loadDynamicQuestions(eff)
      }
    }
  }, [formData.selectedPlans, hasLoaded])

  // Inicializar nueva fecha cuando se muestra el error
  useEffect(() => {
    if (showDateFix && !newEffectiveDate) {
      // Calcular fecha mínima (mañana)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]
      setNewEffectiveDate(tomorrowStr)
    }
  }, [showDateFix, newEffectiveDate])

  const loadDynamicQuestions = async (effectiveDateOverride?: string) => {
    setIsLoading(true)
    
    try {
      // Obtener el estado real del ZIP code del usuario
      let state = formData.state || "CA"; // Estado por defecto
      
      // Si el usuario tiene ZIP code, obtener el estado real
      if (formData.zipCode && formData.zipCode.length === 5) {
        try {
          console.log('Obteniendo estado real para ZIP code:', formData.zipCode);
          const response = await fetch(`/api/address/validate-zip/${formData.zipCode}`);
          const result = await response.json();
          
          if (result.success && result.data?.state) {
            state = result.data.state;
            console.log('Estado real obtenido:', state);
          } else {
            console.log('No se pudo obtener estado real, usando por defecto:', state);
          }
        } catch (error) {
          console.error('Error obteniendo estado real:', error);
          console.log('Usando estado por defecto:', state);
        }
      }
      
      const requestData = {
        selectedPlans: formData.selectedPlans,
        state: state,
        effectiveDate: effectiveDateOverride || formData.effectiveDate || "2025-10-17", // Usar override o fecha del formulario si está disponible
        dateOfBirth: formData.dateOfBirth || "2002-10-03", // Usar fecha de nacimiento del formulario si está disponible
        paymentFrequency: formData.paymentFrequency || "Monthly", // Usar frecuencia de pago del formulario
        memberCount: 1 + (formData.additionalApplicants?.length || 0), // Usuario principal + adicionales
        isSmoker: formData.smoker || false, // Usar información del fumador del formulario
        hasHealthConditions: formData.questionResponses?.some(r => r.response === 'Yes') || false, // Detectar condiciones de salud
        weight: Number(formData.weight) || undefined, // Peso del usuario
        heightFeet: Number(formData.heightFeet) || undefined, // Altura en pies
        heightInches: Number(formData.heightInches) || undefined, // Altura en pulgadas
        hasPriorCoverage: formData.hasPriorCoverage || false, // Cobertura previa
        hasMedicare: formData.hasMedicare || false // Medicare
      };

      console.log('Enviando request a ApplicationBundle:', requestData);
      console.log('FormData completo:', formData);
      console.log('Estado del usuario:', formData.state);
      console.log('Estado que se enviará:', state);
      console.log('Análisis de planes seleccionados:', formData.selectedPlans.map(plan => ({
        id: plan.id,
        name: plan.name,
        productCode: plan.productCode,
        planKey: plan.planKey,
        hasProductCode: !!plan.productCode,
        hasPlanKey: !!plan.planKey
      })));

      const response = await fetch('/api/application-bundle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('ApplicationBundle API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        
        // Detectar error específico de fecha
        const errorMessage = errorData.message || errorData.error || ''
        console.log('🔍 Checking error message:', errorMessage)
        console.log('🔍 Error data structure:', errorData)
        console.log('🔍 Full error data:', JSON.stringify(errorData, null, 2))
        
        // El error puede venir como string, array, o en diferentes propiedades
        let isDateError = false
        let finalErrorMessage = ''
        
        // Función helper para verificar si un texto contiene error de fecha
        const checkDateError = (text) => {
          if (typeof text !== 'string') return false
          return text.includes('Effective date must be today or later') || 
                 text.includes('fecha') ||
                 text.includes('Effective date') ||
                 text.includes('today or later')
        }
        
        // Verificar si es string
        if (typeof errorMessage === 'string') {
          isDateError = checkDateError(errorMessage)
          finalErrorMessage = errorMessage
        } 
        // Verificar si es array
        else if (Array.isArray(errorMessage)) {
          isDateError = errorMessage.some(checkDateError)
          finalErrorMessage = errorMessage.join(', ')
        }
        
        // Si no se encontró, buscar en todas las propiedades del objeto
        if (!isDateError) {
          console.log('🔍 Searching in all error properties...')
          for (const [key, value] of Object.entries(errorData)) {
            console.log(`🔍 Checking property ${key}:`, value)
            
            if (typeof value === 'string' && checkDateError(value)) {
              isDateError = true
              finalErrorMessage = value
              console.log(`✅ Found date error in property ${key}:`, value)
              break
            } else if (Array.isArray(value)) {
              const foundError = value.find(checkDateError)
              if (foundError) {
                isDateError = true
                finalErrorMessage = foundError
                console.log(`✅ Found date error in array property ${key}:`, foundError)
                break
              }
            }
          }
        }
        
        if (isDateError) {
          console.log('✅ Date error detected, showing fix UI')
          console.log('✅ Final error message:', finalErrorMessage)
          setDateError(finalErrorMessage)
          setShowDateFix(true)
          throw new Error('DATE_ERROR')
        }
        
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success && result.data?.dynamicFormState) {
        const dynamicFormState: DynamicFormState = result.data.dynamicFormState
        setDynamicQuestions(dynamicFormState.questions || [])
        // ocultar cualquier UI de error de fecha si cargó correctamente
        setDateError(null)
        setShowDateFix(false)
        
        // Actualizar las respuestas existentes en el formData
        if (formData.questionResponses.length > 0) {
          // Las respuestas ya están en el formData, no necesitamos hacer nada
        }
        
        setHasLoaded(true)
        
        const questionsCount = dynamicFormState.questions?.length || 0
        if (questionsCount > 0) {
          toast.success('Preguntas de elegibilidad cargadas', {
            description: `${questionsCount} preguntas encontradas`
          })
        } else {
          toast.info('No se encontraron preguntas específicas', {
            description: 'Los planes seleccionados no requieren preguntas adicionales'
          })
        }
      } else {
        // Log detallado para debugging
        console.log('ApplicationBundle Response:', result)
        console.log('FormData selectedPlans:', formData.selectedPlans)
        console.log('FormData state:', formData.state)
        console.log('FormData effectiveDate:', formData.effectiveDate)
        console.log('EffectiveDate override being sent:', effectiveDateOverride)
        
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error loading dynamic questions:', error)
      
      // Si es un error de fecha, no mostrar toast genérico
      if (error instanceof Error && error.message === 'DATE_ERROR') {
        console.log('✅ DATE_ERROR caught, showing date fix UI')
        // El mensaje ya se está mostrando en la UI
        setHasLoaded(false) // Permitir reintentar
      } else {
        console.log('❌ Generic error, showing toast')
        toast.error('Error al cargar preguntas', {
          description: error instanceof Error ? error.message : 'Error desconocido'
        })
        // Continuar sin preguntas dinámicas
        setHasLoaded(true)
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleFixDate = () => {
    if (!newEffectiveDate) {
      toast.error('Por favor selecciona una fecha válida')
      return
    }
    
    // Validar que la fecha sea futura
    const selectedDate = new Date(newEffectiveDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) {
      toast.error('La fecha debe ser hoy o en el futuro')
      return
    }
    
    // Actualizar la fecha efectiva en el form y recargar inmediatamente usando override
    updateFormData('effectiveDate', newEffectiveDate)
    // Persistir en storage para que se mantenga al navegar fuera y volver
    try {
      const saved = sessionStorage.getItem('enrollmentFormData')
      const merged = saved ? { ...JSON.parse(saved), effectiveDate: newEffectiveDate } : { effectiveDate: newEffectiveDate }
      sessionStorage.setItem('enrollmentFormData', JSON.stringify(merged))
      // opcional: persistir también en localStorage
      localStorage.setItem('enrollmentFormData', JSON.stringify(merged))
      console.log('✅ effectiveDate persisted to storage:', newEffectiveDate)
    } catch (e) {
      console.warn('No se pudo persistir effectiveDate en storage', e)
    }
    setDateError(null)
    setShowDateFix(false)
    setHasLoaded(false)
    toast.success('Fecha actualizada correctamente')
    // Recargar preguntas usando la fecha seleccionada para evitar leer estado stale
    loadDynamicQuestions(newEffectiveDate)
  }

  const isUpdating = useRef(false)
  
  // Ref para almacenar el formData actual (para evitar closures stale en handlers)
  const formDataRef = useRef(formData)
  useEffect(() => {
    formDataRef.current = formData
  }, [formData])
  
  // Crear handlers memoizados para cada aplicante
  // Usamos useRef + useMemo para evitar recrear handlers en cada render
  const applicantResponsesHandlers = useMemo(() => {
    const handlers: Record<string, (responses: DynamicQuestionResponse[], newValidation: QuestionValidation) => void> = {}
    
    allApplicants.forEach(applicant => {
      handlers[applicant.id] = (responses: DynamicQuestionResponse[], newValidation: QuestionValidation) => {
        if (isUpdating.current) return
        
        isUpdating.current = true
        
        // Actualizar respuestas del aplicante específico
        if (applicant.id === 'primary') {
          updateFormData('questionResponses', responses)
        } else {
          const index = parseInt(applicant.id.replace('additional-', ''))
          // Usar el ref para obtener el estado actual de additionalApplicants
          const currentAdditionalApplicants = [...(formDataRef.current.additionalApplicants || [])]
          if (currentAdditionalApplicants[index]) {
            currentAdditionalApplicants[index] = {
              ...currentAdditionalApplicants[index],
              questionResponses: responses
            }
            updateFormData('additionalApplicants', currentAdditionalApplicants)
          }
        }
        
        // Actualizar validación de este aplicante
        setApplicantValidations(prev => ({
          ...prev,
          [applicant.id]: { isValid: newValidation.isValid, errors: newValidation.errors }
        }))
        
        // Reset flag after a short delay
        setTimeout(() => {
          isUpdating.current = false
        }, 0)
      }
    })
    
    return handlers
  }, [allApplicants, updateFormData])
  
  // Crear handlers memoizados para onValidateForNext de cada aplicante
  const applicantValidateHandlers = useMemo(() => {
    const handlers: Record<string, (isValid: boolean, errors: string[]) => void> = {}
    
    allApplicants.forEach(applicant => {
      handlers[applicant.id] = (isValid: boolean, errors: string[]) => {
        console.log(`📝 Validación actualizada para ${applicant.name}:`, { isValid, errors })
        setApplicantValidations(prev => {
          // Solo actualizar si realmente cambió
          const current = prev[applicant.id]
          if (current?.isValid === isValid && 
              current?.errors?.length === errors.length && 
              current?.errors?.every((e, i) => e === errors[i])) {
            console.log(`⏭️ Validación sin cambios para ${applicant.name}, skip update`)
            return prev // No cambió, retornar el mismo objeto
          }
          console.log(`🔄 Actualizando validación para ${applicant.name}`)
          return {
            ...prev,
            [applicant.id]: { isValid, errors }
          }
        })
      }
    })
    
    return handlers
  }, [allApplicants])
  
  // Ref para rastrear los aplicantes que ya tienen validación inicializada
  const initializedApplicants = useRef<Set<string>>(new Set())
  
  // Inicializar validaciones cuando se cargan las preguntas o cuando se agregan nuevos aplicantes
  useEffect(() => {
    if (hasLoaded && dynamicQuestions && dynamicQuestions.length > 0) {
      const needsInitialization = allApplicants.filter(
        applicant => !initializedApplicants.current.has(applicant.id)
      )
      
      if (needsInitialization.length > 0) {
        console.log('🔧 Inicializando validaciones para aplicantes:', needsInitialization.map(a => a.name))
        
        const newValidations: Record<string, { isValid: boolean; errors: string[] }> = {}
        
        needsInitialization.forEach(applicant => {
          const responses = getApplicantResponses(applicant.id)
          const hasAllResponses = responses.length >= dynamicQuestions.length
          
          newValidations[applicant.id] = {
            isValid: hasAllResponses,
            errors: hasAllResponses ? [] : [`${applicant.name} tiene preguntas sin responder`]
          }
          
          // Marcar como inicializado
          initializedApplicants.current.add(applicant.id)
        })
        
        // Merge con validaciones existentes
        setApplicantValidations(prev => ({
          ...prev,
          ...newValidations
        }))
      }
    }
  }, [hasLoaded, dynamicQuestions, allApplicants, getApplicantResponses])
  
  // Ref para evitar notificaciones redundantes al padre
  const lastValidationNotification = useRef<{ isValid: boolean; errorsKey: string } | null>(null)
  
  // Verificar si todos los aplicantes tienen respuestas válidas
  useEffect(() => {
    // Si no hay preguntas dinámicas después de cargar, considerar como válido
    if (hasLoaded && (!dynamicQuestions || dynamicQuestions.length === 0)) {
      const shouldNotify = !lastValidationNotification.current || 
        lastValidationNotification.current.isValid !== true ||
        lastValidationNotification.current.errorsKey !== ''
      
      if (shouldNotify) {
        console.log('✅ [Step1] No hay preguntas dinámicas, reportando como válido')
        lastValidationNotification.current = { isValid: true, errorsKey: '' }
        setIsFormValidForNext(true)
        setValidationErrors([])
        onValidationChange?.(true, [])
      }
      return
    }
    
    // Si hay preguntas pero aún no se han cargado, reportar como INVÁLIDO
    if (!hasLoaded) {
      const shouldNotify = !lastValidationNotification.current || 
        lastValidationNotification.current.isValid !== false
      
      if (shouldNotify) {
        console.log('⏳ [Step1] Preguntas aún no cargadas, reportando como INVÁLIDO')
        lastValidationNotification.current = { isValid: false, errorsKey: 'loading' }
        setIsFormValidForNext(false)
        setValidationErrors(['Cargando preguntas...'])
        onValidationChange?.(false, ['Cargando preguntas...'])
      }
      return
    }
    
    // Si no hay preguntas dinámicas (después de cargar), salir
    if (!dynamicQuestions || dynamicQuestions.length === 0) {
      return
    }
    
    // Verificar validación de cada aplicante en detalle
    const validationDetails = allApplicants.map(applicant => {
      const validation = applicantValidations[applicant.id]
      return {
        id: applicant.id,
        name: applicant.name,
        hasValidation: !!validation,
        isValid: validation?.isValid ?? false,
        errors: validation?.errors || []
      }
    })
    
    // IMPORTANTE: Si algún aplicante no tiene validación inicializada, no se puede considerar válido
    const allApplicantsHaveValidation = validationDetails.every(detail => detail.hasValidation)
    const allValid = allApplicantsHaveValidation && validationDetails.every(detail => detail.isValid)
    const allErrors = validationDetails.flatMap(detail => detail.errors)
    
    // Si faltan validaciones por inicializar, agregar error
    if (!allApplicantsHaveValidation) {
      allErrors.push('Algunas preguntas aún se están cargando...')
    }
    
    const errorsKey = allErrors.join('|')
    
    console.log('🔍 [Step1] Validación de todos los aplicantes:', {
      totalApplicants: allApplicants.length,
      validationDetails,
      allApplicantsHaveValidation,
      allValid,
      allErrors
    })
    
    // Solo actualizar si algo cambió
    const shouldNotify = !lastValidationNotification.current || 
      lastValidationNotification.current.isValid !== allValid ||
      lastValidationNotification.current.errorsKey !== errorsKey
    
    if (shouldNotify) {
      console.log('📢 Notificando validación al padre:', { allValid, allErrors })
      lastValidationNotification.current = { isValid: allValid, errorsKey }
      setIsFormValidForNext(allValid)
      setValidationErrors(allErrors)
      onValidationChange?.(allValid, allErrors)
    }
  }, [applicantValidations, allApplicants, hasLoaded, dynamicQuestions, onValidationChange])
  
  // Handler para detectar respuestas knockout
  const handleKnockoutDetected = useCallback((hasKnockout: boolean, errors: string[]) => {
    if (hasKnockout) {
      toast.error('Respuesta descalificante detectada', {
        description: 'Una de sus respuestas puede descalificarlo para este plan',
        duration: 6000
      })
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-lg font-medium">Cargando preguntas de elegibilidad...</p>
          <p className="text-sm text-gray-600">
            Esto puede tomar unos momentos mientras verificamos sus planes seleccionados
          </p>
        </div>
      </div>
    )
  }

  // Mostrar error de fecha solamente durante el estado de reintento (antes de cargar)
  if (showDateFix && dateError && !hasLoaded) {
    console.log('🎯 Rendering date fix UI:', { showDateFix, dateError })
    const today = new Date().toISOString().split('T')[0]
    
    return (
      <div className="space-y-6">
        <Alert className="border-red-400 bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertDescription>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-red-900 text-lg mb-2">
                  Error con la Fecha de Cobertura
                </h3>
                <p className="text-red-800 mb-3">
                  {dateError}
                </p>
                <p className="text-red-700 text-sm">
                  La fecha de inicio de cobertura que seleccionaste ({formData.effectiveDate}) 
                  es anterior a la fecha actual. Por favor, selecciona una fecha futura.
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="newEffectiveDate" className="text-sm font-medium text-gray-700">
                    Selecciona una nueva fecha de inicio de cobertura:
                  </Label>
                  <Input
                    id="newEffectiveDate"
                    type="date"
                    value={newEffectiveDate}
                    onChange={(e) => setNewEffectiveDate(e.target.value)}
                    min={today}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Fecha actual: <strong>{formData.effectiveDate}</strong> | 
                    Fecha mínima: <strong>{today}</strong>
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={handleFixDate}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={!newEffectiveDate}
                  >
                    Actualizar Fecha
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowDateFix(false)
                      setDateError(null)
                    }}
                    className="border-red-400 text-red-700 hover:bg-red-50"
                  >
                    Volver Atrás
                  </Button>
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> La cobertura de seguro solo puede comenzar en una fecha 
                  futura o actual. Fecha mínima permitida: <strong>{today}</strong>
                </p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!hasLoaded || !dynamicQuestions || dynamicQuestions.length === 0) {
    return (
      <div className="space-y-6">
        <Alert className="border-blue-200 bg-blue-50">
          <CheckCircle className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700">
            No se encontraron preguntas de elegibilidad específicas para los planes seleccionados.
            Puede continuar con el proceso de inscripción.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Los planes seleccionados no requieren preguntas de elegibilidad adicionales.
              Su información ya recopilada en los pasos anteriores es suficiente para proceder.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Obtener el estado de validación de un aplicante
  const getApplicantValidationStatus = (applicantId: string): 'complete' | 'incomplete' | 'pending' => {
    const responses = getApplicantResponses(applicantId)
    const validation = applicantValidations[applicantId]
    
    if (!validation) return 'pending'
    if (validation.isValid && responses.length >= dynamicQuestions.filter(q => !q.condition).length) return 'complete'
    return 'incomplete'
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Preguntas de Elegibilidad</h2>
          <p className="mt-2 text-gray-600">
            {allApplicants.length > 1 
              ? `Por favor responda las preguntas de elegibilidad para cada uno de los ${allApplicants.length} aplicantes.`
              : 'Primero necesitamos hacer algunas preguntas para determinar tu elegibilidad para los planes seleccionados.'
            }
          </p>
        </div>
      </div>

      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertDescription className="text-yellow-700">
          <strong>Importante:</strong> Por favor responda todas las preguntas de elegibilidad con precisión para cada aplicante.
          La información incorrecta puede resultar en la denegación de reclamos o la cancelación de la póliza.
        </AlertDescription>
      </Alert>

      {/* Mostrar resumen de aplicantes si hay más de uno */}
      {allApplicants.length > 1 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Aplicantes ({allApplicants.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allApplicants.map(applicant => {
                const status = getApplicantValidationStatus(applicant.id)
                return (
                  <Badge 
                    key={applicant.id}
                    variant={status === 'complete' ? 'default' : status === 'incomplete' ? 'destructive' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() => setActiveApplicantTab(applicant.id)}
                  >
                    {applicant.isPrimary ? <User className="h-3 w-3 mr-1" /> : null}
                    {applicant.name} ({applicant.relationship})
                    {status === 'complete' && <CheckCircle className="h-3 w-3 ml-1" />}
                    {status === 'incomplete' && <AlertTriangle className="h-3 w-3 ml-1" />}
                  </Badge>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs para cada aplicante */}
      <Tabs 
        value={activeApplicantTab} 
        onValueChange={(newTab) => {
          console.log('🔄 [Tab Change]', { from: activeApplicantTab, to: newTab })
          console.log('📊 [Tab Change] Validaciones actuales:', applicantValidations)
          setActiveApplicantTab(newTab)
        }} 
        className="w-full"
      >
        <TabsList className={`grid w-full ${allApplicants.length === 1 ? 'grid-cols-1' : allApplicants.length === 2 ? 'grid-cols-2' : allApplicants.length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
          {allApplicants.map(applicant => {
            const status = getApplicantValidationStatus(applicant.id)
            return (
              <TabsTrigger 
                key={applicant.id} 
                value={applicant.id}
                className="flex items-center gap-2"
              >
                {applicant.isPrimary ? <User className="h-4 w-4" /> : null}
                <span className="truncate">{applicant.name}</span>
                {status === 'complete' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {status === 'incomplete' && <AlertTriangle className="h-4 w-4 text-orange-500" />}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {allApplicants.map(applicant => (
          <TabsContent key={applicant.id} value={applicant.id} className="mt-6">
            <Card className="border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {applicant.isPrimary ? <User className="h-5 w-5 text-blue-600" /> : <Users className="h-5 w-5 text-green-600" />}
                  Preguntas para {applicant.name}
                  <Badge variant="outline" className="ml-2">
                    {applicant.relationship}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DynamicQuestionsForm
                  key={applicant.id}
                  questions={dynamicQuestions}
                  initialResponses={getApplicantResponses(applicant.id)}
                  onResponsesChange={applicantResponsesHandlers[applicant.id]}
                  onKnockoutDetected={handleKnockoutDetected}
                  onValidateForNext={applicantValidateHandlers[applicant.id]}
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Mostrar advertencia si hay respuestas knockout */}
      {validation.knockoutAnswers && validation.knockoutAnswers.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            <strong>Atención:</strong> Una o más de sus respuestas pueden descalificarlo para los planes seleccionados.
            Por favor, revise sus respuestas o considere seleccionar planes alternativos.
          </AlertDescription>
        </Alert>
      )}

      {/* Indicador de validación completa */}
      {isFormValidForNext && validationErrors.length === 0 && allApplicants.every(a => getApplicantValidationStatus(a.id) === 'complete') && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">
            <strong>¡Excelente!</strong> Todas las preguntas han sido respondidas para todos los aplicantes. Puede continuar al siguiente paso.
          </AlertDescription>
        </Alert>
      )}

      {/* Indicador de aplicantes pendientes */}
      {allApplicants.length > 1 && allApplicants.some(a => getApplicantValidationStatus(a.id) !== 'complete') && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-orange-700">
            <strong>Pendiente:</strong> Los siguientes aplicantes aún tienen preguntas sin responder:
            <ul className="mt-2 list-disc list-inside">
              {allApplicants
                .filter(a => getApplicantValidationStatus(a.id) !== 'complete')
                .map(a => (
                  <li key={a.id} className="cursor-pointer hover:underline" onClick={() => setActiveApplicantTab(a.id)}>
                    {a.name} ({a.relationship})
                  </li>
                ))
              }
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
