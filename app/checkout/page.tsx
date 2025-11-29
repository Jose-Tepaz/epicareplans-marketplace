"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { useFamilyMembers } from "@/hooks/use-family-members"
import { Shield, Trash2, ArrowLeft, CheckCircle2, Loader2, Users } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { saveExploreDataToProfile, getUserProfile } from "@/lib/api/enrollment-db"
import { getExploreDataFromSession, clearExploreDataFromSession } from "@/lib/utils/session-storage"
import { FamilyMembersManager } from "@/components/family-members-manager"
import { toast } from "sonner"
import { buildPrimaryApplicant, getUpdatedPlanPrice } from "@/lib/api/carriers/allstate-rate-cart"

import type { FamilyMember } from '@/lib/types/enrollment'

export default function CheckoutPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { items, removeItem, clearCart, totalPrice, updateItem } = useCart()
  const { membersCount, familyMembers, isInitialized: isFamilyInitialized } = useFamilyMembers()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false)
  const hasInitialCalcRef = useRef(false)
  
  const hasMultiApplicantPlans = items.some(item => {
    const meta = item.metadata as { priceUpdatedWithRateCart?: boolean } | undefined
    return meta?.priceUpdatedWithRateCart
  })
  // Estimated total applicants (primary + membersCount), just for display until Recalculation happens
  const displayTotalApplicants = membersCount + 1 

  useEffect(() => {
    if (!loading && !user) {
      console.log('❌ Usuario no autenticado, redirigiendo a login...')
      router.push('/login?redirect=/checkout&action=register-from-cart')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && !isSaving) {
      const exploreData = getExploreDataFromSession()
      
      if (exploreData) {
        setIsSaving(true)
        saveExploreDataToProfile(exploreData)
          .then(() => {
            clearExploreDataFromSession()
          })
          .catch(err => {
            console.error('❌ Error saving explore data:', err)
          })
          .finally(() => {
            setIsSaving(false)
          })
      }
    }
  }, [user, isSaving])

  const handleFamilyChange = useCallback(async (activeMembers: FamilyMember[] = []) => {
    console.log('🔄 Detectado cambio en familia (Checkout), recalculando precios...')
    console.log('👥 Miembros activos para cotización (recibidos):', activeMembers.length, activeMembers.map(m => m.id))
    setIsUpdatingPrices(true)

    try {
      let baseData: any = {}
      const storedFormData = sessionStorage.getItem("insuranceFormData")
      const exploreData = sessionStorage.getItem("explore_data") || localStorage.getItem("explore_data")
      
      if (storedFormData) {
        baseData = JSON.parse(storedFormData)
      } else if (exploreData) {
        const parsed = JSON.parse(exploreData)
        baseData = {
          zipCode: parsed.zip_code,
          dateOfBirth: parsed.date_of_birth,
          gender: parsed.gender,
          smokes: parsed.is_smoker,
        }
      }

      // Fallback to user profile if missing data
      if ((!baseData.dateOfBirth || !baseData.zipCode) && user) {
        const profile = await getUserProfile()
        if (profile) {
           baseData = {
             zipCode: baseData.zipCode || profile.zip_code,
             dateOfBirth: baseData.dateOfBirth || profile.date_of_birth,
             gender: baseData.gender || profile.gender,
             smokes: baseData.smokes ?? profile.is_smoker,
             state: profile.state // Also get state from profile
           }
        }
      }

      if (!baseData.dateOfBirth || !baseData.zipCode) {
        console.warn('⚠️ No se encontraron datos base completos para recotizar', baseData)
        // Try one last attempt with defaults or user input if possible, but for now just log
        return
      }

      // Construir Primary Applicant para Rate/Cart
      const primaryApplicant = buildPrimaryApplicant({
        dateOfBirth: baseData.dateOfBirth,
        gender: baseData.gender,
        smokes: baseData.smokes || false,
        hasPriorCoverage: false // Default
      })

      // Ensure state is present for checkout recalculation
      let state = baseData.state
      if (!state && baseData.zipCode) {
        try {
          console.log('🔍 Fetching state for Checkout Rate/Cart...')
          const res = await fetch(`/api/address/validate-zip/${baseData.zipCode}`)
          const data = await res.json()
          if (data.success && data.data?.state) {
            state = data.data.state
            console.log('✅ State fetched for checkout:', state)
          }
        } catch (e) {
          console.error('Failed to fetch state for Checkout Rate/Cart', e)
        }
      }

      // Iterar sobre los items del carrito y actualizar precio usando Rate/Cart
      let changesCount = 0
      
      for (const item of items) {
          // Solo recotizar si es un plan de Allstate (o tiene soporte Rate/Cart)
        // Asumimos que si está en el carrito, queremos intentar recotizarlo si es Allstate.
        // Verificamos por carrierSlug o allState flag
        if (item.carrierSlug === 'allstate' || item.allState) {
          console.log(`🔄 Recalculando precio para: ${item.name} (${item.id})`)
          
          // Si no hay miembros activos, intentar resetear al precio base original si está disponible
          // OJO: Rate/Cart siempre debe llamarse para obtener el precio más fresco, 
          // incluso para 1 persona (Applicant solo)
          
          const result = await getUpdatedPlanPrice(
            primaryApplicant,
            activeMembers,
            item,
            {
              zipCode: baseData.zipCode,
              state: state || 'NJ', // Fallback with improved logic
              effectiveDate: baseData.coverageStartDate,
              paymentFrequency: baseData.paymentFrequency
            }
          )

          if (result.success) {
            // Verificar si el precio o metadata cambió
            const meta = item.metadata as { applicantsIncluded?: number; originalPrice?: number } | undefined
            const currentApplicants = meta?.applicantsIncluded || 1
            const newApplicants = 1 + activeMembers.length
            
            // Lógica crítica:
            // Si activeMembers es 0, deberíamos tener el precio base (para 1 persona).
            // Si Rate/Cart devuelve algo diferente, confiamos en Rate/Cart.
            
            // Check if price OR number of applicants changed
            // Also update if we haven't tracked applicantsIncluded yet
            if (item.price !== result.price || currentApplicants !== newApplicants || meta?.applicantsIncluded === undefined) {
               console.log(`✅ Precio actualizado para ${item.name}: ${item.price} -> ${result.price} (Applicants: ${newApplicants})`)
               updateItem(item.id, {
                 price: result.price,
                 metadata: {
                   ...item.metadata,
                   originalPrice: meta?.originalPrice || (newApplicants === 1 ? result.price : item.price), // Keep oldest known or set current
                   priceUpdatedWithRateCart: true,
                   applicantsIncluded: newApplicants
                 }
               })
               changesCount++
            } else {
               console.log(`ℹ️ Precio sin cambios para ${item.name}: ${result.price}`)
            }
          } else {
            console.warn(`⚠️ No se pudo actualizar precio para ${item.name}: ${result.error}`)
          }
        }
      }

      if (changesCount > 0) {
        toast.success('Prices updated', { 
          description: `Updated prices for ${changesCount} plans based on ${activeMembers.length + 1} total applicants.` 
        })
      } else {
         console.log('✅ Prices are up to date or no changes needed')
      }

    } catch (error) {
      console.error('❌ Error updating prices:', error)
      toast.error('Error updating prices')
    } finally {
      setIsUpdatingPrices(false)
    }
  }, [items, updateItem]) 

  // Initial calculation on mount
  useEffect(() => {
    // Only run if family members are initialized, we haven't run it yet, and there are items in cart
    if (isFamilyInitialized && familyMembers.length > 0 && !hasInitialCalcRef.current && items.length > 0) {
       // IMPORTANT: Filter by included_in_quote property from DB state
       const activeMembers = familyMembers.filter(m => m.included_in_quote !== false)
       console.log('🏁 Initial checkout calculation. Total members:', familyMembers.length, 'Active members:', activeMembers.length)
       
       // Call handleFamilyChange directly with correct initial members
       handleFamilyChange(activeMembers)
       hasInitialCalcRef.current = true
    }
  }, [isFamilyInitialized, familyMembers, handleFamilyChange, items.length])

  const handleProceedToApplication = async () => {
    setIsProcessing(true)
    router.push('/enrollment')
    setIsProcessing(false)
  }

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

      <main className="flex-1 py-12 relative">
        {/* Loading Overlay for Price Updates */}
        {isUpdatingPrices && (
          <div className="absolute inset-0 bg-white/60 z-50 flex items-start pt-32 justify-center backdrop-blur-[1px] rounded-lg">
            <div className="text-center bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
              <p className="font-medium text-gray-900">Updating cart prices...</p>
              <p className="text-sm text-gray-500">Calculating based on your family selection</p>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4">
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
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <h2 className="text-2xl font-bold text-gray-900">Selected Plans ({items.length})</h2>
                  <div className="flex items-center gap-4">
                   {items.length > 0 && (
                  <div>
                    <FamilyMembersManager 
                      showTitle={true} 
                      compact={false} 
                      onMemberChange={handleFamilyChange}
                    />
                  </div>
                )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCart}
                    className="text-red-500 rounded-full hover:text-red-700 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {items.map((plan) => {
                    const meta = plan.metadata as { 
                      applicantsIncluded?: number; 
                      originalPrice?: number; 
                      priceUpdatedWithRateCart?: boolean 
                    } | undefined

                    return (
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
                              {meta?.priceUpdatedWithRateCart && (
                                <div className="mt-2 flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    <Users className="w-3 h-3 mr-1" />
                                    {meta.applicantsIncluded} applicants
                                  </Badge>
                                  {meta.originalPrice && meta.originalPrice !== plan.price && (
                                    <span className="text-xs text-gray-500 line-through">
                                      ${meta.originalPrice.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Number of Plans</span>
                    <span className="font-semibold text-gray-900">{items.length}</span>
                  </div>
                  {hasMultiApplicantPlans && (
                    <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-900 font-medium">Coverage Applicants</span>
                      </div>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {displayTotalApplicants} {displayTotalApplicants === 1 ? 'person' : 'people'}
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-gray-900 font-semibold">Total Monthly Premium</span>
                    <span className="text-3xl font-bold text-primary">${totalPrice.toFixed(2)}</span>
                  </div>
                  {hasMultiApplicantPlans && displayTotalApplicants > 1 && (
                    <div className="text-xs text-gray-600 italic">
                      Prices include coverage for all selected family members
                    </div>
                  )}
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
