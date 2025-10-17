/**
 * Application Success Page
 * 
 * Página de confirmación después de completar la aplicación de seguros.
 */

"use client"

import { useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { CheckCircle, Home, FileText } from "lucide-react"
import Link from "next/link"
import confetti from "canvas-confetti"

export default function ApplicationSuccessPage() {
  const { clearCart } = useCart()

  useEffect(() => {
    // Clear cart on success
    clearCart()

    // Confetti animation
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#4ABADB', '#FF7A45', '#10B981']
      })
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#4ABADB', '#FF7A45', '#10B981']
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }, [clearCart])

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
            <p className="text-xl text-gray-600 mb-8">
              Thank you for choosing EpiCare. We've received your insurance application.
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
              <Link href="/">
                <Button className="w-full sm:w-auto rounded-full bg-primary hover:bg-primary/90 text-white h-12 px-8 font-semibold">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full sm:w-auto rounded-full border-2 border-gray-300 h-12 px-8 font-semibold"
                onClick={() => window.print()}
              >
                <FileText className="w-4 h-4 mr-2" />
                Print Confirmation
              </Button>
            </div>

            {/* Reference Number */}
            <div className="mt-8 pt-8 border-t">
              <p className="text-sm text-gray-500 mb-1">Reference Number</p>
              <p className="text-2xl font-bold text-gray-900 font-mono">
                EC-{Date.now().toString().slice(-8)}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

