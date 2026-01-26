/**
 * Paso 1: ¿A quién buscas proteger con este seguro?
 * 
 * Presenta 4 opciones de cobertura:
 * - Me (Individual)
 * - Me + Family
 * - Employees (Group)
 * - Pet
 */

import type React from "react"
import { StepContainer } from "../StepContainer"
import { StepNavigation } from "../StepNavigation"
import { LOOKING_FOR_OPTIONS } from "../../constants"
import type { StepProps } from "../../types"
import { Check } from "lucide-react"

interface StepLookingForProps extends StepProps {
  value: string
  onChange: (value: string) => void
  error: string
  isValid: boolean
}

export const StepLookingFor: React.FC<StepLookingForProps> = ({
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
      {/* Título con "looking" en naranja */}
      <h2 className="text-4xl md:text-5xl font-bold text-gray-700 mb-12 text-center text-balance">
        Who are you{" "}
        <span className="text-orange-500">looking</span>{" "}
        to protect with this insurance?
      </h2>

      {/* Grid de opciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {LOOKING_FOR_OPTIONS.map((option) => {
          const isSelected = value === option.value
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`
                relative p-6 rounded-2xl border-2 transition-all duration-200
                hover:shadow-lg hover:scale-105
                ${isSelected 
                  ? 'border-orange-500 bg-orange-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              {/* Checkbox en la esquina superior izquierda */}
              <div className="absolute top-4 left-4">
                <div
                  className={`
                    w-6 h-6 rounded-md border-2 flex items-center justify-center
                    ${isSelected 
                      ? 'bg-cyan-500 border-cyan-500' 
                      : 'bg-white border-gray-300'
                    }
                  `}
                >
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>

              {/* Contenido de la tarjeta */}
              <div className="mt-8 text-left">
                <h3 className={`
                  text-2xl font-bold mb-2
                  ${isSelected ? 'text-gray-800' : 'text-gray-700'}
                `}>
                  {option.label}
                </h3>
                <p className={`
                  text-sm mb-6
                  ${isSelected ? 'text-gray-600' : 'text-gray-500'}
                `}>
                  {option.subtitle}
                </p>

                {/* Ilustración de familia (placeholder con emoji/icon) */}
                <div className="flex justify-end items-end h-20">
                  <div className={`
                    text-5xl transition-all duration-200
                    ${isSelected ? 'opacity-100 scale-110' : 'opacity-50'}
                  `}>
                    {option.value === 'me' && (
                      <div className="flex items-end space-x-1">
                        <span className="text-4xl">👤</span>
                      </div>
                    )}
                    {option.value === 'me-family' && (
                      <div className="flex items-end space-x-1">
                        <span className="text-5xl">👨‍👩‍👧</span>
                      </div>
                    )}
                    {option.value === 'employees' && (
                      <div className="flex items-end space-x-1">
                        <span className="text-4xl">👥</span>
                      </div>
                    )}
                    {option.value === 'pet' && (
                      <div className="flex items-end space-x-1">
                        <span className="text-4xl">🐕</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Indicador visual de selección */}
              {isSelected && (
                <div className="absolute inset-0 rounded-2xl border-2 border-orange-500 pointer-events-none" />
              )}
            </button>
          )
        })}
      </div>

      {/* Mensaje de error si existe */}
      {error && (
        <div className="text-red-500 text-sm text-center mb-4">
          {error}
        </div>
      )}

      {/* Navegación */}
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
