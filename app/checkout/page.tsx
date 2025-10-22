/**
 * Checkout Page
 * 
 * Página de checkout donde el usuario puede revisar sus planes seleccionados
 * y proceder con la compra/aplicación.
 */

"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { Shield, Trash2, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { saveExploreDataToProfile } from "@/lib/api/enrollment-db"
import { getExploreDataFromSession, clearExploreDataFromSession } from "@/lib/utils/session-storage"

export default function CheckoutPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { items, removeItem, clearCart, totalPrice } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Verificar autenticación - si no está autenticado, redirigir a login
  useEffect(() => {
    if (!loading && !user) {
      console.log('❌ Usuario no autenticado, redirigiendo a login...')
      router.push('/login?redirect=/checkout&action=register-from-cart')
    }
  }, [user, loading, router])

  // Si viene de registro, guardar datos de explore en el perfil
  useEffect(() => {
    if (user && !isSaving) {
      const exploreData = getExploreDataFromSession()
      console.log('🔍 Checkout - User authenticated:', !!user)
      console.log('🔍 Checkout - Explore data from session:', exploreData)
      
      if (exploreData) {
        console.log('💾 Guardando datos de explore en el perfil del usuario...')
        console.log('💾 Datos a guardar:', exploreData)
        setIsSaving(true)
        saveExploreDataToProfile(exploreData)
          .then(() => {
            console.log('✅ Explore data saved to profile successfully')
            // Limpiar sessionStorage después de guardar
            clearExploreDataFromSession()
          })
          .catch(err => {
            console.error('❌ Error saving explore data:', err)
          })
          .finally(() => {
            setIsSaving(false)
          })
      } else {
        console.log('❌ No explore data found in sessionStorage')
        console.log('🔍 SessionStorage contents:', {
          explore_data: sessionStorage.getItem('explore_data'),
          insuranceFormData: sessionStorage.getItem('insuranceFormData')
        })
      }
    }
  }, [user, isSaving])

  const handleProceedToApplication = async () => {
    setIsProcessing(true)

    // Navigate to enrollment form
    router.push('/enrollment')

    setIsProcessing(false)
  }

  // Mostrar loading mientras verifica autenticación o guarda datos
  if (loading || isSaving) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-gray-600 text-lg">
              {isSaving ? 'Saving your information...' : 'Loading...'}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Si no está autenticado, no mostrar nada (ya se redirigió)
  if (!user) {
    return null
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">
              Browse our insurance plans and select the ones that fit your needs.
            </p>
            <Link href="/insurance-options">
              <Button className="rounded-full bg-primary hover:bg-primary/90 h-12 px-8">
                Browse Insurance Plans
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link href="/insurance-options" className="inline-flex items-center text-primary hover:text-primary/80 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Insurance Options
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">Checkout</h1>
            <p className="text-gray-600 text-lg">
              Review your selected insurance plans before proceeding to application.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Selected Plans */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Selected Plans ({items.length})</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-700 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </div>

                <div className="space-y-4">
                  {items.map((plan) => (
                    <div
                      key={plan.id}
                      className="border-2 border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-cyan/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Shield className="w-6 h-6 text-cyan" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg mb-1">{plan.name}</h3>
                              {plan.allState && (
                                <span className="inline-block bg-primary text-white rounded-full text-xs px-3 py-1">
                                  All state
                                </span>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(plan.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">Coverage</p>
                              <p className="text-sm text-gray-700">{plan.coverage}</p>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">Product Type</p>
                              <p className="text-sm text-gray-700">{plan.productType}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t">
                            <div>
                              <p className="text-sm text-gray-600">Monthly Premium</p>
                              <p className="text-3xl font-bold text-primary">${plan.price.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Number of Plans</span>
                    <span className="font-semibold text-gray-900">{items.length}</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-gray-900 font-semibold">Total Monthly Premium</span>
                    <span className="text-3xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Annual Total</span>
                    <span className="font-semibold">${(totalPrice * 12).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">Coverage starts when you choose</p>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">No medical exam required</p>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">Cancel anytime</p>
                  </div>
                </div>

                <Button
                  onClick={handleProceedToApplication}
                  disabled={isProcessing}
                  className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold text-lg mb-3"
                >
                  {isProcessing ? 'Processing...' : 'Proceed to Application'}
                </Button>

                <Link href="/insurance-options">
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-full border-2 border-gray-300"
                  >
                    Continue Shopping
                  </Button>
                </Link>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By proceeding, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

