"use client"

import { Progress } from "@/components/ui/progress"

interface EnrollmentProgressProps {
  currentStep: number
  totalSteps: number
  progress: number
  onStepClick: (step: number) => void
}

export function EnrollmentProgress({ 
  currentStep, 
  totalSteps, 
  progress, 
  onStepClick 
}: EnrollmentProgressProps) {
  return (
    <div className="mb-8 bg-white rounded-lg p-6 shadow-sm">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />

        {/* Step indicators */}
        <div className="grid grid-cols-9 gap-2 mt-4">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <button
              key={step}
              onClick={() => onStepClick(step)}
              className={`h-8 rounded-md text-xs font-medium transition-colors ${
                step === currentStep
                  ? 'bg-cyan text-white'
                  : step < currentStep
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
