"use client"

import { useEffect, useRef } from "react"
import type { DynamicQuestionResponse } from "@/lib/types/application-bundle"

interface UseCleanupHiddenResponsesArgs {
  visibleQuestionIds: number[]
  responses: DynamicQuestionResponse[]
  setResponses: (responses: DynamicQuestionResponse[]) => void
  questionIdsWithAttempts: number[]
  setQuestionIdsWithAttempts: (ids: number[]) => void
}

/**
 * Limpia respuestas e intentos para preguntas que ya no son visibles.
 *
 * Mantiene la misma estrategia anti-loop del componente original:
 * - usa refs para acceder al estado actual sin meterlo en dependencias,
 * - corre solamente cuando cambia `visibleQuestionIds`.
 */
export function useCleanupHiddenResponses({
  visibleQuestionIds,
  responses,
  setResponses,
  questionIdsWithAttempts,
  setQuestionIdsWithAttempts,
}: UseCleanupHiddenResponsesArgs) {
  const responsesRef = useRef(responses)
  useEffect(() => {
    responsesRef.current = responses
  }, [responses])

  const attemptsRef = useRef(questionIdsWithAttempts)
  useEffect(() => {
    attemptsRef.current = questionIdsWithAttempts
  }, [questionIdsWithAttempts])

  const cleanupBootstrapRef = useRef(false)
  const lastCleanupRef = useRef<string | null>(null)

  useEffect(() => {
    // Skip en el primer render
    if (!cleanupBootstrapRef.current) {
      cleanupBootstrapRef.current = true
      return
    }

    const visibleIdsKey = [...visibleQuestionIds].sort().join(",")
    if (lastCleanupRef.current === visibleIdsKey) return

    const currentResponses = responsesRef.current
    const responsesToKeep = currentResponses.filter((r) =>
      visibleQuestionIds.includes(r.questionId)
    )

    if (responsesToKeep.length !== currentResponses.length) {
      console.log("Cleaning up responses for hidden questions:", {
        originalResponses: currentResponses.length,
        keptResponses: responsesToKeep.length,
        removedResponses: currentResponses.length - responsesToKeep.length,
      })
      setResponses(responsesToKeep)
    }

    const currentAttempts = attemptsRef.current
    const attemptsToKeep = currentAttempts.filter((id) =>
      visibleQuestionIds.includes(id)
    )
    if (attemptsToKeep.length !== currentAttempts.length) {
      setQuestionIdsWithAttempts(attemptsToKeep)
    }

    lastCleanupRef.current = visibleIdsKey
  }, [visibleQuestionIds, setQuestionIdsWithAttempts, setResponses])
}


