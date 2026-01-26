/**
 * Paso 1: Código Postal
 * 
 * Solicita y valida el código postal del usuario.
 * - Validación de formato (5 dígitos)
 * - Validación contra API de direcciones
 */

import type React from "react"
import { Input } from "@/components/ui/input"
import { StepContainer } from "../StepContainer"
import { StepNavigation } from "../StepNavigation"
import { ValidationMessage } from "../ValidationMessage"
import type { StepProps } from "../../types"

interface StepZipCodeProps extends StepProps {
  value: string
  onChange: (value: string) => void
  error: string
  isValid: boolean | null
}

export const StepZipCode: React.FC<StepZipCodeProps> = ({
  value,
  onChange,
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
        What is your ZIP code?
      </h2>

      <Input
        type="text"
        placeholder="Enter your ZIP Code"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input-epicare ${
          error ? 'border-red-500' : isValid ? 'border-green-500' : ''
        }`}
        maxLength={5}
      />

      {error && <ValidationMessage type="error" message={error} />}
      {isValid && <ValidationMessage type="success" message="Valid ZIP code" />}

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
