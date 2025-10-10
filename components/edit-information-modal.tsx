/**
 * Edit Information Modal Component
 * 
 * Modal para editar la información del usuario sin volver al formulario multipaso.
 * Incluye todos los campos del formulario original:
 * - ZIP Code
 * - Date of Birth
 * - Gender
 * - Smokes/Tobacco Use
 * - Coverage Start Date
 * - Payment Frequency
 * 
 * @module EditInformationModal
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit3, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { useState } from "react"

interface FormData {
  zipCode: string
  dateOfBirth: string
  gender: string
  smokes: boolean
  lastTobaccoUse: string
  coverageStartDate: string
  paymentFrequency: string
}

interface EditInformationModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  formData: FormData
  onFormDataChange: (data: FormData) => void
  isUpdating: boolean
  error: string | null
  onUpdate: () => void
  onQuickSave: () => void
}

export function EditInformationModal({
  isOpen,
  onOpenChange,
  formData,
  onFormDataChange,
  isUpdating,
  error,
  onUpdate,
  onQuickSave
}: EditInformationModalProps) {
  // Validation states
  const [zipCodeValid, setZipCodeValid] = useState<boolean | null>(null)
  const [zipCodeError, setZipCodeError] = useState("")
  const [dateOfBirthError, setDateOfBirthError] = useState("")
  const [dateOfBirthValid, setDateOfBirthValid] = useState(false)
  const [coverageStartDateError, setCoverageStartDateError] = useState("")
  const [coverageStartDateValid, setCoverageStartDateValid] = useState(false)
  const [lastTobaccoUseError, setLastTobaccoUseError] = useState("")
  const [isValidatingZip, setIsValidatingZip] = useState(false)

  // Validation functions
  const validateZipCode = async (zip: string) => {
    if (!zip || !/^\d{5}$/.test(zip)) {
      setZipCodeError("Please enter a valid 5-digit ZIP code")
      setZipCodeValid(false)
      return false
    }

    setIsValidatingZip(true)
    try {
      const response = await fetch(`/api/address/validate-zip/${zip}`)
      const data = await response.json()
      
      if (data.valid) {
        setZipCodeError("")
        setZipCodeValid(true)
        return true
      } else {
        setZipCodeError("ZIP code not found. Please enter a valid ZIP code.")
        setZipCodeValid(false)
        return false
      }
    } catch (error) {
      setZipCodeError("Error validating ZIP code. Please try again.")
      setZipCodeValid(false)
      return false
    } finally {
      setIsValidatingZip(false)
    }
  }

  const validateDateOfBirth = (date: string) => {
    if (!date) {
      setDateOfBirthError("Please enter your date of birth")
      setDateOfBirthValid(false)
      return false
    }

    const birthDate = new Date(date)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    if (age < 18) {
      setDateOfBirthError("You must be at least 18 years old")
      setDateOfBirthValid(false)
      return false
    }

    setDateOfBirthError("")
    setDateOfBirthValid(true)
    return true
  }

  const validateCoverageStartDate = (date: string) => {
    if (!date) {
      setCoverageStartDateError("Please select a coverage start date")
      setCoverageStartDateValid(false)
      return false
    }

    const startDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day

    if (startDate < today) {
      setCoverageStartDateError("Coverage start date must be today or later")
      setCoverageStartDateValid(false)
      return false
    }

    setCoverageStartDateError("")
    setCoverageStartDateValid(true)
    return true
  }

  const validateLastTobaccoUse = (date: string) => {
    if (formData.smokes && !date) {
      setLastTobaccoUseError("Please enter when you last used tobacco")
      return false
    }

    setLastTobaccoUseError("")
    return true
  }

  const updateField = (field: keyof FormData, value: any) => {
    onFormDataChange({ ...formData, [field]: value })
    
    // Clear validation errors when user starts typing
    if (field === 'zipCode') {
      setZipCodeError("")
      setZipCodeValid(null)
    } else if (field === 'dateOfBirth') {
      setDateOfBirthError("")
      setDateOfBirthValid(false)
    } else if (field === 'coverageStartDate') {
      setCoverageStartDateError("")
      setCoverageStartDateValid(false)
    } else if (field === 'lastTobaccoUse') {
      setLastTobaccoUseError("")
    }
  }

  // Validate on blur
  const handleZipCodeBlur = () => {
    if (formData.zipCode) {
      validateZipCode(formData.zipCode)
    }
  }

  const handleDateOfBirthBlur = () => {
    if (formData.dateOfBirth) {
      validateDateOfBirth(formData.dateOfBirth)
    }
  }

  const handleCoverageStartDateBlur = () => {
    if (formData.coverageStartDate) {
      validateCoverageStartDate(formData.coverageStartDate)
    }
  }

  const handleLastTobaccoUseBlur = () => {
    if (formData.smokes && formData.lastTobaccoUse) {
      validateLastTobaccoUse(formData.lastTobaccoUse)
    }
  }

  // Validate all fields before update
  const handleUpdateClick = async () => {
    let isValid = true

    // Validate all fields
    if (!(await validateZipCode(formData.zipCode))) isValid = false
    if (!validateDateOfBirth(formData.dateOfBirth)) isValid = false
    if (!validateCoverageStartDate(formData.coverageStartDate)) isValid = false
    if (formData.smokes && !validateLastTobaccoUse(formData.lastTobaccoUse)) isValid = false

    if (isValid) {
      onUpdate()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Edit3 className="w-6 h-6 text-primary" />
            Edit Your Information
          </DialogTitle>
          <DialogDescription className="text-base">
            {formData.zipCode ? (
              <>
                Update your information to see new insurance plan options
                <span className="block mt-2 text-green-600 font-semibold">
                  ✓ Your previous information has been loaded
                </span>
              </>
            ) : (
              'Update your information to see new insurance plan options'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* ZIP Code */}
          <div>
            <Label htmlFor="zipCode" className="text-gray-900 font-semibold mb-2 block">
              ZIP Code *
            </Label>
            <div className="relative">
              <Input
                id="zipCode"
                type="text"
                value={formData.zipCode}
                onChange={(e) => updateField('zipCode', e.target.value)}
                onBlur={handleZipCodeBlur}
                placeholder="Enter your ZIP Code"
                className={`h-12 ${zipCodeError ? 'border-red-500' : zipCodeValid ? 'border-green-500' : ''}`}
                maxLength={5}
              />
              {isValidatingZip && (
                <div className="absolute right-3 top-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
            </div>
            {zipCodeError && (
              <div className="flex items-center gap-2 mt-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{zipCodeError}</p>
              </div>
            )}
            {zipCodeValid && (
              <div className="flex items-center gap-2 mt-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <p className="text-sm">Valid ZIP code</p>
              </div>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <Label htmlFor="dateOfBirth" className="text-gray-900 font-semibold mb-2 block">
              Date of Birth *
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => updateField('dateOfBirth', e.target.value)}
              onBlur={handleDateOfBirthBlur}
              className={`h-12 ${dateOfBirthError ? 'border-red-500' : dateOfBirthValid ? 'border-green-500' : ''}`}
            />
            {dateOfBirthError && (
              <div className="flex items-center gap-2 mt-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{dateOfBirthError}</p>
              </div>
            )}
            {dateOfBirthValid && (
              <div className="flex items-center gap-2 mt-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <p className="text-sm">Valid date of birth</p>
              </div>
            )}
          </div>

          {/* Gender */}
          <div>
            <Label htmlFor="gender" className="text-gray-900 font-semibold mb-2 block">
              Gender *
            </Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => updateField('gender', value)}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Smokes */}
          <div>
            <Label className="text-gray-900 font-semibold mb-2 block">
              Do you currently smoke or use tobacco? *
            </Label>
            <div className="flex gap-4">
              <button
                onClick={() => updateField('smokes', true)}
                className={`flex-1 h-12 rounded-full border-2 font-semibold transition-colors ${
                  formData.smokes
                    ? "bg-primary text-white border-primary"
                    : "border-gray-300 text-gray-700 hover:border-primary"
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => {
                  onFormDataChange({ ...formData, smokes: false, lastTobaccoUse: "" })
                  setLastTobaccoUseError("")
                }}
                className={`flex-1 h-12 rounded-full border-2 font-semibold transition-colors ${
                  !formData.smokes
                    ? "bg-primary text-white border-primary"
                    : "border-gray-300 text-gray-700 hover:border-primary"
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Last Tobacco Use - Conditional */}
          {formData.smokes && (
            <div>
              <Label htmlFor="lastTobaccoUse" className="text-gray-900 font-semibold mb-2 block">
                When did you last use tobacco? *
              </Label>
              <Input
                id="lastTobaccoUse"
                type="date"
                value={formData.lastTobaccoUse}
                onChange={(e) => updateField('lastTobaccoUse', e.target.value)}
                onBlur={handleLastTobaccoUseBlur}
                className={`h-12 ${lastTobaccoUseError ? 'border-red-500' : ''}`}
              />
              {lastTobaccoUseError && (
                <div className="flex items-center gap-2 mt-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">{lastTobaccoUseError}</p>
                </div>
              )}
            </div>
          )}

          {/* Coverage Start Date */}
          <div>
            <Label htmlFor="coverageStartDate" className="text-gray-900 font-semibold mb-2 block">
              When would you like your coverage to begin? *
            </Label>
            <Input
              id="coverageStartDate"
              type="date"
              value={formData.coverageStartDate}
              onChange={(e) => updateField('coverageStartDate', e.target.value)}
              onBlur={handleCoverageStartDateBlur}
              className={`h-12 ${coverageStartDateError ? 'border-red-500' : coverageStartDateValid ? 'border-green-500' : ''}`}
            />
            {coverageStartDateError && (
              <div className="flex items-center gap-2 mt-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{coverageStartDateError}</p>
              </div>
            )}
            {coverageStartDateValid && (
              <div className="flex items-center gap-2 mt-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <p className="text-sm">Valid coverage start date</p>
              </div>
            )}
          </div>

          {/* Payment Frequency */}
          <div>
            <Label htmlFor="paymentFrequency" className="text-gray-900 font-semibold mb-2 block">
              How often would you like to make payments? *
            </Label>
            <Select
              value={formData.paymentFrequency}
              onValueChange={(value) => updateField('paymentFrequency', value)}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select payment frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="semi-annually">Semi-Annually</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-12 rounded-full"
                disabled={isUpdating || isValidatingZip}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateClick}
                className="flex-1 h-12 rounded-full bg-primary hover:bg-primary/90"
                disabled={isUpdating || isValidatingZip || !formData.zipCode || !formData.dateOfBirth || !formData.gender || !formData.coverageStartDate || !formData.paymentFrequency}
              >
                {isUpdating || isValidatingZip ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isValidatingZip ? 'Validating...' : 'Updating...'}
                  </>
                ) : (
                  'Update & Search Plans'
                )}
              </Button>
            </div>
            
            {/* Quick update button - saves data without API call */}
            <Button
              variant="outline"
              onClick={onQuickSave}
              className="w-full h-10 rounded-full text-sm border-gray-300"
              disabled={isUpdating || isValidatingZip || !formData.zipCode || !formData.dateOfBirth || !formData.gender || !formData.coverageStartDate || !formData.paymentFrequency}
            >
              💾 Save Without Searching (Quick Update)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

