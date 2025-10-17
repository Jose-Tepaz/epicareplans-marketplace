"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import { DynamicQuestionsForm } from "@/components/dynamic-questions-form"
import { DebugApplicationBundle } from "@/components/debug-application-bundle"
import { DebugCartPlans } from "@/components/debug-cart-plans"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react"
import type { EnrollmentFormState } from "@/lib/types/enrollment"
import type { 
  EligibilityQuestion, 
  DynamicQuestionResponse, 
  QuestionValidation,
  DynamicFormState 
} from "@/lib/types/application-bundle"

interface Step7DynamicQuestionsProps {
  formData: EnrollmentFormState
  updateFormData: (field: keyof EnrollmentFormState, value: any) => void
  onValidationChange?: (isValid: boolean, errors: string[]) => void
}

export function Step7DynamicQuestions({ formData, updateFormData, onValidationChange }: Step7DynamicQuestionsProps) {
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

  // Cargar preguntas dinámicas cuando el componente se monta
  useEffect(() => {
    if (!hasLoaded && formData.selectedPlans.length > 0) {
      loadDynamicQuestions()
    }
  }, [formData.selectedPlans, hasLoaded])

  const loadDynamicQuestions = async () => {
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
        effectiveDate: formData.effectiveDate || "2025-10-17", // Usar fecha del formulario si está disponible
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
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success && result.data?.dynamicFormState) {
        const dynamicFormState: DynamicFormState = result.data.dynamicFormState
        setDynamicQuestions(dynamicFormState.questions)
        
        // Actualizar las respuestas existentes en el formData
        if (formData.questionResponses.length > 0) {
          // Las respuestas ya están en el formData, no necesitamos hacer nada
        }
        
        setHasLoaded(true)
        
        if (dynamicFormState.questions.length > 0) {
          toast.success('Preguntas de elegibilidad cargadas', {
            description: `${dynamicFormState.questions.length} preguntas encontradas`
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
        
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Error loading dynamic questions:', error)
      
      toast.error('Error al cargar preguntas', {
        description: error instanceof Error ? error.message : 'Error desconocido'
      })
      
      // Continuar sin preguntas dinámicas
      setHasLoaded(true)
    } finally {
      setIsLoading(false)
    }
  }

  const isUpdating = useRef(false)
  
  const handleResponsesChange = useCallback((
    responses: DynamicQuestionResponse[], 
    newValidation: QuestionValidation
  ) => {
    if (isUpdating.current) return
    
    isUpdating.current = true
    setValidation(newValidation)
    updateFormData('questionResponses', responses)
    
    // Reset flag after a short delay
    setTimeout(() => {
      isUpdating.current = false
    }, 0)
  }, [updateFormData])

  const handleKnockoutDetected = useCallback((hasKnockout: boolean, errors: string[]) => {
    if (hasKnockout) {
      toast.error('Respuesta descalificante detectada', {
        description: 'Una de sus respuestas puede descalificarlo para este plan',
        duration: 6000
      })
    }
  }, [])

  const handleValidateForNext = useCallback((isValid: boolean, errors: string[]) => {
    setIsFormValidForNext(isValid)
    setValidationErrors(errors)
    
    console.log('Validación para Next:', { isValid, errors })
    
    // Notificar al componente padre
    if (onValidationChange) {
      onValidationChange(isValid, errors)
    }
  }, [onValidationChange])

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

  if (!hasLoaded || dynamicQuestions.length === 0) {
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

  return (
    <div className="space-y-6">
      {/* Mensaje de verificación */}
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>DEBUG:</strong> Step7DynamicQuestions se está cargando correctamente
      </div>

      {/* Debug components - siempre visibles para debugging */}
      <div className="space-y-4">
        <DebugCartPlans />
        <DebugApplicationBundle
          selectedPlans={formData.selectedPlans}
          state={formData.state}
          effectiveDate={formData.effectiveDate}
          dateOfBirth={formData.dateOfBirth}
        />
        {/* Test directo para múltiples planes */}
        <Card className="border-orange-300">
          <CardHeader>
            <CardTitle className="text-orange-700">🔧 Debug: Múltiples Planes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={async () => {
                  try {
                    console.log('=== DEBUGGING CON TUS DATOS REALES ===')
                    const debugData = {
                      selectedPlans: formData.selectedPlans,
                      state: formData.state || "CA",
                      effectiveDate: formData.effectiveDate || "2025-11-25T00:00:00Z",
                      dateOfBirth: formData.dateOfBirth || "2002-10-04"
                    }
                    console.log('Enviando datos reales:', debugData)
                    
                    const response = await fetch('/api/debug-application-bundle', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(debugData)
                    })
                    const data = await response.json()
                    console.log('Resultado del debug:', data)
                    alert(response.ok ? '✅ Debug exitoso - Revisa la consola' : `❌ Error: ${data.message}`)
                  } catch (error) {
                    console.error('Error en debug:', error)
                    alert(`❌ Error: ${error}`)
                  }
                }}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Debug con Tus Datos
              </Button>
              
              <Button 
                onClick={async () => {
                  try {
                    console.log('Probando con datos de prueba...')
                    const response = await fetch('/api/test-multiple-plans', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({})
                    })
                    const data = await response.json()
                    console.log('Resultado del test:', data)
                    alert(response.ok ? '✅ Test exitoso - Revisa la consola' : `❌ Error: ${data.message}`)
                  } catch (error) {
                    console.error('Error en test:', error)
                    alert(`❌ Error: ${error}`)
                  }
                }}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Test con Datos de Prueba
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Preguntas de Elegibilidad</h2>
          <p className="mt-2 text-gray-600">
            Primero necesitamos hacer algunas preguntas para determinar tu elegibilidad para los planes seleccionados.
          </p>
        </div>
      </div>

      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertDescription className="text-yellow-700">
          <strong>Importante:</strong> Por favor responda todas las preguntas de elegibilidad con precisión.
          La información incorrecta puede resultar en la denegación de reclamos o la cancelación de la póliza.
        </AlertDescription>
      </Alert>

      <DynamicQuestionsForm
        questions={dynamicQuestions}
        initialResponses={formData.questionResponses}
        onResponsesChange={handleResponsesChange}
        onKnockoutDetected={handleKnockoutDetected}
        onValidateForNext={handleValidateForNext}
      />

      {/* Mostrar advertencia si hay respuestas knockout */}
      {validation.knockoutAnswers.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            <strong>Atención:</strong> Una o más de sus respuestas pueden descalificarlo para los planes seleccionados.
            Por favor, revise sus respuestas o considere seleccionar planes alternativos.
          </AlertDescription>
        </Alert>
      )}

      {/* Mostrar estado de validación para Next */}
      {validationErrors.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-orange-700">
            <strong>Faltan preguntas por responder:</strong>
            <ul className="mt-2 list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Indicador de validación completa */}
      {isFormValidForNext && validationErrors.length === 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">
            <strong>¡Excelente!</strong> Todas las preguntas han sido respondidas. Puede continuar al siguiente paso.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
