/**
 * Paso 3 (condicional): Personalizar Cobertura de Vida
 * 
 * Solo aparece cuando:
 * - lookingFor === 'me' 
 * - insuranceType === 'life'
 * 
 * Permite al usuario:
 * - Seleccionar monto de cobertura ($10,000 - $100,000)
 * - Elegir opciones: No medical exams, Immediate activation
 */

import type React from "react"
import { useState } from "react"
import { StepContainer } from "../StepContainer"
import { StepNavigation } from "../StepNavigation"
import type { StepProps } from "../../types"
import { Check } from "lucide-react"

interface StepCustomizeLifeCoverageProps extends StepProps {
  coverageAmount: number
  onCoverageAmountChange: (amount: number) => void
  noMedicalExams: boolean
  onNoMedicalExamsChange: (checked: boolean) => void
  immediateActivation: boolean
  onImmediateActivationChange: (checked: boolean) => void
}

export const StepCustomizeLifeCoverage: React.FC<StepCustomizeLifeCoverageProps> = ({
  coverageAmount,
  onCoverageAmountChange,
  noMedicalExams,
  onNoMedicalExamsChange,
  immediateActivation,
  onImmediateActivationChange,
  onNext,
  onBack,
  isValidating,
  isSubmitting,
  currentStep,
  totalSteps,
}) => {
  // Formatear el monto como moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <StepContainer>
      {/* Icono de personas */}
      <div className="flex justify-center mb-6">
        <svg 
          className="w-16 h-16 text-orange-500"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
          />
        </svg>
      </div>

      {/* Título */}
      <h2 className="text-4xl md:text-5xl font-bold text-gray-700 mb-12 text-center text-balance">
        Customize your life coverage
      </h2>

      {/* Coverage Amount Slider */}
      <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm border border-gray-200">
        <label className="block text-sm font-medium text-orange-500 uppercase tracking-wide mb-4 text-center">
          Coverage Amount
        </label>
        
        {/* Valor actual */}
        <div className="text-5xl font-bold text-gray-800 text-center mb-6">
          {formatCurrency(coverageAmount)}
        </div>

        {/* Slider */}
        <div className="px-4">
          <input
            type="range"
            min="10000"
            max="100000"
            step="5000"
            value={coverageAmount}
            onChange={(e) => onCoverageAmountChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-orange-500
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:shadow-md
              [&::-webkit-slider-thumb]:hover:bg-orange-600
              [&::-moz-range-thumb]:w-5
              [&::-moz-range-thumb]:h-5
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-orange-500
              [&::-moz-range-thumb]:cursor-pointer
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:shadow-md
              [&::-moz-range-thumb]:hover:bg-orange-600"
          />
          
          {/* Etiquetas min/max */}
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>$10,000</span>
            <span>$100,000</span>
          </div>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* No medical exams */}
        <button
          type="button"
          onClick={() => onNoMedicalExamsChange(!noMedicalExams)}
          className="flex items-start gap-4 p-6 rounded-xl border-2 transition-all
            bg-white hover:shadow-md text-left"
        >
          <div
            className={`
              flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center
              transition-all
              ${noMedicalExams 
                ? 'bg-cyan-500 border-cyan-500' 
                : 'bg-white border-gray-300'
              }
            `}
          >
            {noMedicalExams && <Check className="w-4 h-4 text-white" />}
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-1">No medical exams</h3>
            <p className="text-sm text-gray-600">
              Your policy starts as soon as your first payment is confirmed.
            </p>
          </div>
        </button>

        {/* Immediate activation */}
        <button
          type="button"
          onClick={() => onImmediateActivationChange(!immediateActivation)}
          className="flex items-start gap-4 p-6 rounded-xl border-2 transition-all
            bg-white hover:shadow-md text-left"
        >
          <div
            className={`
              flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center
              transition-all
              ${immediateActivation 
                ? 'bg-cyan-500 border-cyan-500' 
                : 'bg-white border-gray-300'
              }
            `}
          >
            {immediateActivation && <Check className="w-4 h-4 text-white" />}
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-1">Immediate activation</h3>
            <p className="text-sm text-gray-600">
              Your policy starts as soon as your first payment is confirmed.
            </p>
          </div>
        </button>
      </div>

      {/* Navegación */}
      <StepNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={onBack}
        onNext={onNext}
        canProceed={true} // Siempre puede avanzar
        isValidating={isValidating}
        isSubmitting={isSubmitting}
      />
    </StepContainer>
  )
}
