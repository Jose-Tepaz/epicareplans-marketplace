"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"

interface QuestionsHeaderProps {
  isValid: boolean
  answeredCount: number
  totalVisible: number
  remainingCount: number
  onManualValidate?: () => void
}

export function QuestionsHeader({
  isValid,
  answeredCount,
  totalVisible,
  remainingCount,
  onManualValidate,
}: QuestionsHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Preguntas de Elegibilidad</h3>
        {isValid ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500" />
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          {remainingCount}/{totalVisible} preguntas por responder
        </div>

        {process.env.NODE_ENV === "development" && onManualValidate && (
          <Button
            variant="outline"
            size="sm"
            onClick={onManualValidate}
            className="text-xs"
          >
            Validar Todo
          </Button>
        )}
      </div>
    </div>
  )
}


