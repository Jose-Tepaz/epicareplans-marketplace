"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { PlusIcon, TrashIcon } from "lucide-react"
import type { EnrollmentFormState, Applicant } from "@/lib/types/enrollment"

interface Step5AdditionalApplicantsProps {
  formData: EnrollmentFormState
  updateFormData: (field: keyof EnrollmentFormState, value: any) => void
}

export function Step5AdditionalApplicants({ formData, updateFormData }: Step5AdditionalApplicantsProps) {
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
              <div>
                <Label>Smoker?</Label>
                <Select
                  value={newApplicant.smoker ? "Yes" : "No"}
                  onValueChange={(value) => setNewApplicant({ ...newApplicant, smoker: value === "Yes" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="Yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={addApplicant} size="sm">
                Add Member
              </Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
