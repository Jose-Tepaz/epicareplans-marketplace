"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit2Icon, CheckCircleIcon } from "lucide-react"
import type { EnrollmentFormState } from "@/lib/types/enrollment"

interface Step9ReviewProps {
  formData: EnrollmentFormState
  updateFormData: (field: keyof EnrollmentFormState, value: any) => void
  onEditStep: (step: number) => void
}

export function Step9Review({ formData, updateFormData, onEditStep }: Step9ReviewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Please review all information carefully before submitting.</strong> You can edit any section by clicking the "Edit" button.
        </p>
      </div>

      {/* ApplicationBundle Questions */}
      {formData.questionResponses.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg">Eligibility Questions</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEditStep(1)}>
              <Edit2Icon className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <span className="text-gray-600">Questions answered:</span>
              <p className="font-medium">{formData.questionResponses.length} questions completed</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Personal Information</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEditStep(2)}>
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
          <Button variant="ghost" size="sm" onClick={() => onEditStep(3)}>
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
          <Button variant="ghost" size="sm" onClick={() => onEditStep(4)}>
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
            <Button variant="ghost" size="sm" onClick={() => onEditStep(5)}>
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
          <Button variant="ghost" size="sm" onClick={() => onEditStep(6)}>
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
            <Button variant="ghost" size="sm" onClick={() => onEditStep(7)}>
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

      {/* Payment Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Payment Information</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEditStep(8)}>
            <Edit2Icon className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Payment Method:</span>
              <p className="font-medium">{formData.paymentMethod === 'credit_card' ? 'Credit/Debit Card' : 'Bank Account (ACH)'}</p>
            </div>
            <div>
              <span className="text-gray-600">Account Holder:</span>
              <p className="font-medium">{formData.accountHolderFirstName} {formData.accountHolderLastName}</p>
            </div>
            {formData.paymentMethod === 'credit_card' && (
              <>
                <div>
                  <span className="text-gray-600">Card Brand:</span>
                  <p className="font-medium">{formData.cardBrand}</p>
                </div>
                <div>
                  <span className="text-gray-600">Card Number:</span>
                  <p className="font-medium">**** **** **** {formData.creditCardNumber.slice(-4)}</p>
                </div>
              </>
            )}
            {formData.paymentMethod === 'bank_account' && (
              <>
                <div>
                  <span className="text-gray-600">Bank Name:</span>
                  <p className="font-medium">{formData.bankName}</p>
                </div>
                <div>
                  <span className="text-gray-600">Account Type:</span>
                  <p className="font-medium">{formData.accountType}</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-800">Terms and Conditions</h3>
            <div className="space-y-3 text-sm text-blue-700">
              <p>By submitting this application, I acknowledge that:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>All information provided is true and accurate</li>
                <li>I understand the terms and conditions of the insurance policy</li>
                <li>I authorize the collection and use of my personal information for insurance purposes</li>
                <li>I consent to electronic communications regarding this application</li>
                <li>I understand that coverage is subject to underwriting approval</li>
              </ul>
            </div>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => updateFormData('agreeToTerms', checked)}
                className="mt-1"
              />
              <label htmlFor="agreeToTerms" className="text-sm text-blue-700 cursor-pointer">
                I have read and agree to the terms and conditions above
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Confirmation */}
      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircleIcon className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-green-800">Ready to Submit</h3>
        </div>
        <p className="text-sm text-green-700 mb-4">
          All required information has been completed. Click "Submit Application" to process your enrollment.
        </p>
        <div className="text-xs text-green-600">
          <p>• Your application will be processed securely</p>
          <p>• You will receive a confirmation email</p>
          <p>• Coverage will begin on your selected effective date</p>
        </div>
      </div>
    </div>
  )
}
