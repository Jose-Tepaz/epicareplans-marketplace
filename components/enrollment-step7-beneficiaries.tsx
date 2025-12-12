"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusIcon, TrashIcon, UserIcon, CheckIcon, Loader2, BookmarkIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { EnrollmentFormState, Beneficiary, UserBeneficiary } from "@/lib/types/enrollment"

interface Step7BeneficiariesProps {
  formData: EnrollmentFormState
  updateFormData: (field: keyof EnrollmentFormState, value: any) => void
}

export function Step7Beneficiaries({ formData, updateFormData }: Step7BeneficiariesProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [savedBeneficiaries, setSavedBeneficiaries] = useState<UserBeneficiary[]>([])
  const [loadingSaved, setLoadingSaved] = useState(true)
  const [saveForFuture, setSaveForFuture] = useState(false)
  const supabase = createClient()

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

  // Cargar beneficiarios guardados del usuario
  useEffect(() => {
    async function loadSavedBeneficiaries() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoadingSaved(false)
          return
        }

        const { data, error } = await supabase
          .from('user_beneficiaries')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error loading saved beneficiaries:', error)
        } else {
          setSavedBeneficiaries(data || [])
        }
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoadingSaved(false)
      }
    }

    loadSavedBeneficiaries()
  }, [])

  // Verificar si un beneficiario guardado ya está agregado
  const isBeneficiarySelected = (savedId: string) => {
    return formData.beneficiaries.some((ben: Beneficiary) => ben.userBeneficiaryId === savedId)
  }

  // Agregar beneficiario guardado a la lista
  const addSavedBeneficiary = (saved: UserBeneficiary) => {
    if (isBeneficiarySelected(saved.id)) return

    const remainingAllocation = 100 - formData.beneficiaries.reduce((sum: number, ben: Beneficiary) => sum + ben.allocationPercentage, 0)
    
    const beneficiary: Beneficiary = {
      userBeneficiaryId: saved.id,
      firstName: saved.first_name,
      middleName: saved.middle_name || "",
      lastName: saved.last_name,
      relationship: saved.relationship,
      dateOfBirth: saved.date_of_birth,
      allocationPercentage: Math.min(remainingAllocation, 100),
      addresses: saved.addresses || [],
      phoneNumbers: saved.phone_numbers || []
    }

    updateFormData('beneficiaries', [...formData.beneficiaries, beneficiary])
  }

  const addBeneficiary = async () => {
    if (newBeneficiary.firstName && newBeneficiary.lastName && newBeneficiary.dateOfBirth) {
      const beneficiaryToAdd = { ...newBeneficiary } as Beneficiary

      // Si el usuario quiere guardar para el futuro
      if (saveForFuture) {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data: savedBen, error } = await supabase
              .from('user_beneficiaries')
              .insert({
                user_id: user.id,
                first_name: newBeneficiary.firstName,
                middle_name: newBeneficiary.middleName || null,
                last_name: newBeneficiary.lastName,
                relationship: newBeneficiary.relationship,
                date_of_birth: newBeneficiary.dateOfBirth,
                addresses: newBeneficiary.addresses || [],
                phone_numbers: newBeneficiary.phoneNumbers || [],
                is_active: true
              })
              .select()
              .single()

            if (error) {
              console.error('Error saving beneficiary for future:', error)
            } else if (savedBen) {
              // Agregar a la lista de guardados localmente
              setSavedBeneficiaries(prev => [savedBen, ...prev])
              // Enlazar el beneficiario agregado con el guardado
              beneficiaryToAdd.userBeneficiaryId = savedBen.id
            }
          }
        } catch (err) {
          console.error('Error:', err)
        }
      }

      updateFormData('beneficiaries', [
        ...formData.beneficiaries,
        beneficiaryToAdd
      ])
      
      // Resetear formulario
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
      setSaveForFuture(false)
      setShowAddForm(false)
    }
  }

  const removeBeneficiary = (index: number) => {
    updateFormData('beneficiaries', formData.beneficiaries.filter((_: any, i: number) => i !== index))
  }

  const updateAllocation = (index: number, newAllocation: number) => {
    const updated = formData.beneficiaries.map((ben: Beneficiary, i: number) => 
      i === index ? { ...ben, allocationPercentage: newAllocation } : ben
    )
    updateFormData('beneficiaries', updated)
  }

  const totalAllocation = formData.beneficiaries.reduce((sum: number, ben: Beneficiary) => sum + ben.allocationPercentage, 0)

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

      {/* Beneficiarios guardados */}
      {loadingSaved ? (
        <div className="flex items-center justify-center py-4 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading saved beneficiaries...
        </div>
      ) : savedBeneficiaries.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700 flex items-center gap-2">
            <BookmarkIcon className="h-4 w-4" />
            Saved Beneficiaries
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {savedBeneficiaries.map((saved) => {
              const isSelected = isBeneficiarySelected(saved.id)
              return (
                <Card 
                  key={saved.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected 
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200' 
                      : 'border-gray-200 hover:border-primary'
                  }`}
                  onClick={() => !isSelected && addSavedBeneficiary(saved)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isSelected ? 'bg-emerald-500' : 'bg-gray-100'}`}>
                          {isSelected ? (
                            <CheckIcon className="h-4 w-4 text-white" />
                          ) : (
                            <UserIcon className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {saved.first_name} {saved.middle_name} {saved.last_name}
                          </p>
                          <p className="text-sm text-gray-500">{saved.relationship}</p>
                          <p className="text-xs text-gray-400">
                            DOB: {new Date(saved.date_of_birth).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                          Added
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      <Separator />

      <Button
        type="button"
        onClick={() => setShowAddForm(!showAddForm)}
        variant="outline"
        size="sm"
      >
        <PlusIcon className="h-4 w-4 mr-2" />
        Add New Beneficiary
      </Button>

      {/* List current beneficiaries */}
      {formData.beneficiaries.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Current Beneficiaries for this Application</h4>
          {formData.beneficiaries.map((beneficiary: Beneficiary, index: number) => (
            <Card key={index} className={beneficiary.userBeneficiaryId ? 'border-emerald-300' : ''}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{beneficiary.firstName} {beneficiary.middleName} {beneficiary.lastName}</h4>
                      {beneficiary.userBeneficiaryId && (
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                          <BookmarkIcon className="h-3 w-3" />
                          Saved
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Relationship: {beneficiary.relationship}</p>
                    <p className="text-sm text-gray-500">DOB: {new Date(beneficiary.dateOfBirth).toLocaleDateString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Label className="text-sm">Allocation:</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        className="w-20 h-8"
                        value={beneficiary.allocationPercentage}
                        onChange={(e) => updateAllocation(index, Number(e.target.value))}
                      />
                      <span className="text-sm">%</span>
                    </div>
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
        <Card className="bg-blue-50 border-blue-200">
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

            <Separator />

            {/* Opción para guardar para el futuro */}
            <div className="flex items-center gap-2 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <Checkbox
                id="saveForFuture"
                checked={saveForFuture}
                onCheckedChange={(checked) => setSaveForFuture(checked === true)}
              />
              <Label htmlFor="saveForFuture" className="cursor-pointer">
                <span className="font-medium text-emerald-800">Save this beneficiary</span>
                <span className="text-emerald-600 text-sm ml-1">for future enrollments</span>
              </Label>
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
          <UserIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No beneficiaries added</p>
          <p className="text-sm">Select from saved beneficiaries above or click "Add New Beneficiary"</p>
        </div>
      )}
    </div>
  )
}
