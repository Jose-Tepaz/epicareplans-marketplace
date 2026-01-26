/**
 * Paso 6 (Final): Frecuencia de Pago
 * 
 * Solicita con qué frecuencia el usuario desea realizar los pagos.
 * Opciones: Monthly, Quarterly, Semi-Annually, Annually
 */

import type React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StepContainer } from "../StepContainer"
import { StepNavigation } from "../StepNavigation"
import type { StepProps } from "../../types"

interface StepPaymentFrequencyProps extends StepProps {
  value: string
  onChange: (value: string) => void
}

export const StepPaymentFrequency: React.FC<StepPaymentFrequencyProps> = ({
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
        How often would you like to make payments?
      </h2>

      <div className="mb-8">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="input-epicare w-full text-lg font-semibold mb-0">
            <SelectValue placeholder="Select payment frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="semi-annually">Semi-Annually</SelectItem>
            <SelectItem value="annually">Annually</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <StepNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={onBack}
        onNext={onNext}
        canProceed={value.trim().length > 0}
        isValidating={isValidating}
        isSubmitting={isSubmitting}
        isLastStep={true}
      />
    </StepContainer>
  )
}
