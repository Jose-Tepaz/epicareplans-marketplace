/**
 * Paso 2: Fecha de Nacimiento
 * 
 * Solicita y valida la fecha de nacimiento del usuario.
 * - Debe ser mayor de 18 años
 * - Usa un selector de calendario (Popover)
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

interface StepDateOfBirthProps extends StepProps {
  value: string
  onChange: (value: string) => void
  error: string
  isValid: boolean
  onDateSelect: (date: Date | undefined) => void
}

export const StepDateOfBirth: React.FC<StepDateOfBirthProps> = ({
  value,
  onChange,
  error,
  isValid,
  onDateSelect,
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
        What is your date of birth?
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
            captionLayout="dropdown"
            onSelect={onDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {error && <ValidationMessage type="error" message={error} />}
      {isValid && <ValidationMessage type="success" message="Valid date of birth" />}

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
