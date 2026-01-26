/**
 * Paso 3: Género
 * 
 * Solicita el género del usuario usando un selector dropdown.
 * Opciones: Male, Female, Other
 */

import type React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StepContainer } from "../StepContainer"
import { StepNavigation } from "../StepNavigation"
import type { StepProps } from "../../types"

interface StepGenderProps extends StepProps {
  value: string
  onChange: (value: string) => void
}

export const StepGender: React.FC<StepGenderProps> = ({
  value,
  onChange,
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
        What is your gender?
      </h2>

      <div className="flex flex-col gap-4">
        <div className="flex flex-row gap-4">
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="input-epicare w-full text-lg font-semibold mb-0">
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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
