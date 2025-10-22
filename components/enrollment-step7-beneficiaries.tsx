"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PlusIcon, TrashIcon } from "lucide-react"
import type { EnrollmentFormState, Beneficiary } from "@/lib/types/enrollment"

interface Step7BeneficiariesProps {
  formData: EnrollmentFormState
  updateFormData: (field: keyof EnrollmentFormState, value: any) => void
}

export function Step7Beneficiaries({ formData, updateFormData }: Step7BeneficiariesProps) {
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
    updateFormData('beneficiaries', formData.beneficiaries.filter((_, i) => i !== index))
  }

  const totalAllocation = formData.beneficiaries.reduce((sum, ben) => sum + ben.allocationPercentage, 0)

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
          {formData.beneficiaries.map((beneficiary, index) => (
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
