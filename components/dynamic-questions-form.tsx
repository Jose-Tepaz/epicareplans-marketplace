"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// Removidos RadioGroup y Checkbox de Radix UI para evitar bucles infinitos
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import type { 
  EligibilityQuestion, 
  DynamicQuestionResponse, 
  QuestionValidation,
  DynamicFormState 
} from "@/lib/types/application-bundle"
import { applicationBundleAPI } from "@/lib/api/carriers/allstate"

interface DynamicQuestionsFormProps {
  questions: EligibilityQuestion[]
  initialResponses?: DynamicQuestionResponse[]
  onResponsesChange: (responses: DynamicQuestionResponse[], validation: QuestionValidation) => void
  onKnockoutDetected?: (hasKnockout: boolean, errors: string[]) => void
  onValidateForNext?: (isValid: boolean, errors: string[]) => void
}

export function DynamicQuestionsForm({ 
  questions, 
  initialResponses = [],
  onResponsesChange,
  onKnockoutDetected,
  onValidateForNext
}: DynamicQuestionsFormProps) {
  const [responses, setResponses] = useState<DynamicQuestionResponse[]>(initialResponses)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [questionIdsWithAttempts, setQuestionIdsWithAttempts] = useState<number[]>([])
  const [validation, setValidation] = useState<QuestionValidation>({
    isValid: true,
    errors: [],
    knockoutAnswers: []
  })
  
  // Ref para evitar notificaciones repetidas de knockout
  const lastKnockoutNotification = useRef<{
    knockoutAnswers: number[]
    timestamp: number
  } | null>(null)

  // Función para determinar si una pregunta debe ser visible - MEMOIZADA
  const isQuestionVisible = useCallback((question: EligibilityQuestion): boolean => {
    // Si no tiene condición, siempre es visible
    if (!question.condition) return true
    
    // Buscar la respuesta de la pregunta condicional
    const conditionResponse = responses.find(r => 
      r.questionId === question.condition?.questionId
    )
    
    // Si no hay respuesta para la pregunta condicional, no mostrar
    if (!conditionResponse) return false
    
    // Verificar si la respuesta coincide con la condición
    const shouldShow = conditionResponse.response === question.condition?.answerId.toString()
    
    return shouldShow
  }, [responses])

  // Filtrar preguntas visibles - MEMOIZADO para evitar recalcular en cada render
  const visibleQuestions = useMemo(() => {
    return questions.filter(isQuestionVisible)
  }, [questions, isQuestionVisible])

  // Ref para evitar notificaciones repetidas de validación
  const lastValidationRef = useRef<{ isValid: boolean; errors: string[] } | null>(null)

  // Exponer función de validación al componente padre
  useEffect(() => {
    if (!onValidateForNext) return
    
    // Calcular validación inline para evitar dependencias circulares
    const errors: string[] = []
    visibleQuestions.forEach(question => {
      const response = responses.find(r => r.questionId === question.questionId)
      if (!response || !response.response.trim()) {
        errors.push(`Question ${question.questionId} is required`)
      }
    })
    const isValid = errors.length === 0
    const next = { isValid, errors }
    
    // Solo notificar si cambió
    const prev = lastValidationRef.current
    const changed =
      !prev ||
      prev.isValid !== next.isValid ||
      prev.errors.length !== next.errors.length ||
      !prev.errors.every((e, i) => e === next.errors[i])

    if (changed) {
      console.log('Validación completa:', {
        totalVisibleQuestions: visibleQuestions.length,
        answeredQuestions: responses.length,
        errors: errors.length,
        isValid
      })
      lastValidationRef.current = next
      onValidateForNext(next.isValid, next.errors)
    }
  }, [visibleQuestions, responses, onValidateForNext])

  // Validar respuestas cuando cambien
  useEffect(() => {
    const visibleQuestionIds = visibleQuestions.map(q => q.questionId)
    const newValidation = applicationBundleAPI.validateQuestionResponses(
      questions,
      responses,
      visibleQuestionIds,
      hasUserInteracted,
      questionIdsWithAttempts
    )

    // Usar una función de actualización que recibe el estado actual
    setValidation(prevValidation => {
      const validationErrorsEqual =
        prevValidation.errors.length === newValidation.errors.length &&
        prevValidation.errors.every((error, index) => error === newValidation.errors[index])

      const validationKnockoutsEqual =
        (prevValidation.knockoutAnswers?.length || 0) === (newValidation.knockoutAnswers?.length || 0) &&
        (prevValidation.knockoutAnswers || []).every(
          (answer, index) => answer === (newValidation.knockoutAnswers || [])[index]
        )

      if (
        prevValidation.isValid !== newValidation.isValid ||
        !validationErrorsEqual ||
        !validationKnockoutsEqual
      ) {
        return newValidation
      }
      
      return prevValidation
    })
  }, [responses, questions, visibleQuestions, hasUserInteracted, questionIdsWithAttempts])
  
  // Memoizar las funciones de callback para evitar bucles infinitos
  const memoizedOnResponsesChange = useCallback((responses: DynamicQuestionResponse[], validation: QuestionValidation) => {
    onResponsesChange(responses, validation)
  }, [onResponsesChange])

  const memoizedOnKnockoutDetected = useCallback((hasKnockout: boolean, errors: string[]) => {
    if (onKnockoutDetected) {
      onKnockoutDetected(hasKnockout, errors)
    }
  }, [onKnockoutDetected])

  // Notificar cambios al componente padre
  useEffect(() => {
    memoizedOnResponsesChange(responses, validation)
  }, [responses, validation, memoizedOnResponsesChange])
  
  // Notificar knockout answers solo cuando cambie realmente
  useEffect(() => {
    if (!memoizedOnKnockoutDetected) return
    
    const currentKnockoutAnswers = validation.knockoutAnswers ?? []
    const hasKnockout = currentKnockoutAnswers.length > 0
    
    // Solo notificar si hay knockouts y no los hemos notificado antes
    const knockoutKey = [...currentKnockoutAnswers].sort().join(',')
    const lastKnockoutKey = lastKnockoutNotification.current?.knockoutAnswers
      ? [...lastKnockoutNotification.current.knockoutAnswers].sort().join(',')
      : ''
    
    if (hasKnockout && knockoutKey !== lastKnockoutKey) {
      console.log('Nuevos knockouts detectados:', currentKnockoutAnswers)
      
      // Actualizar el ref
      lastKnockoutNotification.current = {
        knockoutAnswers: [...currentKnockoutAnswers],
        timestamp: Date.now()
      }
      
      // Notificar solo una vez
      memoizedOnKnockoutDetected(hasKnockout, validation.errors ?? [])
    }
  }, [validation.knockoutAnswers, validation.errors, memoizedOnKnockoutDetected])

  const updateResponse = (questionId: number, response: string) => {
    // Marcar que el usuario ha interactuado
    setHasUserInteracted(true)
    
    // Marcar que el usuario ha intentado responder esta pregunta
    setQuestionIdsWithAttempts(prev => {
      if (!prev.includes(questionId)) {
        return [...prev, questionId]
      }
      return prev
    })
    
    setResponses(prev => {
      const existingIndex = prev.findIndex(r => r.questionId === questionId)
      
      if (existingIndex >= 0) {
        // Actualizar respuesta existente
        const updated = [...prev]
        updated[existingIndex] = { questionId, response }
        return updated
      } else {
        // Agregar nueva respuesta
        return [...prev, { questionId, response }]
      }
    })
  }
  
  // Ref para evitar ejecutar limpieza en el primer render
  const cleanupBootstrapRef = useRef(false)

  // Limpiar respuestas de preguntas que ya no son visibles
  useEffect(() => {
    // Skip en el primer render
    if (!cleanupBootstrapRef.current) {
      cleanupBootstrapRef.current = true
      return
    }

    const visibleQuestionIds = visibleQuestions.map(q => q.questionId)
    const responsesToKeep = responses.filter(r => visibleQuestionIds.includes(r.questionId))
    
    if (responsesToKeep.length !== responses.length) {
      console.log('Cleaning up responses for hidden questions:', {
        originalResponses: responses.length,
        keptResponses: responsesToKeep.length,
        removedResponses: responses.length - responsesToKeep.length
      })
      
      // Actualizar respuestas solo si hay cambios
      setResponses(responsesToKeep)
    }

    // También limpiar intentos de preguntas que ya no son visibles
    const attemptsToKeep = questionIdsWithAttempts.filter(id => visibleQuestionIds.includes(id))
    if (attemptsToKeep.length !== questionIdsWithAttempts.length) {
      setQuestionIdsWithAttempts(attemptsToKeep)
    }
  }, [visibleQuestions, responses, questionIdsWithAttempts])

  const renderQuestion = (question: EligibilityQuestion) => {
    const currentResponse = responses.find(r => r.questionId === question.questionId)
    const hasError = validation.errors?.some(error => error.includes(`Question ${question.questionId}`)) || false
    const isKnockout = validation.knockoutAnswers?.includes(question.questionId) || false

    return (
      <Card key={question.questionId} className={`mb-6 ${hasError ? 'border-red-300' : ''} ${isKnockout ? 'border-orange-300 bg-orange-50' : ''}`}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: question.questionText }}
            />
            {hasError && <XCircle className="h-5 w-5 text-red-500" />}
            {isKnockout && <AlertTriangle className="h-5 w-5 text-orange-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mostrar error específico si existe */}
          {hasError && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700">
                {validation.errors?.find(error => error.includes(`Question ${question.questionId}`))}
              </AlertDescription>
            </Alert>
          )}

          {/* Renderizar opciones según el tipo */}
          <div className="space-y-2">
            {question.possibleAnswers.map(answer => {
              const answerKey = `${question.questionId}-${answer.id}`
              const isSelected = currentResponse?.response === answer.id.toString()
              
              if (answer.answerType === 'Radio') {
                return (
                  <div key={answerKey} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={answerKey}
                      name={`question-${question.questionId}`}
                      value={answer.id.toString()}
                      checked={isSelected}
                      onChange={() => updateResponse(question.questionId, answer.id.toString())}
                      className="h-4 w-4 text-blue-600"
                    />
                    <Label htmlFor={answerKey} className="cursor-pointer">
                      <span 
                        dangerouslySetInnerHTML={{ __html: answer.answerText }}
                      />
                    </Label>
                  </div>
                )
              }
              
              if (answer.answerType === 'Checkbox') {
                return (
                  <div key={answerKey} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={answerKey}
                      checked={isSelected}
                      onChange={(e) => updateResponse(question.questionId, e.target.checked ? answer.id.toString() : '')}
                      className="h-4 w-4 text-blue-600"
                    />
                    <Label htmlFor={answerKey} className="cursor-pointer">
                      <span 
                        dangerouslySetInnerHTML={{ __html: answer.answerText }}
                      />
                    </Label>
                  </div>
                )
              }
              
              if (answer.answerType === 'FreeText') {
                return (
                  <div key={answerKey} className="mb-4">
                    <Input
                      placeholder="Enter your answer"
                      value={currentResponse?.response || ''}
                      onChange={(e) => updateResponse(question.questionId, e.target.value)}
                      className={hasError ? 'border-red-300' : ''}
                    />
                  </div>
                )
              }
              
              if (answer.answerType === 'Date') {
                return (
                  <div key={answerKey} className="mb-4">
                    <Input
                      type="date"
                      value={currentResponse?.response || ''}
                      onChange={(e) => updateResponse(question.questionId, e.target.value)}
                      className={hasError ? 'border-red-300' : ''}
                    />
                  </div>
                )
              }
              
              if (answer.answerType === 'TextArea') {
                return (
                  <div key={answerKey} className="mb-4">
                    <Textarea
                      placeholder="Enter your detailed answer"
                      value={currentResponse?.response || ''}
                      onChange={(e) => updateResponse(question.questionId, e.target.value)}
                      className={hasError ? 'border-red-300' : ''}
                      rows={4}
                    />
                  </div>
                )
              }
              
              return (
                <div key={answerKey} className="mb-2 p-2 bg-gray-100 rounded">
                  <p className="text-sm text-gray-600">
                    Tipo de pregunta no soportado: {answer.answerType}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Mostrar mensaje de knockout si aplica */}
          {isKnockout && (
            <Alert className="mt-4 border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <AlertDescription className="text-orange-700">
                Esta respuesta puede descalificar al aplicante. Por favor, revise su selección.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    )
  }

  // Función para validar manualmente (para testing)
  const handleManualValidation = () => {
    const errors: string[] = []
    visibleQuestions.forEach(question => {
      const response = responses.find(r => r.questionId === question.questionId)
      if (!response || !response.response.trim()) {
        errors.push(`Question ${question.questionId} is required`)
      }
    })
    const isValid = errors.length === 0
    const result = { isValid, errors }
    
    console.log('Validación manual:', result)
    
    if (!result.isValid) {
      alert(`Faltan ${result.errors.length} preguntas por responder:\n${result.errors.join('\n')}`)
    } else {
      alert('¡Todas las preguntas están respondidas! ✅')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header con estado de validación */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Preguntas de Elegibilidad</h3>
          {validation.isValid ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {responses.length} de {visibleQuestions.length} preguntas respondidas
          </div>
          {/* Botón de validación manual para testing */}
          {process.env.NODE_ENV === 'development' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualValidation}
              className="text-xs"
            >
              Validar Todo
            </Button>
          )}
        </div>
      </div>

      {/* Mostrar errores generales */}
      {validation.errors && validation.errors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription>
            <div className="space-y-1">
              {validation.errors.map((error, index) => (
                <div key={index} className="text-red-700">{error}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Preguntas (solo las visibles) */}
      <div className="space-y-4">
        {visibleQuestions.map(renderQuestion)}
      </div>
      
      {/* Debug info para preguntas condicionales 
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">Debug: Preguntas Condicionales</h4>
          <div className="text-xs text-blue-700 space-y-1">
            <div>Total preguntas: {questions.length}</div>
            <div>Preguntas visibles: {visibleQuestions.length}</div>
            <div>Preguntas ocultas: {questions.length - visibleQuestions.length}</div>
            <div className="mt-2">
              <div className="font-semibold">Preguntas con condiciones:</div>
              {questions.filter(q => q.condition).map(q => (
                <div key={q.questionId} className="ml-2">
                  Q{q.questionId}: Depende de Q{q.condition.questionId} = {q.condition.answerId}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
        */}
        

      {/* Resumen de respuestas 
      {responses.length > 0 && (
        <Card className="bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">Resumen de Respuestas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {responses.map(response => {
                const question = questions.find(q => q.questionId === response.questionId)
                return (
                  <div key={response.questionId} className="text-sm">
                    <span className="font-medium">Q{question?.questionId}:</span> {response.response}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
        */}
    </div>
  )
}
