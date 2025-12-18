"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, XCircle } from "lucide-react"
import type { DynamicQuestionResponse, EligibilityQuestion } from "@/lib/types/application-bundle"

interface QuestionCardProps {
  question: EligibilityQuestion
  currentResponse?: DynamicQuestionResponse
  hasError: boolean
  isKnockout: boolean
  errorMessage?: string
  onUpdateResponse: (questionId: number, response: string) => void
}

export function QuestionCard({
  question,
  currentResponse,
  hasError,
  isKnockout,
  errorMessage,
  onUpdateResponse,
}: QuestionCardProps) {
  return (
    <Card
      className={`mb-6 ${hasError ? "border-red-300" : ""} ${
        isKnockout ? "border-orange-300 bg-orange-50" : ""
      }`}
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: question.questionText }}
          />
          {hasError && <XCircle className="h-5 w-5 text-red-500" />}
          {isKnockout && <AlertTriangle className="h-5 w-5 text-orange-500" />}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {hasError && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2 flex flex-row flex-wrap gap-2 justify-start items-start">
          {question.possibleAnswers.map((answer) => {
            const answerKey = `${question.questionId}-${answer.id}`
            const isSelected = currentResponse?.response === answer.id.toString()

            if (answer.answerType === "Radio") {
              return (
                <button
                  type="button"
                  key={answerKey}
                  onClick={() =>
                    onUpdateResponse(question.questionId, answer.id.toString())
                  }
                  className={`
                      px-4 py-2 rounded border 
                      flex items-center gap-2 
                      transition-colors
                      ${
                        isSelected
                          ? "bg-orange-100 border-orange-500 text-orange-600 font-semibold ring-2 ring-orange-300"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-orange-50"
                      }
                      focus:outline-none
                    `}
                  aria-pressed={isSelected}
                >
                  <input
                    type="radio"
                    id={answerKey}
                    name={`question-${question.questionId}`}
                    value={answer.id.toString()}
                    checked={isSelected}
                    onChange={() =>
                      onUpdateResponse(question.questionId, answer.id.toString())
                    }
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                  <Label htmlFor={answerKey} className="cursor-pointer m-0 p-0">
                    <span
                      dangerouslySetInnerHTML={{ __html: answer.answerText }}
                    />
                  </Label>
                </button>
              )
            }

            if (answer.answerType === "Checkbox") {
              return (
                <div key={answerKey} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={answerKey}
                    checked={isSelected}
                    onChange={(e) =>
                      onUpdateResponse(
                        question.questionId,
                        e.target.checked ? answer.id.toString() : ""
                      )
                    }
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

            if (answer.answerType === "FreeText") {
              return (
                <div key={answerKey} className="mb-4">
                  <Input
                    placeholder="Escribe tu respuesta"
                    value={currentResponse?.response || ""}
                    onChange={(e) =>
                      onUpdateResponse(question.questionId, e.target.value)
                    }
                    className={hasError ? "border-red-300" : ""}
                  />
                </div>
              )
            }

            if (answer.answerType === "Date") {
              return (
                <div key={answerKey} className="mb-4">
                  <Input
                    type="date"
                    value={currentResponse?.response || ""}
                    onChange={(e) =>
                      onUpdateResponse(question.questionId, e.target.value)
                    }
                    className={hasError ? "border-red-300" : ""}
                  />
                </div>
              )
            }

            if (answer.answerType === "TextArea") {
              return (
                <div key={answerKey} className="mb-4">
                  <Textarea
                    placeholder="Escribe tu respuesta"
                    value={currentResponse?.response || ""}
                    onChange={(e) =>
                      onUpdateResponse(question.questionId, e.target.value)
                    }
                    className={hasError ? "border-red-300" : ""}
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

        {isKnockout && (
          <Alert className="mt-4 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <AlertDescription className="text-orange-700">
              Esta respuesta puede descalificar al aplicante. Por favor, revisa
              tu selección.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}


