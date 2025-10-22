"use client"

import type { EnrollmentFormState } from "@/lib/types/enrollment"
import { Step1DynamicQuestions } from "./enrollment-step1-dynamic-questions"
import { Step2PersonalInfo } from "./enrollment-step2-personal-info"
import { Step3HealthInfo } from "./enrollment-step3-health-info"
import { Step4Address } from "./enrollment-step4-address"
import { Step5AdditionalApplicants } from "./enrollment-step5-additional-applicants"
import { Step6Coverage } from "./enrollment-step6-coverage"
import { Step7Beneficiaries } from "./enrollment-step7-beneficiaries"
import { Step8Payment } from "./enrollment-step8-payment"
import { Step9Review } from "./enrollment-step9-review"

interface EnrollmentFormProps {
  currentStep: number
  formData: EnrollmentFormState
  updateFormData: (field: keyof EnrollmentFormState, value: any) => void
}

export function EnrollmentForm({ currentStep, formData, updateFormData }: EnrollmentFormProps) {
  return (
    <div className="space-y-6">
      {/* Step 1: ApplicationBundle Questions */}
      {currentStep === 1 && (
        <Step1DynamicQuestions formData={formData} updateFormData={updateFormData} />
      )}

      {/* Step 2: Personal Information */}
      {currentStep === 2 && (
        <Step2PersonalInfo formData={formData} updateFormData={updateFormData} />
      )}

      {/* Step 3: Health Information */}
      {currentStep === 3 && (
        <Step3HealthInfo formData={formData} updateFormData={updateFormData} />
      )}

      {/* Step 4: Address */}
      {currentStep === 4 && (
        <Step4Address formData={formData} updateFormData={updateFormData} />
      )}

      {/* Step 5: Additional Applicants */}
      {currentStep === 5 && (
        <Step5AdditionalApplicants formData={formData} updateFormData={updateFormData} />
      )}

      {/* Step 6: Coverage Selection */}
      {currentStep === 6 && (
        <Step6Coverage formData={formData} updateFormData={updateFormData} />
      )}

      {/* Step 7: Beneficiaries */}
      {currentStep === 7 && (
        <Step7Beneficiaries formData={formData} updateFormData={updateFormData} />
      )}

      {/* Step 8: Payment Information */}
      {currentStep === 8 && (
        <Step8Payment formData={formData} updateFormData={updateFormData} />
      )}

      {/* Step 9: Review & Confirmation */}
      {currentStep === 9 && (
        <Step9Review formData={formData} updateFormData={updateFormData} onEditStep={() => {}} />
      )}
    </div>
  )
}
