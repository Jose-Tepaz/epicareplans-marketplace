"use client"

import type { DynamicQuestionResponse, EligibilityQuestion } from "@/lib/types/application-bundle"

/**
 * Genera errores de "required" en el formato que este flujo espera:
 * `Question {id} is required`
 *
 * Se considera respondida si existe `response.response` y no es whitespace.
 */
export function getRequiredErrors(
  visibleQuestions: EligibilityQuestion[],
  responses: DynamicQuestionResponse[]
): string[] {
  const errors: string[] = []

  visibleQuestions.forEach((question) => {
    const response = responses.find((r) => r.questionId === question.questionId)
    if (!response || !response.response.trim()) {
      errors.push(`Question ${question.questionId} is required`)
    }
  })

  return errors
}


