/**
 * Application Success Page
 * 
 * Página de confirmación después de completar la aplicación de seguros.
 */

"use client"

import { useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { CheckCircle, LayoutDashboard, ShoppingBag } from "lucide-react"
import Link from "next/link"

export default function ApplicationSuccessPage() {
  const { clearCart } = useCart()
  const { user } = useAuth()
  
  const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3001'

  

  useEffect(() => {
    // Clear cart on success only once
    clearCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl p-8 md:p-12 text-center shadow-lg">
            {/* Success Icon */}
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
              <CheckCircle className="w-14 h-14 text-green-600" />
            </div>

            {/* Success Message */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Application Submitted Successfully!
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Thank you for choosing EpiCare. We've received your insurance application.
            </p>
            <p className="text-lg text-primary mb-8 font-medium">
              Visit your dashboard to track your application status and manage your policies.
            </p>

            {/* Info Box */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8 text-left">
              <h2 className="font-bold text-gray-900 mb-4 text-lg">What happens next?</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold flex-shrink-0">1.</span>
                  <span>Our team will review your application within 24-48 hours</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold flex-shrink-0">2.</span>
                  <span>You'll receive a confirmation email at your registered address</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold flex-shrink-0">3.</span>
                  <span>Once approved, your coverage will begin on your selected start date</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={dashboardUrl}>
                <Button className="w-full sm:w-auto rounded-full bg-primary hover:bg-primary/90 text-white h-12 px-8 font-semibold flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/insurance-options">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white h-12 px-8 font-semibold flex items-center justify-center"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

