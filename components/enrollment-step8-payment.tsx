"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { CreditCardIcon, Building2Icon } from "lucide-react"
import type { EnrollmentFormState } from "@/lib/types/enrollment"

interface Step8PaymentProps {
  formData: EnrollmentFormState
  updateFormData: (field: keyof EnrollmentFormState, value: any) => void
}

export function Step8Payment({ formData, updateFormData }: Step8PaymentProps) {
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
          <Label htmlFor="accountHolderFirstName">
            Account Holder First Name {!formData.submitWithoutPayment && '*'}
          </Label>
          <Input
            id="accountHolderFirstName"
            value={formData.accountHolderFirstName}
            onChange={(e) => updateFormData('accountHolderFirstName', e.target.value)}
            required={!formData.submitWithoutPayment}
          />
        </div>
        <div>
          <Label htmlFor="accountHolderLastName">
            Account Holder Last Name {!formData.submitWithoutPayment && '*'}
          </Label>
          <Input
            id="accountHolderLastName"
            value={formData.accountHolderLastName}
            onChange={(e) => updateFormData('accountHolderLastName', e.target.value)}
            required={!formData.submitWithoutPayment}
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
            <Label htmlFor="creditCardNumber">
              Card Number {!formData.submitWithoutPayment && '*'}
            </Label>
            <Input
              id="creditCardNumber"
              value={formData.creditCardNumber}
              onChange={(e) => updateFormData('creditCardNumber', e.target.value.replace(/\s/g, ''))}
              placeholder="1234 5678 9012 3456"
              maxLength={16}
              required={!formData.submitWithoutPayment}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="expirationMonth">
                Expiration Month {!formData.submitWithoutPayment && '*'}
              </Label>
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
              <Label htmlFor="expirationYear">
                Expiration Year {!formData.submitWithoutPayment && '*'}
              </Label>
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
              <Label htmlFor="cvv">
                CVV {!formData.submitWithoutPayment && '*'}
              </Label>
              <Input
                id="cvv"
                value={formData.cvv}
                onChange={(e) => updateFormData('cvv', e.target.value)}
                placeholder="123"
                maxLength={4}
                type="password"
                required={!formData.submitWithoutPayment}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="cardBrand">
              Card Brand {!formData.submitWithoutPayment && '*'}
            </Label>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="routingNumber">
                Routing Number {!formData.submitWithoutPayment && '*'}
              </Label>
              <Input
                id="routingNumber"
                value={formData.routingNumber}
                onChange={(e) => updateFormData('routingNumber', e.target.value)}
                placeholder="123456789"
                maxLength={9}
                required={!formData.submitWithoutPayment}
              />
            </div>
            <div>
              <Label htmlFor="accountNumber">
                Account Number {!formData.submitWithoutPayment && '*'}
              </Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => updateFormData('accountNumber', e.target.value)}
                placeholder="1234567890"
                type="password"
                required={!formData.submitWithoutPayment}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bankName">
                Bank Name {!formData.submitWithoutPayment && '*'}
              </Label>
              <Input
                id="bankName"
                value={formData.bankName}
                onChange={(e) => updateFormData('bankName', e.target.value)}
                placeholder="Chase Bank"
                required={!formData.submitWithoutPayment}
              />
            </div>
            <div>
              <Label htmlFor="accountType">
                Account Type {!formData.submitWithoutPayment && '*'}
              </Label>
              <Select value={formData.accountType} onValueChange={(value) => updateFormData('accountType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Checking">Checking</SelectItem>
                  <SelectItem value="Savings">Savings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="desiredDraftDate">
              Desired Draft Date {!formData.submitWithoutPayment && '*'}
            </Label>
            <Select value={formData.desiredDraftDate} onValueChange={(value) => updateFormData('desiredDraftDate', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select draft date" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">Day of the month for automatic payments</p>
          </div>
        </div>
      )}

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="submitWithoutPayment"
            checked={formData.submitWithoutPayment}
            onCheckedChange={(checked) => updateFormData('submitWithoutPayment', checked)}
          />
          <Label htmlFor="submitWithoutPayment" className="cursor-pointer">
            Submit application without payment (payment will be collected later)
          </Label>
        </div>
        
        {formData.submitWithoutPayment && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> When submitting without payment, all payment fields above become optional. 
              A representative will contact you to set up payment before coverage begins.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
