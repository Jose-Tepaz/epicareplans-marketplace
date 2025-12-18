"use client"

import type { EligibilityQuestion } from "@/lib/types/application-bundle"

function stripHtml(html: string): string {
  // Suficiente para estos textos (vienen como HTML simple). Evita mostrar tags al usuario.
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
}

/**
 * Intenta extraer el ID de pregunta desde errores internos tipo:
 * - `Question 631 is required`
 */
function extractQuestionId(error: string): number | null {
  const match = error.match(/Question\s+(\d+)\s+/i)
  if (!match) return null
  const id = parseInt(match[1], 10)
  return Number.isFinite(id) ? id : null
}

export interface FriendlyValidationError {
  questionId?: number
  label: string
}

/**
 * Convierte errores internos (con IDs) a una lista amigable para mostrar al usuario.
 * Si no se puede mapear, devuelve un mensaje genérico.
 */
export function toFriendlyValidationErrors(
  errors: string[],
  questions: EligibilityQuestion[]
): FriendlyValidationError[] {
  return errors.map((error) => {
    const qid = extractQuestionId(error)
    const q = qid != null ? questions.find((qq) => qq.questionId === qid) : undefined

    // Caso típico: required
    if (qid != null && error.toLowerCase().includes("is required")) {
      return {
        questionId: qid,
        label: q?.questionText ? stripHtml(q.questionText) : "Falta responder una pregunta requerida",
      }
    }

    // Fallback
    return {
      questionId: qid ?? undefined,
      label: q?.questionText ? stripHtml(q.questionText) : "Hay un error en una de las respuestas",
    }
  })
}

/**
 * Mensaje corto para mostrar dentro de la tarjeta cuando falta un required.
 */
export function getInlineFriendlyErrorMessage(rawError?: string): string | undefined {
  if (!rawError) return undefined
  if (rawError.toLowerCase().includes("is required")) return "Esta pregunta es requerida."
  return rawError
}


