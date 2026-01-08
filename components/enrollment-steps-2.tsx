"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PlusIcon, TrashIcon, Edit2Icon, CreditCardIcon, Building2Icon } from "lucide-react"
import type { EnrollmentFormState, Beneficiary, Medication } from "@/lib/types/enrollment"

// Step 5: Coverage Selection
export function Step5Coverage({ formData, updateFormData }: {
  formData: EnrollmentFormState
  updateFormData: (field: keyof EnrollmentFormState, value: any) => void
}) {
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

// Step 6: Beneficiaries
export function Step6Beneficiaries({ formData, updateFormData }: {
  formData: EnrollmentFormState
  updateFormData: (field: keyof EnrollmentFormState, value: any) => void
}) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newBeneficiary, setNewBeneficiary] = useState<Partial<Beneficiary>>({
    firstName: "",
    middleName: "",
    lastName: "",
    relationship: "",
    allocationPercentage: 100,
    dateOfBirth: "",
    addresses: [{
      streetAddress: "",
      secondaryStreetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA"
    }],
    phoneNumbers: [{
      phoneNumber: "",
      phoneType: "Home",
      allowTextMessaging: false,
      allowServiceCalls: true
    }]
  })

  const addBeneficiary = () => {
    if (newBeneficiary.firstName && newBeneficiary.lastName && newBeneficiary.dateOfBirth) {
      updateFormData('beneficiaries', [
        ...formData.beneficiaries,
        newBeneficiary as Beneficiary
      ])
      setNewBeneficiary({
        firstName: "",
        middleName: "",
        lastName: "",
        relationship: "",
        allocationPercentage: 100,
        dateOfBirth: "",
        addresses: [{
          streetAddress: "",
          secondaryStreetAddress: "",
          city: "",
          state: "",
          zipCode: "",
          country: "USA"
        }],
        phoneNumbers: [{
          phoneNumber: "",
          phoneType: "Home",
          allowTextMessaging: false,
          allowServiceCalls: true
        }]
      })
      setShowAddForm(false)
    }
  }

  const removeBeneficiary = (index: number) => {
    updateFormData('beneficiaries', formData.beneficiaries.filter((_: any, i: number) => i !== index))
  }

  const totalAllocation = formData.beneficiaries.reduce((sum: number, ben: any) => sum + ben.allocationPercentage, 0)

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-600 mb-2">
          Designate who will receive benefits in case of death. Total allocation must equal 100%.
        </p>
        {formData.beneficiaries.length > 0 && (
          <p className="text-sm font-medium">
            Current Total Allocation: <span className={totalAllocation === 100 ? 'text-green-600' : 'text-red-600'}>{totalAllocation}%</span>
          </p>
        )}
      </div>

      <Button
        type="button"
        onClick={() => setShowAddForm(!showAddForm)}
        variant="outline"
        size="sm"
      >
        <PlusIcon className="h-4 w-4 mr-2" />
        Add Beneficiary
      </Button>

      {/* List existing beneficiaries */}
      {formData.beneficiaries.length > 0 && (
        <div className="space-y-3">
          {formData.beneficiaries.map((beneficiary: Beneficiary, index: number) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold">{beneficiary.firstName} {beneficiary.middleName} {beneficiary.lastName}</h4>
                    <p className="text-sm text-gray-600">Relationship: {beneficiary.relationship}</p>
                    <p className="text-sm text-gray-500">DOB: {new Date(beneficiary.dateOfBirth).toLocaleDateString()}</p>
                    <p className="text-sm font-medium text-primary mt-1">Allocation: {beneficiary.allocationPercentage}%</p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeBeneficiary(index)}
                    variant="ghost"
                    size="sm"
                  >
                    <TrashIcon className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add new beneficiary form */}
      {showAddForm && (
        <Card className="bg-blue-50">
          <CardContent className="p-6 space-y-4">
            <h4 className="font-semibold">Add New Beneficiary</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input
                  value={newBeneficiary.firstName || ""}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label>Middle Name</Label>
                <Input
                  value={newBeneficiary.middleName || ""}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, middleName: e.target.value })}
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  value={newBeneficiary.lastName || ""}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Relationship *</Label>
                <Select
                  value={newBeneficiary.relationship}
                  onValueChange={(value) => setNewBeneficiary({ ...newBeneficiary, relationship: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Spouse">Spouse</SelectItem>
                    <SelectItem value="Child">Child</SelectItem>
                    <SelectItem value="Parent">Parent</SelectItem>
                    <SelectItem value="Sibling">Sibling</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date of Birth *</Label>
                <Input
                  type="date"
                  value={newBeneficiary.dateOfBirth || ""}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, dateOfBirth: e.target.value })}
                />
              </div>
              <div>
                <Label>Allocation % *</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newBeneficiary.allocationPercentage || ""}
                  onChange={(e) => setNewBeneficiary({ ...newBeneficiary, allocationPercentage: Number(e.target.value) })}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h5 className="font-semibold text-sm">Beneficiary Address</h5>
              <div>
                <Label>Street Address *</Label>
                <Input
                  value={newBeneficiary.addresses?.[0]?.streetAddress || ""}
                  onChange={(e) => setNewBeneficiary({
                    ...newBeneficiary,
                    addresses: [{
                      ...newBeneficiary.addresses![0],
                      streetAddress: e.target.value
                    }]
                  })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>City *</Label>
                  <Input
                    value={newBeneficiary.addresses?.[0]?.city || ""}
                    onChange={(e) => setNewBeneficiary({
                      ...newBeneficiary,
                      addresses: [{
                        ...newBeneficiary.addresses![0],
                        city: e.target.value
                      }]
                    })}
                  />
                </div>
                <div>
                  <Label>State *</Label>
                  <Input
                    value={newBeneficiary.addresses?.[0]?.state || ""}
                    onChange={(e) => setNewBeneficiary({
                      ...newBeneficiary,
                      addresses: [{
                        ...newBeneficiary.addresses![0],
                        state: e.target.value
                      }]
                    })}
                    maxLength={2}
                    placeholder="NY"
                  />
                </div>
                <div>
                  <Label>ZIP Code *</Label>
                  <Input
                    value={newBeneficiary.addresses?.[0]?.zipCode || ""}
                    onChange={(e) => setNewBeneficiary({
                      ...newBeneficiary,
                      addresses: [{
                        ...newBeneficiary.addresses![0],
                        zipCode: e.target.value
                      }]
                    })}
                    maxLength={5}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Phone Number *</Label>
              <Input
                type="tel"
                value={newBeneficiary.phoneNumbers?.[0]?.phoneNumber || ""}
                onChange={(e) => setNewBeneficiary({
                  ...newBeneficiary,
                  phoneNumbers: [{
                    ...newBeneficiary.phoneNumbers![0],
                    phoneNumber: e.target.value
                  }]
                })}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                onClick={() => setShowAddForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={addBeneficiary}
              >
                Add Beneficiary
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {formData.beneficiaries.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-gray-500">
          <p>No beneficiaries added</p>
          <p className="text-sm">Click "Add Beneficiary" to designate beneficiaries</p>
        </div>
      )}
    </div>
  )
}

// Step 7: Health Questions
export function Step7HealthQuestions({ formData, updateFormData }: {
  formData: EnrollmentFormState
  updateFormData: (field: keyof EnrollmentFormState, value: any) => void
}) {
  const [showMedicationForm, setShowMedicationForm] = useState(false)
  const [newMedication, setNewMedication] = useState<Partial<Medication>>({
    genericName: "",
    originalRXDate: "",
    frequency: "",
    dosage: "",
    rxReason: "",
    isActivelyTaking: true
  })

  const addMedication = () => {
    if (newMedication.genericName && newMedication.originalRXDate) {
      updateFormData('medications', [
        ...formData.medications,
        newMedication as Medication
      ])
      setNewMedication({
        genericName: "",
        originalRXDate: "",
        frequency: "",
        dosage: "",
        rxReason: "",
        isActivelyTaking: true
      })
      setShowMedicationForm(false)
    }
  }

  const removeMedication = (index: number) => {
    updateFormData('medications', formData.medications.filter((_: any, i: number) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Important:</strong> Please answer all health questions accurately. Misrepresentation may result in claim denial or policy cancellation.
        </p>
      </div>

      <div>
        <Label className="text-base">Are you currently taking any prescription medications?</Label>
        <p className="text-sm text-gray-600 mb-4">If yes, please list all medications below</p>
      </div>

      <Button
        type="button"
        onClick={() => setShowMedicationForm(!showMedicationForm)}
        variant="outline"
        size="sm"
      >
        <PlusIcon className="h-4 w-4 mr-2" />
        Add Medication
      </Button>

      {/* List existing medications */}
      {formData.medications.length > 0 && (
        <div className="space-y-3">
          {formData.medications.map((medication: Medication, index: number) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold">{medication.genericName}</h4>
                    <p className="text-sm text-gray-600">Dosage: {medication.dosage} - {medication.frequency}</p>
                    <p className="text-sm text-gray-500">Reason: {medication.rxReason}</p>
                    <p className="text-sm text-gray-500">Prescribed: {new Date(medication.originalRXDate as string).toLocaleDateString()}</p>
                    <p className="text-sm font-medium mt-1">
                      {medication.isActivelyTaking ? (
                        <span className="text-green-600">Currently taking</span>
                      ) : (
                        <span className="text-gray-600">No longer taking</span>
                      )}
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeMedication(index)}
                    variant="ghost"
                    size="sm"
                  >
                    <TrashIcon className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add new medication form */}
      {showMedicationForm && (
        <Card className="bg-blue-50">
          <CardContent className="p-6 space-y-4">
            <h4 className="font-semibold">Add Medication</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Generic Name *</Label>
                <Input
                  value={newMedication.genericName || ""}
                  onChange={(e) => setNewMedication({ ...newMedication, genericName: e.target.value })}
                  placeholder="Lisinopril"
                />
              </div>
              <div>
                <Label>Date First Prescribed *</Label>
                <Input
                  type="date"
                  value={newMedication.originalRXDate || ""}
                  onChange={(e) => setNewMedication({ ...newMedication, originalRXDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Dosage *</Label>
                <Input
                  value={newMedication.dosage || ""}
                  onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                  placeholder="10mg"
                />
              </div>
              <div>
                <Label>Frequency *</Label>
                <Select
                  value={newMedication.frequency}
                  onValueChange={(value) => setNewMedication({ ...newMedication, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Once daily">Once daily</SelectItem>
                    <SelectItem value="Twice daily">Twice daily</SelectItem>
                    <SelectItem value="Three times daily">Three times daily</SelectItem>
                    <SelectItem value="As needed">As needed</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Reason for Medication *</Label>
              <Input
                value={newMedication.rxReason || ""}
                onChange={(e) => setNewMedication({ ...newMedication, rxReason: e.target.value })}
                placeholder="High blood pressure"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isActivelyTaking"
                checked={newMedication.isActivelyTaking}
                onCheckedChange={(checked) => setNewMedication({ ...newMedication, isActivelyTaking: checked as boolean })}
              />
              <Label htmlFor="isActivelyTaking" className="cursor-pointer">
                Currently taking this medication
              </Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                onClick={() => setShowMedicationForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={addMedication}
              >
                Add Medication
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {formData.medications.length === 0 && !showMedicationForm && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
          <p>No medications listed</p>
          <p className="text-sm">Click "Add Medication" if you are currently taking any prescription medications</p>
        </div>
      )}
    </div>
  )
}

// Continue with Step 8 and 9 in the next part...
