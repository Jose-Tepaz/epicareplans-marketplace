"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCardIcon, Building2Icon, Star, Loader2, Plus, Wallet } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { EnrollmentFormState } from "@/lib/types/enrollment"

// Tipo para métodos de pago guardados
interface SavedPaymentMethod {
  id: string
  payment_method: string
  card_last_four: string | null
  card_brand: string | null
  card_expiry_month: string | null
  card_expiry_year: string | null
  card_holder_name: string | null
  account_last_four: string | null
  account_type: string | null
  bank_name: string | null
  account_holder_name: string | null
  nickname: string | null
  is_default: boolean
}

interface Step8PaymentProps {
  formData: EnrollmentFormState
  updateFormData: (field: keyof EnrollmentFormState, value: any) => void
}

export function Step8Payment({ formData, updateFormData }: Step8PaymentProps) {
  const [savedMethods, setSavedMethods] = useState<SavedPaymentMethod[]>([])
  const [loadingSavedMethods, setLoadingSavedMethods] = useState(true)
  const [selectedSavedMethod, setSelectedSavedMethod] = useState<string | null>(null)
  const [useNewMethod, setUseNewMethod] = useState(false)
  const [saveForFuture, setSaveForFuture] = useState(false)
  const supabase = createClient()

  // Cargar métodos de pago guardados del usuario
  useEffect(() => {
    async function loadSavedMethods() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoadingSavedMethods(false)
          return
        }

        const { data: methods, error } = await supabase
          .from('user_payment_methods')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error loading saved methods:', error)
        } else {
          setSavedMethods(methods || [])
          // Si hay un método default, seleccionarlo automáticamente
          const defaultMethod = methods?.find(m => m.is_default)
          if (defaultMethod && !formData.submitWithoutPayment) {
            setSelectedSavedMethod(defaultMethod.id)
            applyMethodToForm(defaultMethod)
          }
        }
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoadingSavedMethods(false)
      }
    }

    loadSavedMethods()
  }, [])

  // Aplicar un método guardado al formulario
  const applyMethodToForm = (method: SavedPaymentMethod) => {
    if (method.payment_method === 'credit_card' || method.payment_method === 'debit_card') {
      updateFormData('paymentMethod', 'credit_card')
      updateFormData('accountHolderFirstName', method.card_holder_name?.split(' ')[0] || '')
      updateFormData('accountHolderLastName', method.card_holder_name?.split(' ').slice(1).join(' ') || '')
      updateFormData('cardBrand', method.card_brand || '')
      updateFormData('expirationMonth', method.card_expiry_month || '')
      updateFormData('expirationYear', method.card_expiry_year || '')
      // Nota: No tenemos acceso al número completo ni CVV desde aquí
      // Eso se obtiene del Vault al momento de enviar
      updateFormData('creditCardNumber', `****${method.card_last_four}`)
      updateFormData('cvv', '***') // Placeholder
    } else if (method.payment_method === 'ach' || method.payment_method === 'bank_account') {
      updateFormData('paymentMethod', 'bank_account')
      updateFormData('accountHolderFirstName', method.account_holder_name?.split(' ')[0] || '')
      updateFormData('accountHolderLastName', method.account_holder_name?.split(' ').slice(1).join(' ') || '')
      updateFormData('bankName', method.bank_name || '')
      updateFormData('accountType', method.account_type || '')
      updateFormData('accountNumber', `****${method.account_last_four}`)
      updateFormData('routingNumber', '*********') // Placeholder
    }
    // Guardar el ID del método seleccionado para enviarlo al backend
    updateFormData('savedPaymentMethodId' as any, method.id)
  }

  // Manejar selección de método guardado
  const handleSelectSavedMethod = (methodId: string) => {
    setSelectedSavedMethod(methodId)
    setUseNewMethod(false)
    const method = savedMethods.find(m => m.id === methodId)
    if (method) {
      applyMethodToForm(method)
    }
  }

  // Manejar cambio a nuevo método
  const handleUseNewMethod = () => {
    setUseNewMethod(true)
    setSelectedSavedMethod(null)
    // Limpiar los campos del formulario
    updateFormData('savedPaymentMethodId' as any, null)
    updateFormData('creditCardNumber', '')
    updateFormData('cvv', '')
    updateFormData('accountNumber', '')
    updateFormData('routingNumber', '')
  }

  // Función para obtener color de marca de tarjeta
  const getCardBrandColor = (brand: string | null): string => {
    switch (brand?.toLowerCase()) {
      case 'visa': return 'bg-blue-600'
      case 'mastercard': return 'bg-orange-500'
      case 'american express': return 'bg-blue-400'
      case 'discover': return 'bg-orange-600'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Security Note:</strong> Your payment information is encrypted and processed securely. We do not store complete credit card numbers.
        </p>
      </div>

      {/* Sección de Métodos Guardados */}
      {loadingSavedMethods ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-gray-600">Loading saved payment methods...</span>
        </div>
      ) : savedMethods.length > 0 && !formData.submitWithoutPayment ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <Label className="text-base">Use a Saved Payment Method</Label>
          </div>
          
          <div className="grid gap-3">
            {savedMethods.map((method) => {
              const isCard = method.payment_method === 'credit_card' || method.payment_method === 'debit_card'
              const isSelected = selectedSavedMethod === method.id && !useNewMethod
              
              return (
                <Card 
                  key={method.id}
                  className={`cursor-pointer transition-all ${
                    isSelected 
                      ? 'ring-2 ring-primary bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectSavedMethod(method.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Indicador de selección */}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                        }`}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        
                        {/* Icono */}
                        <div className={`p-2 rounded-lg ${isCard ? 'bg-slate-100' : 'bg-emerald-100'}`}>
                          {isCard ? (
                            <CreditCardIcon className="h-5 w-5 text-slate-600" />
                          ) : (
                            <Building2Icon className="h-5 w-5 text-emerald-600" />
                          )}
                        </div>
                        
                        {/* Detalles */}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {isCard ? (
                                <>
                                  <span className={`text-xs font-bold mr-1.5 px-1.5 py-0.5 rounded text-white ${getCardBrandColor(method.card_brand)}`}>
                                    {method.card_brand?.slice(0, 4).toUpperCase() || 'CARD'}
                                  </span>
                                  •••• {method.card_last_four}
                                </>
                              ) : (
                                <>
                                  {method.bank_name || 'Bank Account'} •••• {method.account_last_four}
                                </>
                              )}
                            </span>
                            {method.is_default && (
                              <Badge variant="secondary" className="text-xs py-0 px-1.5">
                                <Star className="h-3 w-3 mr-0.5 fill-current" />
                                Default
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {isCard && method.card_expiry_month && method.card_expiry_year && (
                              <span>Expires {method.card_expiry_month}/{method.card_expiry_year}</span>
                            )}
                            {!isCard && method.account_type && (
                              <span className="capitalize">{method.account_type} Account</span>
                            )}
                          </div>
                          {method.nickname && (
                            <div className="text-xs text-emerald-600 font-medium">
                              "{method.nickname}"
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {/* Opción para usar nuevo método */}
            <Card 
              className={`cursor-pointer transition-all ${
                useNewMethod 
                  ? 'ring-2 ring-primary bg-blue-50' 
                  : 'hover:bg-gray-50 border-dashed'
              }`}
              onClick={handleUseNewMethod}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    useNewMethod ? 'border-primary bg-primary' : 'border-gray-300'
                  }`}>
                    {useNewMethod && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <Plus className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">Use a different payment method</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}

      {/* Mostrar formulario de pago si: no hay métodos guardados, o eligió usar nuevo método, o es submitWithoutPayment */}
      {(savedMethods.length === 0 || useNewMethod || formData.submitWithoutPayment) && (
        <>
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

      {/* Opción para guardar el método para uso futuro (solo si está ingresando uno nuevo) */}
      {useNewMethod && !formData.submitWithoutPayment && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <Checkbox
            id="saveForFuture"
            checked={saveForFuture}
            onCheckedChange={(checked) => {
              setSaveForFuture(checked === true)
              updateFormData('savePaymentMethod' as any, checked)
            }}
          />
          <Label htmlFor="saveForFuture" className="cursor-pointer">
            <span className="font-medium text-emerald-800">Save this payment method</span>
            <span className="text-emerald-600 text-sm ml-1">for faster checkout next time</span>
          </Label>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="submitWithoutPayment"
            checked={formData.submitWithoutPayment}
            onCheckedChange={(checked) => {
              updateFormData('submitWithoutPayment', checked)
              if (checked) {
                setSelectedSavedMethod(null)
                setUseNewMethod(false)
              }
            }}
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
        </>
      )}

      {/* Mensaje cuando hay un método guardado seleccionado */}
      {selectedSavedMethod && !useNewMethod && !formData.submitWithoutPayment && (
        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
          <p className="text-sm text-emerald-800">
            <strong>✓ Payment method selected.</strong> Your saved payment information will be used securely for this enrollment.
          </p>
        </div>
      )}
    </div>
  )
}
