/**
 * Paso 2 (condicional): Tipo de Seguro
 * 
 * Solo aparece cuando lookingFor === 'me'
 * 
 * Presenta 3 opciones:
 * - Life (Life Protection)
 * - Health (Medical Coverage)
 * - Supplementary (Extra Benefits)
 */

import type React from "react"
import { StepContainer } from "../StepContainer"
import { StepNavigation } from "../StepNavigation"
import { INSURANCE_TYPE_OPTIONS } from "../../constants"
import type { StepProps } from "../../types"
import { Check } from "lucide-react"

interface StepInsuranceTypeProps extends StepProps {
  value: string
  onChange: (value: string) => void
  error: string
  isValid: boolean
}

export const StepInsuranceType: React.FC<StepInsuranceTypeProps> = ({
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
      <h2 className="text-4xl md:text-5xl font-bold text-gray-700 mb-12 text-center text-balance">
        Insurance Type?
      </h2>

      {/* Grid de opciones - 3 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
        {INSURANCE_TYPE_OPTIONS.map((option) => {
          const isSelected = value === option.value
          
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`
                relative p-6 rounded-2xl border-2 transition-all duration-200
                hover:shadow-lg hover:scale-105 min-h-[200px]
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
              <div className="mt-8 text-left flex flex-col h-full">
                <h3 className={`
                  text-2xl font-bold mb-2
                  ${isSelected ? 'text-gray-800' : 'text-gray-700'}
                `}>
                  {option.label}
                </h3>
                <p className={`
                  text-sm mb-auto
                  ${isSelected ? 'text-gray-600' : 'text-gray-500'}
                `}>
                  {option.subtitle}
                </p>

                {/* Icono en la esquina inferior derecha */}
                <div className="flex justify-end items-end mt-6">
                  <div className={`
                    transition-all duration-200
                    ${isSelected ? 'opacity-100 scale-110' : 'opacity-50'}
                  `}>
                    {option.value === 'life' && (
                      <svg 
                        className={`w-12 h-12 ${isSelected ? 'text-orange-500' : 'text-gray-400'}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                        />
                      </svg>
                    )}
                    {option.value === 'health' && (
                      <svg 
                        className={`w-12 h-12 ${isSelected ? 'text-orange-500' : 'text-gray-400'}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                        />
                      </svg>
                    )}
                    {option.value === 'supplementary' && (
                      <svg 
                        className={`w-12 h-12 ${isSelected ? 'text-orange-500' : 'text-gray-400'}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                        />
                      </svg>
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
