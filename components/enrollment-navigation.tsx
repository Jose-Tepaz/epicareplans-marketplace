"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import type { EnrollmentFormState } from "@/lib/types/enrollment"

interface EnrollmentNavigationProps {
  currentStep: number
  totalSteps: number
  onBack: () => void
  onNext: () => void
  onSubmit: () => void
  isSubmitting: boolean
  formData: EnrollmentFormState
}

export function EnrollmentNavigation({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  isSubmitting,
  formData
}: EnrollmentNavigationProps) {
  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t">
      <div className="text-sm text-gray-600">
        Step {currentStep}/{totalSteps}
      </div>

      <div className="flex gap-4">
        {currentStep > 1 && (
          <Button
            onClick={onBack}
            disabled={isSubmitting}
            variant="outline"
            size="lg"
            className="rounded-full"
          >
            Back
          </Button>
        )}

        {currentStep < totalSteps ? (
          <Button
            onClick={onNext}
            size="lg"
            className="rounded-full bg-cyan hover:bg-cyan/90 text-white px-8"
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={onSubmit}
            size="lg"
            disabled={!formData.agreeToTerms || isSubmitting}
            className="rounded-full bg-cyan hover:bg-cyan/90 text-white px-8"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Enrollment'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
