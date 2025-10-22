"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import type { EnrollmentFormState } from "@/lib/types/enrollment"

interface Step4AddressProps {
  formData: EnrollmentFormState
  updateFormData: (field: keyof EnrollmentFormState, value: any) => void
}

export function Step4Address({ formData, updateFormData }: Step4AddressProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [isLoadingZipInfo, setIsLoadingZipInfo] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    errors?: string[]
  } | null>(null)
  const [zipCodeInfo, setZipCodeInfo] = useState<{
    city: string
    state: string
    stateAbbreviation: string
    county: string
    deliverable: boolean
  } | null>(null)

  const getZipCodeInfo = async (zipCode: string) => {
    if (!zipCode || zipCode.length !== 5) return

    setIsLoadingZipInfo(true)
    setZipCodeInfo(null)

    try {
      const response = await fetch(`/api/address/zip-info?zipCode=${zipCode}`)
      const result = await response.json()

      if (response.ok) {
        setZipCodeInfo(result)
        // Auto-completar ciudad y estado
        updateFormData('city', result.city)
        updateFormData('state', result.stateAbbreviation)
        console.log('✅ ZIP code info loaded and fields auto-filled:', result)
      } else {
        console.log('❌ Failed to get ZIP code info:', result.error)
        setZipCodeInfo(null)
      }
    } catch (error) {
      console.error('Error getting ZIP code info:', error)
      setZipCodeInfo(null)
    } finally {
      setIsLoadingZipInfo(false)
    }
  }

  // Auto-completar cuando el componente se monta si ya hay un ZIP code
  useEffect(() => {
    if (formData.zipCode && formData.zipCode.length === 5 && !zipCodeInfo) {
      console.log('🔄 Auto-filling from pre-existing ZIP code:', formData.zipCode)
      getZipCodeInfo(formData.zipCode)
    }
  }, [formData.zipCode])

  const validateAddress = async () => {
    if (!formData.address1 || !formData.state || !formData.city || !formData.zipCode) {
      setValidationResult({
        isValid: false,
        errors: ['Please fill in all address fields before validating']
      })
      return
    }

    setIsValidating(true)
    setValidationResult(null)

    try {
      const response = await fetch('/api/address/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address1: formData.address1,
          state: formData.state,
          city: formData.city,
          zip: formData.zipCode
        })
      })

      const result = await response.json()
      setValidationResult(result)

      if (result.isValid) {
        console.log('✅ Address validation successful')
      } else {
        console.log('❌ Address validation failed:', result.errors)
      }
    } catch (error) {
      console.error('Error validating address:', error)
      setValidationResult({
        isValid: false,
        errors: ['Failed to validate address. Please try again.']
      })
    } finally {
      setIsValidating(false)
    }
  }

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
            className={zipCodeInfo ? 'bg-green-50 border-green-200' : formData.city ? 'bg-blue-50 border-blue-200' : ''}
          />
          {zipCodeInfo && (
            <div className="text-xs text-green-600 mt-1">
              Auto-filled from ZIP code
            </div>
          )}
          {formData.city && !zipCodeInfo && (
            <div className="text-xs text-blue-600 mt-1">
              Pre-filled from previous step
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="state">State *</Label>
          <Select value={formData.state} onValueChange={(value) => updateFormData('state', value)}>
            <SelectTrigger className={zipCodeInfo ? 'bg-green-50 border-green-200' : formData.state ? 'bg-blue-50 border-blue-200' : ''}>
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
          {zipCodeInfo && (
            <div className="text-xs text-green-600 mt-1">
              Auto-filled from ZIP code
            </div>
          )}
          {formData.state && !zipCodeInfo && (
            <div className="text-xs text-blue-600 mt-1">
              Pre-filled from previous step
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="zipCode">ZIP Code *</Label>
          <div className="relative">
            <Input
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '') // Solo números
                updateFormData('zipCode', value)
                
                // Auto-completar cuando se complete el ZIP code
                if (value.length === 5) {
                  getZipCodeInfo(value)
                }
              }}
              placeholder="10001"
              maxLength={5}
              required
            />
            {isLoadingZipInfo && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              </div>
            )}
          </div>
          {zipCodeInfo && (
            <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded">
              ✅ Auto-filled: {zipCodeInfo.city}, {zipCodeInfo.state} ({zipCodeInfo.county} County)
            </div>
          )}
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

      {/* Address Validation */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Address Validation</h3>
          <Button
            onClick={validateAddress}
            disabled={isValidating || !formData.address1 || !formData.state || !formData.city || !formData.zipCode}
            variant="outline"
            size="sm"
          >
            {isValidating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              'Validate Address'
            )}
          </Button>
        </div>

        {/* Validation Results */}
        {validationResult && (
          <div className="space-y-3">
            {validationResult.isValid ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  ✅ Address is valid and deliverable
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  <div className="space-y-1">
                    <p className="font-medium">Address validation failed:</p>
                    {validationResult.errors?.map((error, index) => (
                      <p key={index} className="text-sm">• {error}</p>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Help Text */}
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-800">Smart Address Auto-Fill</p>
              <p className="text-blue-700">
                <strong>Auto-completion:</strong> Enter your ZIP code and we'll automatically fill in the correct city and state.<br/>
                <strong>Validation:</strong> Use the "Validate Address" button to ensure your address is deliverable and prevent enrollment errors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
