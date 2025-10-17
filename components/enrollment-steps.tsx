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
import { PlusIcon, TrashIcon, Edit2Icon, CreditCardIcon, Building2Icon } from "lucide-react"
import type { EnrollmentFormState, Applicant, Beneficiary, Medication } from "@/lib/types/enrollment"

// Step 2: Health Information
export function Step2HealthInfo({ formData, updateFormData }: {
  formData: EnrollmentFormState
  updateFormData: (field: keyof EnrollmentFormState, value: any) => void
}) {
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

// Step 3: Address
export function Step3Address({ formData, updateFormData }: {
  formData: EnrollmentFormState
  updateFormData: (field: keyof EnrollmentFormState, value: any) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="address1">Street Address *</Label>
        <Input
          id="address1"
          value={formData.address1}
          onChange={(e) => updateFormData('address1', e.target.value)}
          placeholder="123 Main Street"
          required
        />
      </div>

      <div>
        <Label htmlFor="address2">Apartment, suite, etc. (optional)</Label>
        <Input
          id="address2"
          value={formData.address2}
          onChange={(e) => updateFormData('address2', e.target.value)}
          placeholder="Apt 4B"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => updateFormData('city', e.target.value)}
            placeholder="New York"
            required
          />
        </div>
        <div>
          <Label htmlFor="state">State *</Label>
          <Select value={formData.state} onValueChange={(value) => updateFormData('state', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AL">Alabama</SelectItem>
              <SelectItem value="AK">Alaska</SelectItem>
              <SelectItem value="AZ">Arizona</SelectItem>
              <SelectItem value="AR">Arkansas</SelectItem>
              <SelectItem value="CA">California</SelectItem>
              <SelectItem value="CO">Colorado</SelectItem>
              <SelectItem value="CT">Connecticut</SelectItem>
              <SelectItem value="DE">Delaware</SelectItem>
              <SelectItem value="FL">Florida</SelectItem>
              <SelectItem value="GA">Georgia</SelectItem>
              <SelectItem value="HI">Hawaii</SelectItem>
              <SelectItem value="ID">Idaho</SelectItem>
              <SelectItem value="IL">Illinois</SelectItem>
              <SelectItem value="IN">Indiana</SelectItem>
              <SelectItem value="IA">Iowa</SelectItem>
              <SelectItem value="KS">Kansas</SelectItem>
              <SelectItem value="KY">Kentucky</SelectItem>
              <SelectItem value="LA">Louisiana</SelectItem>
              <SelectItem value="ME">Maine</SelectItem>
              <SelectItem value="MD">Maryland</SelectItem>
              <SelectItem value="MA">Massachusetts</SelectItem>
              <SelectItem value="MI">Michigan</SelectItem>
              <SelectItem value="MN">Minnesota</SelectItem>
              <SelectItem value="MS">Mississippi</SelectItem>
              <SelectItem value="MO">Missouri</SelectItem>
              <SelectItem value="MT">Montana</SelectItem>
              <SelectItem value="NE">Nebraska</SelectItem>
              <SelectItem value="NV">Nevada</SelectItem>
              <SelectItem value="NH">New Hampshire</SelectItem>
              <SelectItem value="NJ">New Jersey</SelectItem>
              <SelectItem value="NM">New Mexico</SelectItem>
              <SelectItem value="NY">New York</SelectItem>
              <SelectItem value="NC">North Carolina</SelectItem>
              <SelectItem value="ND">North Dakota</SelectItem>
              <SelectItem value="OH">Ohio</SelectItem>
              <SelectItem value="OK">Oklahoma</SelectItem>
              <SelectItem value="OR">Oregon</SelectItem>
              <SelectItem value="PA">Pennsylvania</SelectItem>
              <SelectItem value="RI">Rhode Island</SelectItem>
              <SelectItem value="SC">South Carolina</SelectItem>
              <SelectItem value="SD">South Dakota</SelectItem>
              <SelectItem value="TN">Tennessee</SelectItem>
              <SelectItem value="TX">Texas</SelectItem>
              <SelectItem value="UT">Utah</SelectItem>
              <SelectItem value="VT">Vermont</SelectItem>
              <SelectItem value="VA">Virginia</SelectItem>
              <SelectItem value="WA">Washington</SelectItem>
              <SelectItem value="WV">West Virginia</SelectItem>
              <SelectItem value="WI">Wisconsin</SelectItem>
              <SelectItem value="WY">Wyoming</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="zipCode">ZIP Code *</Label>
          <Input
            id="zipCode"
            value={formData.zipCode}
            onChange={(e) => updateFormData('zipCode', e.target.value)}
            placeholder="10001"
            maxLength={5}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="zipCodePlus4">ZIP+4 (optional)</Label>
        <Input
          id="zipCodePlus4"
          value={formData.zipCodePlus4}
          onChange={(e) => updateFormData('zipCodePlus4', e.target.value)}
          placeholder="1234"
          maxLength={4}
        />
      </div>
    </div>
  )
}

// Step 4: Additional Applicants
export function Step4AdditionalApplicants({ formData, updateFormData }: {
  formData: EnrollmentFormState
  updateFormData: (field: keyof EnrollmentFormState, value: any) => void
}) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newApplicant, setNewApplicant] = useState<Partial<Applicant>>({
    firstName: "",
    middleInitial: "",
    lastName: "",
    gender: "",
    dob: "",
    ssn: "",
    relationship: "Spouse",
    smoker: false,
    weight: 0,
    heightFeet: 0,
    heightInches: 0,
    hasPriorCoverage: false
  })

  const addApplicant = () => {
    if (newApplicant.firstName && newApplicant.lastName && newApplicant.dob) {
      updateFormData('additionalApplicants', [
        ...formData.additionalApplicants,
        newApplicant as Applicant
      ])
      setNewApplicant({
        firstName: "",
        middleInitial: "",
        lastName: "",
        gender: "",
        dob: "",
        ssn: "",
        relationship: "Spouse",
        smoker: false,
        weight: 0,
        heightFeet: 0,
        heightInches: 0,
        hasPriorCoverage: false
      })
      setShowAddForm(false)
    }
  }

  const removeApplicant = (index: number) => {
    updateFormData('additionalApplicants', formData.additionalApplicants.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Add spouse, children, or other dependents to this policy
        </p>
        <Button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          variant="outline"
          size="sm"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Family Member
        </Button>
      </div>

      {/* List existing additional applicants */}
      {formData.additionalApplicants.length > 0 && (
        <div className="space-y-3">
          {formData.additionalApplicants.map((applicant, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{applicant.firstName} {applicant.lastName}</h4>
                    <p className="text-sm text-gray-600">{applicant.relationship}</p>
                    <p className="text-sm text-gray-500">DOB: {new Date(applicant.dob).toLocaleDateString()}</p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeApplicant(index)}
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

      {/* Add new applicant form */}
      {showAddForm && (
        <Card className="bg-blue-50">
          <CardContent className="p-6 space-y-4">
            <h4 className="font-semibold">Add New Family Member</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input
                  value={newApplicant.firstName || ""}
                  onChange={(e) => setNewApplicant({ ...newApplicant, firstName: e.target.value })}
                  placeholder="Jane"
                />
              </div>
              <div>
                <Label>Middle Initial</Label>
                <Input
                  value={newApplicant.middleInitial || ""}
                  onChange={(e) => setNewApplicant({ ...newApplicant, middleInitial: e.target.value })}
                  placeholder="M"
                  maxLength={1}
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  value={newApplicant.lastName || ""}
                  onChange={(e) => setNewApplicant({ ...newApplicant, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Relationship *</Label>
                <Select
                  value={newApplicant.relationship}
                  onValueChange={(value) => setNewApplicant({ ...newApplicant, relationship: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Spouse">Spouse</SelectItem>
                    <SelectItem value="Child">Child</SelectItem>
                    <SelectItem value="Parent">Parent</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Gender *</Label>
                <Select
                  value={newApplicant.gender}
                  onValueChange={(value) => setNewApplicant({ ...newApplicant, gender: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date of Birth *</Label>
                <Input
                  type="date"
                  value={newApplicant.dob || ""}
                  onChange={(e) => setNewApplicant({ ...newApplicant, dob: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>SSN *</Label>
                <Input
                  type="password"
                  value={newApplicant.ssn || ""}
                  onChange={(e) => setNewApplicant({ ...newApplicant, ssn: e.target.value })}
                  placeholder="###-##-####"
                />
              </div>
              <div>
                <Label>Weight (lbs) *</Label>
                <Input
                  type="number"
                  value={newApplicant.weight || ""}
                  onChange={(e) => setNewApplicant({ ...newApplicant, weight: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Height (feet) *</Label>
                <Input
                  type="number"
                  value={newApplicant.heightFeet || ""}
                  onChange={(e) => setNewApplicant({ ...newApplicant, heightFeet: Number(e.target.value) })}
                  min="0"
                  max="8"
                />
              </div>
              <div>
                <Label>Height (inches) *</Label>
                <Input
                  type="number"
                  value={newApplicant.heightInches || ""}
                  onChange={(e) => setNewApplicant({ ...newApplicant, heightInches: Number(e.target.value) })}
                  min="0"
                  max="11"
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <Checkbox
                  id="newApplicantSmoker"
                  checked={newApplicant.smoker}
                  onCheckedChange={(checked) => setNewApplicant({ ...newApplicant, smoker: checked as boolean })}
                />
                <Label htmlFor="newApplicantSmoker" className="cursor-pointer">Smoker</Label>
              </div>
            </div>

            {newApplicant.smoker && (
              <div>
                <Label>Date Last Smoked</Label>
                <Input
                  type="date"
                  value={newApplicant.dateLastSmoked || ""}
                  onChange={(e) => setNewApplicant({ ...newApplicant, dateLastSmoked: e.target.value })}
                />
              </div>
            )}

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
                onClick={addApplicant}
              >
                Add Member
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {formData.additionalApplicants.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-gray-500">
          <p>No additional family members added</p>
          <p className="text-sm">Click "Add Family Member" to add dependents to your policy</p>
        </div>
      )}
    </div>
  )
}

// Continue with remaining steps in the next part...
