/**
 * Paso: Let's Get to Know You
 * 
 * Paso visual informativo (no condicional) que aparece después de About Your Need.
 * No captura datos, solo es un corte visual para preparar al usuario para
 * la siguiente sección del formulario.
 */

import type React from "react"
import { StepContainer } from "../StepContainer"
import { StepNavigation } from "../StepNavigation"
import type { StepProps } from "../../types"

interface StepLetsGetToKnowYouProps extends StepProps {}

export const StepLetsGetToKnowYou: React.FC<StepLetsGetToKnowYouProps> = ({
  onNext,
  onBack,
  isValidating,
  isSubmitting,
  currentStep,
  totalSteps,
}) => {
  return (
    <StepContainer>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        {/* Icono de escudo */}
        <div className="mb-8">
          <svg
            className="w-32 h-32 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
            {/* Círculo blanco con + */}
            <circle cx="12" cy="12" r="4" fill="white" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v4m0-4h4m-4 0H8"
              stroke="currentColor"
            />
          </svg>
        </div>

        {/* Título */}
        <h2 className="text-4xl md:text-5xl font-bold text-gray-700 mb-12 text-center">
          Let's Get to{" "}
          <span className="text-orange-500">Know You</span>
        </h2>
      </div>

      {/* Navegación */}
      <StepNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={onBack}
        onNext={onNext}
        canProceed={true}
        isValidating={isValidating}
        isSubmitting={isSubmitting}
      />
    </StepContainer>
  )
}
