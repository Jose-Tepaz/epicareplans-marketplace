"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { EnrollmentFormState } from "@/lib/types/enrollment"

interface Step1PersonalInfoProps {
  formData: EnrollmentFormState
  updateFormData: (field: keyof EnrollmentFormState, value: any) => void
}

export function Step1PersonalInfo({ formData, updateFormData }: Step1PersonalInfoProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 mb-2 block">
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => updateFormData('firstName', e.target.value)}
            placeholder="John"
            required
            className={`rounded-lg bg-white border-gray-200 h-12 ${!formData.firstName.trim() ? 'border-red-300' : ''}`}
          />
        </div>
        <div>
          <Label htmlFor="middleInitial" className="text-sm font-medium text-gray-700 mb-2 block">
            Middle Initial
          </Label>
          <Input
            id="middleInitial"
            value={formData.middleInitial}
            onChange={(e) => updateFormData('middleInitial', e.target.value)}
            placeholder="M"
            maxLength={1}
            className="rounded-lg bg-white border-gray-200 h-12"
          />
        </div>
        <div>
          <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 mb-2 block">
            Last Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => updateFormData('lastName', e.target.value)}
            placeholder="Doe"
            required
            className={`rounded-lg bg-white border-gray-200 h-12 ${!formData.lastName.trim() ? 'border-red-300' : ''}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="gender" className="text-sm font-medium text-gray-700 mb-2 block">
            Gender <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.gender} onValueChange={(value) => updateFormData('gender', value)}>
            <SelectTrigger className={`rounded-lg bg-white border-gray-200 h-12 ${!formData.gender ? 'border-red-300' : ''}`}>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700 mb-2 block">
            Date of Birth <span className="text-red-500">*</span>
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
            required
            className={`rounded-lg bg-white border-gray-200 h-12 ${!formData.dateOfBirth ? 'border-red-300' : ''}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="ssn" className="text-sm font-medium text-gray-700 mb-2 block">
            Social Security Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="ssn"
            value={formData.ssn}
            onChange={(e) => updateFormData('ssn', e.target.value)}
            placeholder="###-##-####"
            type="password"
            required
            className={`rounded-lg bg-white border-gray-200 h-12 ${!formData.ssn.trim() ? 'border-red-300' : ''}`}
          />
          <p className="text-xs text-gray-500 mt-1">Must be 9 digits</p>
        </div>
        <div>
          <Label htmlFor="relationship" className="text-sm font-medium text-gray-700 mb-2 block">
            Relationship <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.relationship} onValueChange={(value) => updateFormData('relationship', value)}>
            <SelectTrigger className="rounded-lg bg-white border-gray-200 h-12">
              <SelectValue placeholder="Select relationship" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Primary">Self (Primary)</SelectItem>
              <SelectItem value="Spouse">Spouse</SelectItem>
              <SelectItem value="Child">Child</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            placeholder="john.doe@example.com"
            required
            className={`rounded-lg bg-white border-gray-200 h-12 ${!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'border-red-300' : ''}`}
          />
        </div>
        <div>
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData('phone', e.target.value)}
            placeholder="(555) 123-4567"
            required
            className={`rounded-lg bg-white border-gray-200 h-12 ${!formData.phone.trim() ? 'border-red-300' : ''}`}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="alternatePhone" className="text-sm font-medium text-gray-700 mb-2 block">
          Alternate Phone (optional)
        </Label>
        <Input
          id="alternatePhone"
          type="tel"
          value={formData.alternatePhone}
          onChange={(e) => updateFormData('alternatePhone', e.target.value)}
          placeholder="(555) 987-6543"
          className="rounded-lg bg-white border-gray-200 h-12"
        />
      </div>
    </div>
  )
}