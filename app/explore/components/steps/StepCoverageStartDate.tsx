/**
 * Paso 5: Fecha de Inicio de Cobertura
 * 
 * Solicita la fecha en la que el usuario desea que comience su cobertura.
 * - Debe ser hoy o una fecha futura
 */

import type React from "react"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { StepContainer } from "../StepContainer"
import { StepNavigation } from "../StepNavigation"
import { ValidationMessage } from "../ValidationMessage"
import { parseDateLocal } from "../../utils/dateHelpers"
import type { StepProps } from "../../types"

interface StepCoverageStartDateProps extends StepProps {
  value: string
  onChange: (value: string) => void
  onDateSelect: (date: Date | undefined) => void
  error: string
  isValid: boolean
}

export const StepCoverageStartDate: React.FC<StepCoverageStartDateProps> = ({
  value,
  onChange,
  onDateSelect,
  error,
  isValid,
  onNext,
  onBack,
  isValidating,
  isSubmitting,
  currentStep,
  totalSteps,
}) => {
  return (
    <StepContainer>
      <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8 text-center text-balance">
        When would you like your coverage to begin?
      </h2>

      <Popover>
        <PopoverTrigger asChild>
          <button
            className={`input-epicare w-full justify-start text-left font-normal h-12 px-4 py-3 flex items-center ${
              error ? 'border-red-500' : ''
            }`}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? (
              parseDateLocal(value).toLocaleDateString()
            ) : (
              <span className="text-white">Pick a date</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ? parseDateLocal(value) : undefined}
            onSelect={onDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {isValid && <ValidationMessage type="success" message="Valid coverage start date" />}
      {error && <ValidationMessage type="error" message={error} />}

      <StepNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={onBack}
        onNext={onNext}
        canProceed={value.trim().length > 0}
        isValidating={isValidating}
        isSubmitting={isSubmitting}
      />
    </StepContainer>
  )
}
