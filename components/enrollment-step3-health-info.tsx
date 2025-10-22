"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import type { EnrollmentFormState } from "@/lib/types/enrollment"

interface Step3HealthInfoProps {
  formData: EnrollmentFormState
  updateFormData: (field: keyof EnrollmentFormState, value: any) => void
}

export function Step3HealthInfo({ formData, updateFormData }: Step3HealthInfoProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="weight">Weight (lbs) *</Label>
          <Input
            id="weight"
            type="number"
            value={formData.weight}
            onChange={(e) => updateFormData('weight', e.target.value)}
            placeholder="150"
            required
          />
        </div>
        <div>
          <Label htmlFor="heightFeet">Height (feet) *</Label>
          <Input
            id="heightFeet"
            type="number"
            value={formData.heightFeet}
            onChange={(e) => updateFormData('heightFeet', e.target.value)}
            placeholder="5"
            min="0"
            max="8"
            required
          />
        </div>
        <div>
          <Label htmlFor="heightInches">Height (inches) *</Label>
          <Input
            id="heightInches"
            type="number"
            value={formData.heightInches}
            onChange={(e) => updateFormData('heightInches', e.target.value)}
            placeholder="10"
            min="0"
            max="11"
            required
          />
        </div>
      </div>

      <div>
        <Label>Do you currently smoke or use tobacco? *</Label>
        <div className="flex gap-4 mt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="smoker"
              checked={formData.smoker === true}
              onChange={() => updateFormData('smoker', true)}
              className="w-4 h-4"
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="smoker"
              checked={formData.smoker === false}
              onChange={() => updateFormData('smoker', false)}
              className="w-4 h-4"
            />
            <span>No</span>
          </label>
        </div>
      </div>

      {formData.smoker && (
        <div>
          <Label htmlFor="dateLastSmoked">Date Last Smoked *</Label>
          <Input
            id="dateLastSmoked"
            type="date"
            value={formData.dateLastSmoked}
            onChange={(e) => updateFormData('dateLastSmoked', e.target.value)}
            required
          />
        </div>
      )}

      <div>
        <Label>Do you have prior health coverage?</Label>
        <div className="flex gap-4 mt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="hasPriorCoverage"
              checked={formData.hasPriorCoverage === true}
              onChange={() => updateFormData('hasPriorCoverage', true)}
              className="w-4 h-4"
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="hasPriorCoverage"
              checked={formData.hasPriorCoverage === false}
              onChange={() => updateFormData('hasPriorCoverage', false)}
              className="w-4 h-4"
            />
            <span>No</span>
          </label>
        </div>
      </div>

      <Separator />

      <div>
        <Label>Do you have Medicare coverage?</Label>
        <div className="flex gap-4 mt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="hasMedicare"
              checked={formData.hasMedicare === true}
              onChange={() => updateFormData('hasMedicare', true)}
              className="w-4 h-4"
            />
            <span>Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="hasMedicare"
              checked={formData.hasMedicare === false}
              onChange={() => updateFormData('hasMedicare', false)}
              className="w-4 h-4"
            />
            <span>No</span>
          </label>
        </div>
      </div>

      {formData.hasMedicare && (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold">Medicare Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="medicarePartA">Medicare Part A Effective Date</Label>
              <Input
                id="medicarePartA"
                type="date"
                value={formData.medicarePartAEffectiveDate}
                onChange={(e) => updateFormData('medicarePartAEffectiveDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="medicarePartB">Medicare Part B Effective Date</Label>
              <Input
                id="medicarePartB"
                type="date"
                value={formData.medicarePartBEffectiveDate}
                onChange={(e) => updateFormData('medicarePartBEffectiveDate', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="medicareId">Medicare ID</Label>
              <Input
                id="medicareId"
                value={formData.medicareId}
                onChange={(e) => updateFormData('medicareId', e.target.value)}
                placeholder="1EG4-TE5-MK73"
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <Checkbox
                id="isPreMACRA"
                checked={formData.isPreMACRAEligible}
                onCheckedChange={(checked) => updateFormData('isPreMACRAEligible', checked)}
              />
              <Label htmlFor="isPreMACRA" className="cursor-pointer">Is Pre-MACRA Eligible</Label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
