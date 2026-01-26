/**
 * Paso: Personal Information
 * 
 * Recolecta información personal básica del usuario:
 * - First Name
 * - Last Name
 * - Email
 * - Phone
 */

import type React from "react"
import { Input } from "@/components/ui/input"
import { StepContainer } from "../StepContainer"
import { StepNavigation } from "../StepNavigation"
import { ValidationMessage } from "../ValidationMessage"
import type { StepProps } from "../../types"
import { FileText } from "lucide-react"

interface StepPersonalInformationProps extends StepProps {
  firstName: string
  onFirstNameChange: (value: string) => void
  lastName: string
  onLastNameChange: (value: string) => void
  email: string
  onEmailChange: (value: string) => void
  phone: string
  onPhoneChange: (value: string) => void
  errors: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
  }
  isValid: boolean
}

export const StepPersonalInformation: React.FC<StepPersonalInformationProps> = ({
  firstName,
  onFirstNameChange,
  lastName,
  onLastNameChange,
  email,
  onEmailChange,
  phone,
  onPhoneChange,
  errors,
  isValid,
  onNext,
  onBack,
  isValidating,
  isSubmitting,
  currentStep,
  totalSteps,
}) => {
  const canProceed = firstName.trim().length > 0 && 
                     lastName.trim().length > 0 && 
                     email.trim().length > 0 && 
                     phone.trim().length > 0

  return (
    <StepContainer>
      {/* Título con icono */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-shrink-0">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-700">
          Personal{" "}
          <span className="text-orange-500">Information</span>
        </h2>
      </div>

      {/* Grid de campos (2 columnas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name
          </label>
          <Input
            type="text"
            placeholder="Enter your first name"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            className={`input-epicare ${
              errors.firstName ? 'border-red-500' : ''
            }`}
          />
          {errors.firstName && (
            <ValidationMessage type="error" message={errors.firstName} />
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last name
          </label>
          <Input
            type="text"
            placeholder="Enter your last name"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            className={`input-epicare ${
              errors.lastName ? 'border-red-500' : ''
            }`}
          />
          {errors.lastName && (
            <ValidationMessage type="error" message={errors.lastName} />
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className={`input-epicare ${
              errors.email ? 'border-red-500' : ''
            }`}
          />
          {errors.email && (
            <ValidationMessage type="error" message={errors.email} />
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone
          </label>
          <Input
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className={`input-epicare ${
              errors.phone ? 'border-red-500' : ''
            }`}
          />
          {errors.phone && (
            <ValidationMessage type="error" message={errors.phone} />
          )}
        </div>
      </div>

      {/* Navegación */}
      <StepNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={onBack}
        onNext={onNext}
        canProceed={canProceed && isValid}
        isValidating={isValidating}
        isSubmitting={isSubmitting}
      />
    </StepContainer>
  )
}
