/**
 * Paso de Progreso Visual (No Condicional)
 * 
 * Siempre aparece después de:
 * - Insurance Type (para flujos normales)
 * - Customize Life Coverage (para flujo Me + Life)
 * 
 * Muestra al usuario el progreso general del formulario con 3 etapas:
 * 1. Tell us about your needs ✓
 * 2. Add your basic information
 * 3. Provide health info and get your final rate
 * 
 * No captura datos, solo es informativo.
 */

import type React from "react"
import { Check } from "lucide-react"
import { StepContainer } from "../StepContainer"
import { StepNavigation } from "../StepNavigation"

interface StepProgressOverviewProps {
  onNext: () => void
  onBack: () => void
  isValidating: boolean
  isSubmitting: boolean
  currentStep: number
  totalSteps: number
}

export const StepProgressOverview: React.FC<StepProgressOverviewProps> = ({
  onNext,
  onBack,
  isValidating,
  isSubmitting,
  currentStep,
  totalSteps,
}) => {
  const steps = [
    {
      id: 1,
      title: "Tell us about your needs",
      completed: true,
    },
    {
      id: 2,
      title: "Add your basic information",
      completed: false,
    },
    {
      id: 3,
      title: "Provide health info and get your final rate",
      completed: false,
    },
  ]

  return (
    <StepContainer>
      <div className=" mx-auto">
        
         
          <div className="space-y-8">
            {/* Título */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-700 mb-4">
                <span className="text-orange-500">Great!</span>
              </h1>
              <p className="text-2xl md:text-3xl font-bold text-gray-700 leading-tight">
                We'll get your coverage options in as little as{" "}
                <span className="text-gray-900">10 minutes</span>
              </p>
            </div>

            {/* Lista de pasos con checkboxes */}
            <div className="space-y-4">
              {steps.map((step, index) => {
                const isLast = index === steps.length - 1

                return (
                  <div key={step.id} className="relative">
                    {/* Card del paso */}
                    <div
                      className={`
                        flex items-center gap-4 p-5 rounded-2xl border-2 transition-all
                        ${
                          step.completed
                            ? "bg-white border-orange-500 shadow-md"
                            : "bg-white border-gray-200"
                        }
                      `}
                    >
                      {/* Checkbox */}
                      <div
                        className={`
                          flex-shrink-0 w-7 h-7 rounded-md border-2 flex items-center justify-center
                          transition-all
                          ${
                            step.completed
                              ? "bg-cyan-500 border-cyan-500"
                              : "bg-white border-gray-300"
                          }
                        `}
                      >
                        {step.completed && <Check className="w-5 h-5 text-white" />}
                      </div>

                      {/* Texto */}
                      <span
                        className={`
                          text-lg font-medium
                          ${step.completed ? "text-gray-800" : "text-gray-500"}
                        `}
                      >
                        {step.title}
                      </span>
                    </div>

                    {/* Línea conectora vertical */}
                    {!isLast && (
                      <div className="absolute left-[26px] top-[65px] w-0.5 h-4 bg-orange-500" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

       

        {/* Navegación estándar */}
        <StepNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          onBack={onBack}
          onNext={onNext}
          canProceed={true}
          isValidating={isValidating}
          isSubmitting={isSubmitting}
        />
      </div>
    </StepContainer>
  )
}
