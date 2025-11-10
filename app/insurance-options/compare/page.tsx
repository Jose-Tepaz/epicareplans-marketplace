"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { NewsletterSection } from "@/components/newsletter-section"
import { CompareTable } from "@/components/compare-table"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trash2, Loader2 } from "lucide-react"
import { useCompare } from "@/contexts/compare-context"
import { InsurancePlan } from "@/lib/types/insurance"

export default function ComparePage() {
  const router = useRouter()
  const { selectedPlans, clearComparison } = useCompare()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Wait for localStorage to hydrate
    const timer = setTimeout(() => {
      setLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const handleClearAll = () => {
    clearComparison()
  }

  const handleBackToPlans = () => {
    router.push('/insurance-options')
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg text-gray-600">Loading comparison...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Empty state
  if (selectedPlans.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4">
            <Button
              onClick={handleBackToPlans}
              variant="outline"
              className="mb-6 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Plans
            </Button>

            <div className="max-w-2xl mx-auto text-center py-20">
              <div className="mb-6">
                <svg
                  className="mx-auto h-24 w-24 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                No Plans Selected
              </h2>
              <p className="text-gray-600 mb-8">
                You haven't selected any plans to compare yet. Go back to the plans page and
                select up to 4 plans to compare.
              </p>
              <Button
                onClick={handleBackToPlans}
                className="bg-primary hover:bg-primary/90 text-white"
                size="lg"
              >
                Browse Plans
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Compare page with plans
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <Button
                onClick={handleBackToPlans}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Plans
              </Button>

              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Comparing <span className="font-semibold text-gray-900">{selectedPlans.length}</span> plans
                </div>
                <Button
                  onClick={handleClearAll}
                  variant="outline"
                  className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </Button>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              Compare Insurance Plans
            </h1>
            <p className="text-gray-600 text-lg">
              Side-by-side comparison of your selected plans
            </p>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <CompareTable plans={selectedPlans} />
          </div>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Select the plan that best fits your needs and click "Select this plan"
              to add it to your cart. You can also remove individual plans from the comparison by clicking
              the X button above each plan column.
            </p>
          </div>
        </div>
      </main>

      <NewsletterSection />
      <Footer />
    </div>
  )
}

