"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { NewsletterSection } from "@/components/newsletter-section"
import { InsuranceCard } from "@/components/insurance-card"
import { InsuranceFiltersSidebar } from "@/components/insurance-filters-sidebar"
import { UserInfoSummary } from "@/components/user-info-summary"
import { ApiWarningNotification } from "@/components/api-warning-notification"
import { InsuranceEmptyState } from "@/components/insurance-empty-state"
import { EditInformationModal } from "@/components/edit-information-modal"
import { FloatingCartButton } from "@/components/floating-cart-button"
import { Button } from "@/components/ui/button"
import { InsurancePlan } from "@/lib/types/insurance"
import { useClientOnly } from "@/hooks/use-client-only"
import { Edit3 } from "lucide-react"

export default function InsuranceOptionsPage() {
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingFallbackData, setUsingFallbackData] = useState(false)
  const isClient = useClientOnly()

  // Filter states
  const [selectedPlanType, setSelectedPlanType] = useState<string>("all")
  const [selectedProductType, setSelectedProductType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("default")

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showApiWarning, setShowApiWarning] = useState(false)
  
  // Form data states
  const [formData, setFormData] = useState({
    zipCode: "",
    dateOfBirth: "",
    gender: "",
    smokes: false,
    lastTobaccoUse: "",
    coverageStartDate: "",
    paymentFrequency: ""
  })

  // Fallback static data
  const fallbackPlans: InsurancePlan[] = [
    {
      id: "1",
      name: "Accident Fixed-Benefit",
      price: 25.15,
      coverage: "$25,000/$50,000 Benefit",
      productType: "NHICSupplemental",
      benefits: ["One Time Enrollment Fee", "LIFE Association Membership"],
      allState: true,
      planType: "NICAFB",
      benefitDescription: "$25,000/$50,000 Benefit",
      brochureUrl: "https://example.com/brochures/accident-fixed-benefit.pdf"
    },
    {
      id: "2", 
      name: "Life Only - Individual",
      price: 35.50,
      coverage: "$25,000/$50,000 Benefit",
      productType: "NHICSupplemental",
      benefits: ["One Time Enrollment Fee", "LIFE Association Membership"],
      allState: true,
      planType: "Life",
      benefitDescription: "$25,000/$50,000 Benefit",
      brochureUrl: "https://example.com/brochures/life-only-individual.pdf"
    },
    {
      id: "3",
      name: "Dental Basic Plan",
      price: 18.99,
      coverage: "$1,000 Annual Maximum",
      productType: "NHICSupplemental",
      benefits: ["Preventive Care", "Basic Procedures", "Network Discounts"],
      allState: true,
      planType: "Dental",
      benefitDescription: "$1,000 Annual Maximum",
      brochureUrl: "https://example.com/brochures/dental-basic.pdf"
    },
    {
      id: "4",
      name: "Vision Essential",
      price: 12.99,
      coverage: "$150 Annual Eye Exam",
      productType: "NHICSupplemental",
      benefits: ["Eye Exams", "Glasses Discount", "Contact Lens Allowance"],
      allState: false,
      planType: "Vision",
      benefitDescription: "$150 Annual Eye Exam",
      brochureUrl: "https://example.com/brochures/vision-essential.pdf"
    },
    {
      id: "5",
      name: "Accident Premium Plan",
      price: 45.00,
      coverage: "$50,000/$100,000 Benefit",
      productType: "NHICSupplemental",
      benefits: ["Emergency Room Coverage", "Ambulance Services", "Hospital Stays"],
      allState: true,
      planType: "NICAFB",
      benefitDescription: "$50,000/$100,000 Benefit",
      brochureUrl: "https://example.com/brochures/accident-premium.pdf"
    },
    {
      id: "6",
      name: "Life Family Coverage",
      price: 55.00,
      coverage: "$100,000/$200,000 Benefit",
      productType: "NHICSupplemental",
      benefits: ["Family Coverage", "No Medical Exam", "Guaranteed Issue"],
      allState: true,
      planType: "Life",
      benefitDescription: "$100,000/$200,000 Benefit",
      brochureUrl: "https://example.com/brochures/life-family.pdf"
    },
  ]

  useEffect(() => {
    // Only run on client side to avoid hydration issues
    if (!isClient) return;

    // Try to get plans from sessionStorage first
    const storedPlans = sessionStorage.getItem('insurancePlans')
    
    if (storedPlans) {
      try {
        const plans = JSON.parse(storedPlans)
        console.log('Stored plans from sessionStorage:', plans)
        
        // If plans array is empty, use fallback data
        if (Array.isArray(plans) && plans.length === 0) {
          console.log('No plans found, using fallback data')
          setInsurancePlans(fallbackPlans)
          setUsingFallbackData(true)
        } else {
          setInsurancePlans(plans)
          setUsingFallbackData(false)
        }
        setLoading(false)
        return
      } catch (error) {
        console.error('Error parsing stored plans:', error)
      }
    }

    // If no stored plans, use fallback data
    console.log('No stored plans found, using fallback data')
    setInsurancePlans(fallbackPlans)
    setUsingFallbackData(true)
    setLoading(false)
  }, [isClient])

  // Load form data from sessionStorage
  useEffect(() => {
    if (!isClient) return;

    const storedFormData = sessionStorage.getItem('insuranceFormData')
    if (storedFormData) {
      try {
        const data = JSON.parse(storedFormData)
        console.log('Loaded form data from sessionStorage:', data)
        setFormData(data)
      } catch (error) {
        console.error('Error parsing stored form data:', error)
      }
    } else {
      console.log('No stored form data found')
    }
  }, [isClient])

  // Function to update plans with new form data
  const handleUpdateInformation = async () => {
    setIsUpdating(true)
    setError(null) // Clear previous errors

    // Log the data being sent for debugging
    console.log('=== SENDING DATA TO API ===')
    console.log('Form Data:', JSON.stringify(formData, null, 2))
    console.log('Required fields check:')
    console.log('  - zipCode:', formData.zipCode || 'MISSING')
    console.log('  - dateOfBirth:', formData.dateOfBirth || 'MISSING')
    console.log('  - gender:', formData.gender || 'MISSING')
    console.log('  - smokes:', formData.smokes)
    console.log('  - coverageStartDate:', formData.coverageStartDate || 'MISSING')
    console.log('  - paymentFrequency:', formData.paymentFrequency || 'MISSING')

    try {
      const response = await fetch('/api/insurance/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Response Error:', response.status, errorText)
        throw new Error(`Insurance API failed: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('API Response:', result)
      
      // Update sessionStorage
      if (result.plans && result.plans.length > 0) {
        sessionStorage.setItem('insurancePlans', JSON.stringify(result.plans))
        sessionStorage.setItem('insuranceFormData', JSON.stringify(formData))
        
        // Update state
        setInsurancePlans(result.plans)
        setUsingFallbackData(false)
      } else {
        // If no plans returned, use fallback data
        console.warn('No plans returned from API, using fallback data')
        sessionStorage.setItem('insuranceFormData', JSON.stringify(formData))
        setInsurancePlans(fallbackPlans)
        setUsingFallbackData(true)
      }
      
      setIsEditModalOpen(false)
      
      // Reset filters
      setSelectedPlanType("all")
      setSelectedProductType("all")
      setSortBy("default")
    } catch (error) {
      console.error('Error updating insurance quotes:', error)
      
      // Even if API fails, save the form data and use fallback plans
      console.log('Using fallback plans due to API error')
      sessionStorage.setItem('insuranceFormData', JSON.stringify(formData))
      setInsurancePlans(fallbackPlans)
      setUsingFallbackData(true)
      setIsEditModalOpen(false)
      
      // Show warning notification
      setShowApiWarning(true)
      
      // Auto-hide warning after 8 seconds
      setTimeout(() => {
        setShowApiWarning(false)
      }, 8000)
    } finally {
      setIsUpdating(false)
    }
  }

  // Filter and sort plans
  const getFilteredAndSortedPlans = () => {
    let filtered = [...insurancePlans]

    // Filter by plan type
    if (selectedPlanType !== "all") {
      filtered = filtered.filter(plan => {
        const planTypeLower = plan.planType?.toLowerCase() || ""
        
        if (selectedPlanType === "accident") {
          return planTypeLower.includes("nic") || planTypeLower.includes("afb") || planTypeLower.includes("accident")
        } else if (selectedPlanType === "life") {
          return planTypeLower.includes("life")
        } else if (selectedPlanType === "dental") {
          return planTypeLower.includes("dental")
        } else if (selectedPlanType === "vision") {
          return planTypeLower.includes("vision")
        }
        return true
      })
    }

    // Filter by product type
    if (selectedProductType !== "all") {
      filtered = filtered.filter(plan => {
        if (selectedProductType === "supplemental") {
          return plan.productType?.toLowerCase().includes("supplemental")
        } else if (selectedProductType === "primary") {
          return plan.productType?.toLowerCase().includes("primary")
        } else if (selectedProductType === "secondary") {
          return plan.productType?.toLowerCase().includes("secondary")
        }
        return true
      })
    }

    // Sort plans
    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortBy === "coverage") {
      // Sort by coverage amount (extract numbers from coverage string)
      filtered.sort((a, b) => {
        const aAmount = parseInt(a.coverage.replace(/[^0-9]/g, '')) || 0
        const bAmount = parseInt(b.coverage.replace(/[^0-9]/g, '')) || 0
        return bAmount - aAmount
      })
    } else if (sortBy === "popular") {
      // Sort by allState status (allState plans first)
      filtered.sort((a, b) => {
        if (a.allState && !b.allState) return -1
        if (!a.allState && b.allState) return 1
        return 0
      })
    }

    return filtered
  }

  const filteredPlans = getFilteredAndSortedPlans()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your insurance options...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">Error loading insurance options</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 py-12">
          {/* Page header */}
          <div className="mb-12">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Your Insurance Options</h1>
              <Button
                onClick={() => setIsEditModalOpen(true)}
                variant="outline"
                className="flex items-center gap-2 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white"
              >
                <Edit3 className="w-4 h-4" />
                Edit Information
              </Button>
            </div>
            <p className="text-gray-600 text-lg">
              Based on your information, here are the best insurance plans available in your area.
            </p>
            {/* User Information Summary */}
            <UserInfoSummary formData={formData} />
            
            {/* Fallback Data Notice */}
            {usingFallbackData && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> No specific plans were found for your criteria. Showing sample plans for demonstration purposes.
                </p>
              </div>
            )}
            
            {/* API Warning Notification */}
            <ApiWarningNotification 
              show={showApiWarning} 
              onClose={() => setShowApiWarning(false)} 
            />
          </div>

          {/* Main content with sidebar */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar Component */}
            <InsuranceFiltersSidebar
              selectedPlanType={selectedPlanType}
              selectedProductType={selectedProductType}
              sortBy={sortBy}
              onPlanTypeChange={setSelectedPlanType}
              onProductTypeChange={setSelectedProductType}
              onSortChange={setSortBy}
            />

            {/* Main content - Insurance cards grid */}
            <div className="flex-1">
              {filteredPlans.length > 0 ? (
                <>
                  <div className="mb-4">
                    <p className="text-gray-600">
                      Showing <span className="font-semibold text-gray-900">{filteredPlans.length}</span> {filteredPlans.length === 1 ? 'plan' : 'plans'}
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {filteredPlans.map((plan) => (
                      <InsuranceCard key={plan.id} plan={plan} /> 
                    ))}
                  </div>
                </>
              ) : (
                <InsuranceEmptyState
                  onClearFilters={() => {
                    setSelectedPlanType("all")
                    setSelectedProductType("all")
                    setSortBy("default")
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <NewsletterSection />
      <Footer />

      {/* Floating Cart Button */}
      <FloatingCartButton />

      {/* Edit Information Modal Component */}
      <EditInformationModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        formData={formData}
        onFormDataChange={setFormData}
        isUpdating={isUpdating}
        error={error}
        onUpdate={handleUpdateInformation}
        onQuickSave={() => {
          sessionStorage.setItem('insuranceFormData', JSON.stringify(formData))
          setIsEditModalOpen(false)
        }}
      />
    </div>
  )
}
