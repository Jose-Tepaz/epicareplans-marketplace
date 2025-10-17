"use client"

import { ReactNode } from "react"
import { EnrollmentSidebar } from "./enrollment-sidebar"
import { EnrollmentProgress } from "./enrollment-progress"
import { EnrollmentForm } from "./enrollment-form"
import { EnrollmentNavigation } from "./enrollment-navigation"
import type { EnrollmentFormState } from "@/lib/types/enrollment"

interface EnrollmentLayoutProps {
  currentStep: number
  totalSteps: number
  formData: EnrollmentFormState
  updateFormData: (field: keyof EnrollmentFormState, value: any) => void
  onNext: () => void
  onBack: () => void
  onStepClick: (step: number) => void
  onSubmit: () => void
  isSubmitting: boolean
  progress: number
}

export function EnrollmentLayout({
  currentStep,
  totalSteps,
  formData,
  updateFormData,
  onNext,
  onBack,
  onStepClick,
  onSubmit,
  isSubmitting,
  progress
}: EnrollmentLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar */}
      <EnrollmentSidebar 
        selectedPlans={formData.selectedPlans}
        totalPrice={formData.selectedPlans.reduce((sum, plan) => sum + plan.price, 0)}
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-[450px] bg-gray-50">
        <div className="max-w-4xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Complete your order</h1>
          </div>

          {/* Progress Bar */}
          <EnrollmentProgress 
            currentStep={currentStep}
            totalSteps={totalSteps}
            progress={progress}
            onStepClick={onStepClick}
          />

          {/* Form Steps */}
          <div className="bg-white rounded-lg p-8 shadow-sm mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {currentStep === 1 && "Account Details"}
              {currentStep === 2 && "Health Information"}
              {currentStep === 3 && "Address Information"}
              {currentStep === 4 && "Additional Family Members"}
              {currentStep === 5 && "Coverage Selection"}
              {currentStep === 6 && "Beneficiaries"}
              {currentStep === 7 && "Health Questions"}
              {currentStep === 8 && "Payment Information"}
              {currentStep === 9 && "Review & Confirm"}
            </h2>

            <EnrollmentForm 
              currentStep={currentStep}
              formData={formData}
              updateFormData={updateFormData}
            />

            {/* Navigation Buttons */}
            <EnrollmentNavigation
              currentStep={currentStep}
              totalSteps={totalSteps}
              onBack={onBack}
              onNext={onNext}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
              formData={formData}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
