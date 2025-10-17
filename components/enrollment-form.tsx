"use client"

import type { EnrollmentFormState } from "@/lib/types/enrollment"
import { Step2HealthInfo, Step3Address, Step4AdditionalApplicants } from "./enrollment-steps"
import { Step5Coverage, Step6Beneficiaries, Step7HealthQuestions } from "./enrollment-steps-2"
import { Step7DynamicQuestions } from "./enrollment-step7-dynamic-questions"
import { Step8Payment, Step9Review } from "./enrollment-steps-3"
import { Step1PersonalInfo } from "./enrollment-step1-personal-info"

interface EnrollmentFormProps {
  currentStep: number
  formData: EnrollmentFormState
  updateFormData: (field: keyof EnrollmentFormState, value: any) => void
}

export function EnrollmentForm({ currentStep, formData, updateFormData }: EnrollmentFormProps) {
  return (
    <div className="space-y-6">
      {/* Step 1: ApplicationBundle Questions (NUEVO) */}
      {currentStep === 1 && (
        <Step7DynamicQuestions formData={formData} updateFormData={updateFormData} />
      )}

      {/* Step 2: Personal Information (antes Paso 1) */}
      {currentStep === 2 && (
        <Step1PersonalInfo formData={formData} updateFormData={updateFormData} />
      )}

      {/* Step 3: Health Information (antes Paso 2) */}
      {currentStep === 3 && (
        <Step2HealthInfo formData={formData} updateFormData={updateFormData} />
      )}

      {/* Step 4: Address (antes Paso 3) */}
      {currentStep === 4 && (
        <Step3Address formData={formData} updateFormData={updateFormData} />
      )}

      {/* Step 5: Additional Applicants (antes Paso 4) */}
      {currentStep === 5 && (
        <Step4AdditionalApplicants formData={formData} updateFormData={updateFormData} />
      )}

      {/* Step 6: Coverage Selection (antes Paso 5) */}
      {currentStep === 6 && (
        <Step5Coverage formData={formData} updateFormData={updateFormData} />
      )}

      {/* Step 7: Beneficiaries (antes Paso 6) */}
      {currentStep === 7 && (
        <Step6Beneficiaries formData={formData} updateFormData={updateFormData} />
      )}

      {/* Step 8: Payment Information (antes Paso 8) */}
      {currentStep === 8 && (
        <Step8Payment formData={formData} updateFormData={updateFormData} />
      )}

      {/* Step 9: Review & Confirmation (antes Paso 9) */}
      {currentStep === 9 && (
        <Step9Review formData={formData} updateFormData={updateFormData} onEditStep={() => {}} />
      )}
    </div>
  )
}
