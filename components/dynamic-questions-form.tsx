"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import type { 
  EligibilityQuestion, 
  DynamicQuestionResponse, 
  QuestionValidation,
} from "@/lib/types/application-bundle"
import { applicationBundleAPI } from "@/lib/api/carriers/allstate"
import { getRequiredErrors } from "@/components/dynamic-questions/get-required-errors"
import { QuestionsHeader } from "@/components/dynamic-questions/questions-header"
import { QuestionCard } from "@/components/dynamic-questions/question-card"
import { useCleanupHiddenResponses } from "@/components/dynamic-questions/use-cleanup-hidden-responses"
import { getInlineFriendlyErrorMessage } from "@/components/dynamic-questions/format-validation-errors"

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
  // Crear un mapa de respuestas memoizado para evitar recálculos innecesarios
  const responsesMap = useMemo(() => {
    const map = new Map<number, string>()
    responses.forEach(r => map.set(r.questionId, r.response))
    return map
  }, [responses])
  
  // Función para verificar si una pregunta es visible
  const isQuestionVisible = useCallback((question: EligibilityQuestion): boolean => {
    // Si no tiene condición, siempre es visible
    if (!question.condition) return true
    
    // Buscar la respuesta de la pregunta condicional en el mapa
    const conditionResponse = responsesMap.get(question.condition.questionId)
    
    // Si no hay respuesta para la pregunta condicional, no mostrar
    if (!conditionResponse) return false
    
    // Verificar si la respuesta coincide con la condición
    return conditionResponse === question.condition.answerId.toString()
  }, [responsesMap])

  // Filtrar preguntas visibles - MEMOIZADO para evitar recalcular en cada render
  // Solo se recalcula si questions o el mapa de respuestas cambió
  const visibleQuestions = useMemo(() => {
    return questions.filter(isQuestionVisible)
  }, [questions, isQuestionVisible])

  const visibleQuestionIds = useMemo(() => {
    return visibleQuestions.map((q) => q.questionId)
  }, [visibleQuestions])

  const answeredVisibleCount = useMemo(() => {
    // Cuenta solo respuestas no vacías para preguntas visibles
    let count = 0
    visibleQuestions.forEach((q) => {
      const value = responsesMap.get(q.questionId)
      if (value && value.trim()) count += 1
    })
    return count
  }, [visibleQuestions, responsesMap])

  const remainingVisibleCount = useMemo(() => {
    return Math.max(0, visibleQuestions.length - answeredVisibleCount)
  }, [answeredVisibleCount, visibleQuestions.length])

  // Ref para evitar notificaciones repetidas de validación
  const lastValidationRef = useRef<{ isValid: boolean; errors: string[] } | null>(null)

  // Ref para forzar validación inicial
  const hasRunInitialValidation = useRef(false)
  
  // Exponer función de validación al componente padre
  useEffect(() => {
    if (!onValidateForNext) return
    
    // Calcular validación inline para evitar dependencias circulares
    const errors = getRequiredErrors(visibleQuestions, responses)
    
    // CORREGIDO: Determinar si es válido
    // - Si hay preguntas dinámicas (questions.length > 0) pero no hay visibles (visibleQuestions.length === 0),
    //   entonces están cargando o ninguna es visible por lógica condicional: INVÁLIDO
    // - Si no hay preguntas dinámicas (questions.length === 0), entonces es VÁLIDO (no hay nada que validar)
    // - Si hay preguntas visibles, solo es válido si todas están respondidas (errors.length === 0)
    let isValid: boolean
    if (questions.length === 0) {
      // No hay preguntas dinámicas definidas para este plan
      isValid = true
    } else if (visibleQuestions.length === 0) {
      // Hay preguntas pero ninguna visible (cargando o condicionales)
      isValid = false
    } else {
      // Hay preguntas visibles: validar que todas estén respondidas
      isValid = errors.length === 0
    }
    
    const next = { isValid, errors }
    
    // Solo notificar si cambió O si es la primera validación
    const prev = lastValidationRef.current
    const changed =
      !hasRunInitialValidation.current ||
      !prev ||
      prev.isValid !== next.isValid ||
      prev.errors.length !== next.errors.length ||
      !prev.errors.every((e, i) => e === next.errors[i])

    if (changed) {
      console.log('🔍 [DynamicQuestionsForm] Validación actualizada:', {
        totalQuestions: questions.length,
        totalVisibleQuestions: visibleQuestions.length,
        answeredQuestions: responses.filter(r => visibleQuestions.some(q => q.questionId === r.questionId)).length,
        errorsCount: errors.length,
        isValid,
        reason: questions.length === 0 ? 'Sin preguntas dinámicas' : 
                visibleQuestions.length === 0 ? 'Preguntas cargando o no visibles' :
                errors.length === 0 ? 'Todas respondidas' : 'Faltan respuestas',
        visibleQuestionsIds: visibleQuestions.map(q => q.questionId),
        responsesIds: responses.map(r => r.questionId)
      })
      lastValidationRef.current = next
      hasRunInitialValidation.current = true
      onValidateForNext(next.isValid, next.errors)
    }
  }, [visibleQuestions, responses, onValidateForNext])

  // Validar respuestas cuando cambien
  useEffect(() => {
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

  // Ref para evitar notificaciones redundantes al padre
  const lastResponsesNotification = useRef<{ 
    responsesKey: string; 
    validationKey: string 
  } | null>(null)

  // Notificar cambios al componente padre solo si realmente cambió
  useEffect(() => {
    // Crear claves únicas para comparar
    const responsesKey = responses.map(r => `${r.questionId}:${r.response}`).sort().join('|')
    const validationKey = `${validation.isValid}:${validation.errors.join(',')}:${(validation.knockoutAnswers || []).join(',')}`
    
    // Verificar si realmente cambió
    const lastNotification = lastResponsesNotification.current
    if (lastNotification && 
        lastNotification.responsesKey === responsesKey && 
        lastNotification.validationKey === validationKey) {
      return // No cambió, no hacer nada
    }
    
    // Actualizar el ref y notificar
    lastResponsesNotification.current = { responsesKey, validationKey }
    memoizedOnResponsesChange(responses, validation)
  }, [responses, validation, memoizedOnResponsesChange])
  
  // Notificar knockout answers solo cuando cambie realmente
  useEffect(() => {
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

  useCleanupHiddenResponses({
    visibleQuestionIds,
    responses,
    setResponses,
    questionIdsWithAttempts,
    setQuestionIdsWithAttempts,
  })

  const handleManualValidation = () => {
    const errors = getRequiredErrors(visibleQuestions, responses)
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
      <QuestionsHeader
        isValid={validation.isValid}
        answeredCount={answeredVisibleCount}
        totalVisible={visibleQuestions.length}
        remainingCount={remainingVisibleCount}
        onManualValidate={handleManualValidation}
      />

      {/* Mostrar errores generales */}
      {validation.errors && validation.errors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription>
            <div className="space-y-1">
              <div className="text-red-800 font-semibold">
                Faltan {remainingVisibleCount}/{visibleQuestions.length} preguntas por responder.
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Preguntas (solo las visibles) */}
      <div className="space-y-4">
        {visibleQuestions.map((question) => {
          const currentResponse = responses.find(
            (r) => r.questionId === question.questionId
          )
          const hasError =
            validation.errors?.some((error) =>
              error.includes(`Question ${question.questionId}`)
            ) || false
          const isKnockout =
            validation.knockoutAnswers?.includes(question.questionId) || false
          const rawError = validation.errors?.find((error) =>
            error.includes(`Question ${question.questionId}`)
          )

          return (
            <QuestionCard
              key={question.questionId}
              question={question}
              currentResponse={currentResponse}
              hasError={hasError}
              isKnockout={isKnockout}
              errorMessage={getInlineFriendlyErrorMessage(rawError)}
              onUpdateResponse={updateResponse}
            />
          )
        })}
      </div>
      
     
    </div>
  )
}
