/**
 * Componente de navegación para los pasos del formulario
 *
 * Muestra:
 * - Indicador de paso actual (X/Y)
 * - Botón de retroceso
 * - Botón de avance/completar
 * - Estados de carga (validando, procesando)
 */

import type React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  canProceed: boolean;
  isValidating: boolean;
  isSubmitting: boolean;
  isLastStep?: boolean;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  canProceed,
  isValidating,
  isSubmitting,
  isLastStep = false,
}) => {
  const isLoading = isValidating || isSubmitting;

  return (
    <div className="absolute bg-white p-2 bottom-0 left-0 right-0 flex items-center justify-between mt-8">
      <div className="container-large flex items-center justify-between">
        <span className="text-gray-600 text-lg font-medium">
          Step {currentStep}/{totalSteps}
        </span>
        <div className="flex gap-4">
          <Button
            onClick={onBack}
            variant="outline"
            disabled={isLoading}
            className="px-8"
          >
            Back
          </Button>
          <Button
            onClick={onNext}
            disabled={!canProceed || isLoading}
            className="px-8 bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isSubmitting ? "Procesando..." : "Validando..."}
              </>
            ) : isLastStep ? (
              "Complete"
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
