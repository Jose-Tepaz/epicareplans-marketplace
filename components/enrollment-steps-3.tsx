"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CreditCardIcon, Building2Icon, Edit2Icon, CheckCircleIcon } from "lucide-react"
import type { EnrollmentFormState } from "@/lib/types/enrollment"

// Step 8: Payment Information
export function Step8Payment({ formData, updateFormData }: {
  formData: EnrollmentFormState
  updateFormData: (field: keyof EnrollmentFormState, value: any) => void
}) {
  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Security Note:</strong> Your payment information is encrypted and processed securely. We do not store complete credit card numbers.
        </p>
      </div>

      <div>
        <Label className="text-base mb-3 block">Select Payment Method</Label>
        <RadioGroup value={formData.paymentMethod} onValueChange={(value) => updateFormData('paymentMethod', value as 'credit_card' | 'bank_account')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${formData.paymentMethod === 'credit_card' ? 'border-primary bg-blue-50' : 'border-gray-200'}`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <RadioGroupItem value="credit_card" id="credit_card" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCardIcon className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Credit/Debit Card</span>
                  </div>
                  <p className="text-sm text-gray-600">Pay with Visa, Mastercard, Discover, or Amex</p>
                </div>
              </label>
            </div>

            <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${formData.paymentMethod === 'bank_account' ? 'border-primary bg-blue-50' : 'border-gray-200'}`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <RadioGroupItem value="bank_account" id="bank_account" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2Icon className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Bank Account (ACH)</span>
                  </div>
                  <p className="text-sm text-gray-600">Direct debit from checking or savings</p>
                </div>
              </label>
            </div>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {/* Account Holder Name (for both methods) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="accountHolderFirstName">Account Holder First Name *</Label>
          <Input
            id="accountHolderFirstName"
            value={formData.accountHolderFirstName}
            onChange={(e) => updateFormData('accountHolderFirstName', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="accountHolderLastName">Account Holder Last Name *</Label>
          <Input
            id="accountHolderLastName"
            value={formData.accountHolderLastName}
            onChange={(e) => updateFormData('accountHolderLastName', e.target.value)}
            required
          />
        </div>
      </div>

      {/* Credit Card Fields */}
      {formData.paymentMethod === 'credit_card' && (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5" />
            Credit Card Information
          </h4>

          <div>
            <Label htmlFor="creditCardNumber">Card Number *</Label>
            <Input
              id="creditCardNumber"
              value={formData.creditCardNumber}
              onChange={(e) => updateFormData('creditCardNumber', e.target.value.replace(/\s/g, ''))}
              placeholder="1234 5678 9012 3456"
              maxLength={16}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="expirationMonth">Expiration Month *</Label>
              <Select value={formData.expirationMonth} onValueChange={(value) => updateFormData('expirationMonth', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                      {month.toString().padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="expirationYear">Expiration Year *</Label>
              <Select value={formData.expirationYear} onValueChange={(value) => updateFormData('expirationYear', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="YYYY" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cvv">CVV *</Label>
              <Input
                id="cvv"
                value={formData.cvv}
                onChange={(e) => updateFormData('cvv', e.target.value)}
                placeholder="123"
                maxLength={4}
                type="password"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="cardBrand">Card Brand *</Label>
            <Select value={formData.cardBrand} onValueChange={(value) => updateFormData('cardBrand', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select card brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Visa">Visa</SelectItem>
                <SelectItem value="Mastercard">Mastercard</SelectItem>
                <SelectItem value="Discover">Discover</SelectItem>
                <SelectItem value="Amex">American Express</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Bank Account Fields */}
      {formData.paymentMethod === 'bank_account' && (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold flex items-center gap-2">
            <Building2Icon className="h-5 w-5" />
            Bank Account Information
          </h4>

          <div>
            <Label htmlFor="bankName">Bank Name *</Label>
            <Input
              id="bankName"
              value={formData.bankName}
              onChange={(e) => updateFormData('bankName', e.target.value)}
              placeholder="Chase Bank"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="routingNumber">Routing Number *</Label>
              <Input
                id="routingNumber"
                value={formData.routingNumber}
                onChange={(e) => updateFormData('routingNumber', e.target.value)}
                placeholder="123456789"
                maxLength={9}
                required
              />
              <p className="text-xs text-gray-500 mt-1">9-digit number at bottom of check</p>
            </div>
            <div>
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input
                id="accountNumber"
                type="password"
                value={formData.accountNumber}
                onChange={(e) => updateFormData('accountNumber', e.target.value)}
                placeholder="Account number"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="accountType">Account Type *</Label>
              <Select value={formData.accountType} onValueChange={(value) => updateFormData('accountType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Checking</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="desiredDraftDate">Preferred Draft Date (day of month)</Label>
              <Input
                id="desiredDraftDate"
                type="number"
                min="1"
                max="28"
                value={formData.desiredDraftDate}
                onChange={(e) => updateFormData('desiredDraftDate', e.target.value)}
                placeholder="1-28"
              />
              <p className="text-xs text-gray-500 mt-1">Choose a day between 1-28</p>
            </div>
          </div>
        </div>
      )}

      <Separator />

      <div className="flex items-center gap-2">
        <Checkbox
          id="submitWithoutPayment"
          checked={formData.submitWithoutPayment}
          onCheckedChange={(checked) => updateFormData('submitWithoutPayment', checked)}
        />
        <Label htmlFor="submitWithoutPayment" className="cursor-pointer">
          Submit application without payment (defer payment setup)
        </Label>
      </div>

      {formData.submitWithoutPayment && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> You will need to set up payment before coverage can begin. A representative will contact you to complete payment setup.
          </p>
        </div>
      )}
    </div>
  )
}

// Step 9: Review and Confirmation
export function Step9Review({ formData, updateFormData, onEditStep }: {
  formData: EnrollmentFormState
  updateFormData: (field: keyof EnrollmentFormState, value: any) => void
  onEditStep: (step: number) => void
}) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Please review all information carefully before submitting.</strong> You can edit any section by clicking the "Edit" button.
        </p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Personal Information</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEditStep(1)}>
            <Edit2Icon className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <p className="font-medium">{formData.firstName} {formData.middleInitial} {formData.lastName}</p>
            </div>
            <div>
              <span className="text-gray-600">Gender:</span>
              <p className="font-medium">{formData.gender}</p>
            </div>
            <div>
              <span className="text-gray-600">Date of Birth:</span>
              <p className="font-medium">{new Date(formData.dateOfBirth).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-gray-600">SSN:</span>
              <p className="font-medium">***-**-{formData.ssn.slice(-4)}</p>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <p className="font-medium">{formData.email}</p>
            </div>
            <div>
              <span className="text-gray-600">Phone:</span>
              <p className="font-medium">{formData.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Health Information</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEditStep(2)}>
            <Edit2Icon className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Height:</span>
              <p className="font-medium">{formData.heightFeet}' {formData.heightInches}"</p>
            </div>
            <div>
              <span className="text-gray-600">Weight:</span>
              <p className="font-medium">{formData.weight} lbs</p>
            </div>
            <div>
              <span className="text-gray-600">Smoker:</span>
              <p className="font-medium">{formData.smoker ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <span className="text-gray-600">Prior Coverage:</span>
              <p className="font-medium">{formData.hasPriorCoverage ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Address</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEditStep(3)}>
            <Edit2Icon className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="text-sm">
          <p className="font-medium">{formData.address1}</p>
          {formData.address2 && <p className="font-medium">{formData.address2}</p>}
          <p className="font-medium">{formData.city}, {formData.state} {formData.zipCode}</p>
        </CardContent>
      </Card>

      {/* Additional Applicants */}
      {formData.additionalApplicants.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">Additional Family Members ({formData.additionalApplicants.length})</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEditStep(4)}>
              <Edit2Icon className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.additionalApplicants.map((applicant, index) => (
              <div key={index} className="border-b pb-2 last:border-0">
                <p className="font-medium">{applicant.firstName} {applicant.lastName}</p>
                <p className="text-sm text-gray-600">{applicant.relationship} - DOB: {new Date(applicant.dob).toLocaleDateString()}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Selected Plans */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Selected Plans</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEditStep(5)}>
            <Edit2Icon className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.selectedPlans.map((plan, index) => (
            <div key={index} className="border-b pb-3 last:border-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{plan.name}</p>
                  <p className="text-sm text-gray-600">{plan.coverage}</p>
                </div>
                <p className="font-bold text-primary">${plan.price}/mo</p>
              </div>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Monthly Premium</span>
            <span className="text-xl font-bold text-primary">
              ${formData.selectedPlans.reduce((sum, plan) => sum + plan.price, 0).toFixed(2)}
            </span>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Effective Date: {new Date(formData.effectiveDate).toLocaleDateString()}</p>
            <p>Payment Frequency: {formData.paymentFrequency}</p>
          </div>
        </CardContent>
      </Card>

      {/* Beneficiaries */}
      {formData.beneficiaries.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">Beneficiaries ({formData.beneficiaries.length})</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEditStep(6)}>
              <Edit2Icon className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.beneficiaries.map((beneficiary, index) => (
              <div key={index} className="border-b pb-2 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{beneficiary.firstName} {beneficiary.lastName}</p>
                    <p className="text-sm text-gray-600">{beneficiary.relationship}</p>
                  </div>
                  <p className="font-medium text-primary">{beneficiary.allocationPercentage}%</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Medications */}
      {formData.medications.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">Medications ({formData.medications.length})</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEditStep(7)}>
              <Edit2Icon className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {formData.medications.map((medication, index) => (
              <div key={index} className="border-b pb-2 last:border-0">
                <p className="font-medium">{medication.genericName}</p>
                <p className="text-sm text-gray-600">{medication.dosage} - {medication.frequency}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Payment Method */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Payment Method</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEditStep(8)}>
            <Edit2Icon className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="text-sm">
          <p className="font-medium mb-2">
            {formData.accountHolderFirstName} {formData.accountHolderLastName}
          </p>
          {formData.submitWithoutPayment ? (
            <p className="text-yellow-600 font-medium">Payment deferred - to be set up later</p>
          ) : (
            <>
              {formData.paymentMethod === 'credit_card' ? (
                <div>
                  <p className="text-gray-600">Credit Card ending in {formData.creditCardNumber.slice(-4)}</p>
                  <p className="text-gray-600">Expires: {formData.expirationMonth}/{formData.expirationYear}</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600">Bank Account ({formData.accountType})</p>
                  <p className="text-gray-600">{formData.bankName}</p>
                  <p className="text-gray-600">Account ending in {formData.accountNumber.slice(-4)}</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Attestation */}
      <Card className="border-2 border-primary">
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label htmlFor="signature">Electronic Signature *</Label>
            <Input
              id="signature"
              value={formData.signature}
              onChange={(e) => updateFormData('signature', e.target.value)}
              placeholder="Type your full name to sign"
              required
            />
            <p className="text-xs text-gray-500 mt-1">By typing your name, you are electronically signing this application</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Checkbox
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => updateFormData('agreeToTerms', checked)}
                className="mt-1"
              />
              <Label htmlFor="agreeToTerms" className="cursor-pointer text-sm leading-relaxed">
                I certify that all information provided in this application is true and accurate to the best of my knowledge. I understand that any misrepresentation may result in denial of claims or cancellation of my policy. I have read and agree to the{' '}
                <a href="/terms" className="text-primary underline" target="_blank">Terms and Conditions</a> and{' '}
                <a href="/privacy" className="text-primary underline" target="_blank">Privacy Policy</a>.
              </Label>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded text-xs text-gray-600">
            <p><strong>Date:</strong> {new Date(formData.signatureDate).toLocaleDateString()}</p>
            <p><strong>IP Address:</strong> Will be recorded upon submission</p>
          </div>
        </CardContent>
      </Card>

      {!formData.agreeToTerms && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Action Required:</strong> Please read and accept the terms and conditions, and sign the application to continue.
          </p>
        </div>
      )}
    </div>
  )
}
