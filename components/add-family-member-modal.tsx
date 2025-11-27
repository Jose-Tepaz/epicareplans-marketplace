"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import type { FamilyMember } from '@/lib/types/enrollment'

interface AddFamilyMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (member: Omit<FamilyMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  editMember?: FamilyMember | null
}

export function AddFamilyMemberModal({ isOpen, onClose, onSave, editMember }: AddFamilyMemberModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Omit<FamilyMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>>({
    first_name: editMember?.first_name || '',
    middle_initial: editMember?.middle_initial || '',
    last_name: editMember?.last_name || '',
    gender: editMember?.gender || '',
    date_of_birth: editMember?.date_of_birth || '',
    ssn: editMember?.ssn || '',
    relationship: editMember?.relationship || 'Spouse',
    smoker: editMember?.smoker || false,
    date_last_smoked: editMember?.date_last_smoked || '',
    weight: editMember?.weight || undefined,
    height_feet: editMember?.height_feet || undefined,
    height_inches: editMember?.height_inches || undefined,
    has_prior_coverage: editMember?.has_prior_coverage || false
  })

  const updateField = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = (): string[] => {
    const errors: string[] = []

    if (!formData.first_name.trim()) errors.push('First name is required')
    if (!formData.last_name.trim()) errors.push('Last name is required')
    if (!formData.gender) errors.push('Gender is required')
    if (!formData.date_of_birth) errors.push('Date of birth is required')
    if (!formData.relationship) errors.push('Relationship is required')
    
    // Validar SSN si se proporciona
    if (formData.ssn && formData.ssn.replace(/\D/g, '').length !== 9) {
      errors.push('SSN must be 9 digits')
    }

    // Validar fecha de nacimiento
    if (formData.date_of_birth) {
      const dob = new Date(formData.date_of_birth)
      const today = new Date()
      if (dob > today) {
        errors.push('Date of birth cannot be in the future')
      }
    }

    return errors
  }

  const handleSubmit = async () => {
    const errors = validateForm()
    
    if (errors.length > 0) {
      toast.error('Validation errors', {
        description: errors.join(', ')
      })
      return
    }

    setIsSubmitting(true)

    try {
      await onSave(formData)
      toast.success(editMember ? 'Family member updated' : 'Family member added')
      onClose()
      
      // Reset form
      setFormData({
        first_name: '',
        middle_initial: '',
        last_name: '',
        gender: '',
        date_of_birth: '',
        ssn: '',
        relationship: 'Spouse',
        smoker: false,
        date_last_smoked: '',
        weight: undefined,
        height_feet: undefined,
        height_inches: undefined,
        has_prior_coverage: false
      })
    } catch (error) {
      toast.error('Error saving family member', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editMember ? 'Edit Family Member' : 'Add Family Member'}</DialogTitle>
          <DialogDescription>
            {editMember 
              ? 'Update the information for this family member'
              : 'Add a family member to include them in your insurance coverage and pricing'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Personal Information */}
          <div>
            <h4 className="font-semibold mb-4">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => updateField('first_name', e.target.value)}
                  placeholder="Jane"
                />
              </div>
              <div>
                <Label>Middle Initial</Label>
                <Input
                  value={formData.middle_initial}
                  onChange={(e) => updateField('middle_initial', e.target.value)}
                  placeholder="M"
                  maxLength={1}
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => updateField('last_name', e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>
          </div>

          {/* Demographics */}
          <div>
            <h4 className="font-semibold mb-4">Demographics</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Relationship *</Label>
                <Select
                  value={formData.relationship}
                  onValueChange={(value) => updateField('relationship', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Spouse">Spouse</SelectItem>
                    <SelectItem value="Child">Child</SelectItem>
                    <SelectItem value="Parent">Parent</SelectItem>
                    <SelectItem value="Dependent">Dependent</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => updateField('gender', value)}
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
                  value={formData.date_of_birth}
                  onChange={(e) => updateField('date_of_birth', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* SSN */}
          <div>
            <h4 className="font-semibold mb-4">Identification</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>SSN (Optional)</Label>
                <Input
                  type="password"
                  value={formData.ssn}
                  onChange={(e) => updateField('ssn', e.target.value)}
                  placeholder="###-##-####"
                />
                <p className="text-xs text-gray-500 mt-1">Can be provided later during enrollment</p>
              </div>
            </div>
          </div>

          {/* Health Information */}
          <div>
            <h4 className="font-semibold mb-4">Health Information</h4>
            
            {/* Weight & Height */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label>Weight (lbs)</Label>
                <Input
                  type="number"
                  value={formData.weight || ''}
                  onChange={(e) => updateField('weight', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="150"
                />
              </div>
              <div>
                <Label>Height (feet)</Label>
                <Input
                  type="number"
                  value={formData.height_feet || ''}
                  onChange={(e) => updateField('height_feet', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="5"
                  min="3"
                  max="8"
                />
              </div>
              <div>
                <Label>Height (inches)</Label>
                <Input
                  type="number"
                  value={formData.height_inches || ''}
                  onChange={(e) => updateField('height_inches', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="8"
                  min="0"
                  max="11"
                />
              </div>
            </div>

            {/* Smoker */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="smoker"
                  checked={formData.smoker}
                  onCheckedChange={(checked) => updateField('smoker', checked)}
                />
                <Label htmlFor="smoker" className="cursor-pointer">
                  Smoker or tobacco user
                </Label>
              </div>

              {formData.smoker && (
                <div className="ml-6">
                  <Label>Date Last Smoked</Label>
                  <Input
                    type="date"
                    value={formData.date_last_smoked || ''}
                    onChange={(e) => updateField('date_last_smoked', e.target.value)}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_prior_coverage"
                  checked={formData.has_prior_coverage}
                  onCheckedChange={(checked) => updateField('has_prior_coverage', checked)}
                />
                <Label htmlFor="has_prior_coverage" className="cursor-pointer">
                  Has prior insurance coverage
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : editMember ? 'Update' : 'Add Family Member'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

