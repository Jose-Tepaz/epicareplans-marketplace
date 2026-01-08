"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import type { EnrollmentFormState } from "@/lib/types/enrollment"

interface Step6CoverageProps {
  formData: EnrollmentFormState
  updateFormData: (field: keyof EnrollmentFormState, value: any) => void
}

export function Step6Coverage({ formData, updateFormData }: Step6CoverageProps) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-3">Selected Plans from Cart</h4>
        <div className="space-y-3">
          {formData.selectedPlans.map((plan: any, index: number) => (
            <div key={index} className="bg-white p-4 rounded border">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-semibold">{plan.name}</h5>
                  <p className="text-sm text-gray-600">{plan.coverage}</p>
                  <p className="text-sm text-gray-500 mt-1">Plan Type: {plan.planType}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-primary">${plan.price}</p>
                  <p className="text-xs text-gray-500">per month</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between items-center">
          <span className="font-semibold">Total Monthly Premium</span>
          <span className="text-2xl font-bold text-primary">
            ${formData.selectedPlans.reduce((sum: number, plan: any) => sum + plan.price, 0).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="effectiveDate">Coverage Effective Date *</Label>
          <Input
            id="effectiveDate"
            type="date"
            value={formData.effectiveDate}
            onChange={(e) => updateFormData('effectiveDate', e.target.value)}
            required
          />
          <p className="text-xs text-gray-500 mt-1">When you want coverage to begin</p>
        </div>
        <div>
          <Label htmlFor="paymentFrequency">Payment Frequency *</Label>
          <Select value={formData.paymentFrequency} onValueChange={(value) => updateFormData('paymentFrequency', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Monthly">Monthly</SelectItem>
              <SelectItem value="Quarterly">Quarterly</SelectItem>
              <SelectItem value="Semi-Annually">Semi-Annually</SelectItem>
              <SelectItem value="Annually">Annually</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="isEFulfillment"
            checked={formData.isEFulfillment}
            onCheckedChange={(checked) => updateFormData('isEFulfillment', checked)}
          />
          <Label htmlFor="isEFulfillment" className="cursor-pointer">
            Receive documents electronically (E-Fulfillment)
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="isAutomaticLoan"
            checked={formData.isAutomaticLoanProvisionOptedIn}
            onCheckedChange={(checked) => updateFormData('isAutomaticLoanProvisionOptedIn', checked)}
          />
          <Label htmlFor="isAutomaticLoan" className="cursor-pointer">
            Opt-in to Automatic Loan Provision
          </Label>
        </div>
      </div>
    </div>
  )
}
