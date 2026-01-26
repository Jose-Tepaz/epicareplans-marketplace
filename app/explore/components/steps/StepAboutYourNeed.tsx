/**
 * Paso: About Your Need
 * 
 * Paso general (no condicional) que aparece después del Progress Overview.
 * Permite al usuario seleccionar la razón principal por la que busca seguro.
 * 
 * Opciones:
 * - Cambiar mi plan actual (económico)
 * - Cambiar mi plan actual (elegibilidad)
 * - Seguro Temporal
 * - Trabajo independiente
 * - Protección de emergencia
 */

import type React from "react"
import { StepContainer } from "../StepContainer"
import { StepNavigation } from "../StepNavigation"
import { ABOUT_YOUR_NEED_OPTIONS } from "../../constants"
import type { StepProps } from "../../types"
import { Check } from "lucide-react"

interface StepAboutYourNeedProps extends StepProps {
  value: string
  onChange: (value: string) => void
  error: string
  isValid: boolean
}

export const StepAboutYourNeed: React.FC<StepAboutYourNeedProps> = ({
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
      {/* Título */}
      <h2 className="text-4xl md:text-5xl font-bold text-gray-700 mb-4 text-center">
        About your need
      </h2>

      {/* Subtítulo */}
      <p className="text-lg text-gray-500 mb-12 text-center">
        Elige la opción que mas te represente
      </p>

      {/* Grid de opciones (3 columnas en desktop, 2 en tablet, 1 en móvil) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {ABOUT_YOUR_NEED_OPTIONS.map((option) => {
          const isSelected = (value ?? '') === option.value
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`
                relative p-6 rounded-2xl border-2 transition-all duration-200
                hover:shadow-lg hover:scale-105 text-left
                ${isSelected 
                  ? 'border-orange-500 bg-orange-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              {/* Checkbox en la esquina superior derecha */}
              <div className="absolute top-4 right-4">
                <div
                  className={`
                    w-6 h-6 rounded-md border-2 flex items-center justify-center
                    transition-all
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
              <div className="pr-8">
                <h3 className={`
                  text-xl font-bold mb-3
                  ${isSelected ? 'text-gray-800' : 'text-gray-700'}
                `}>
                  {option.label}
                </h3>
                <p className={`
                  text-sm leading-relaxed
                  ${isSelected ? 'text-gray-600' : 'text-gray-500'}
                `}>
                  {option.description}
                </p>
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
        canProceed={value?.trim().length > 0 ?? false}
        isValidating={isValidating}
        isSubmitting={isSubmitting}
      />
    </StepContainer>
  )
}
