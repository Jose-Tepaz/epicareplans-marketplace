"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

interface Plan {
  id: string
  name: string
  price: number
}

interface EnrollmentSidebarProps {
  selectedPlans: Plan[]
  totalPrice: number
}

export function EnrollmentSidebar({ selectedPlans, totalPrice }: EnrollmentSidebarProps) {
  const { user } = useAuth()
  const firstName = (user as any)?.user_metadata?.first_name || user?.email?.split("@")[0] || "Guest"
  const lastName = (user as any)?.user_metadata?.last_name || ""
  const email = user?.email || ""
  return (
    <div className="w-[450px] bg-primary text-white p-8 flex flex-col fixed h-screen">

      {/* back to checkout */}
      <div className="flex items-center gap-2 mb-4">
       
        <Link href="/checkout" className=" flex items-center gap-2 text-sm text-white/80">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to checkout</Link>
      </div>
      {/* User information */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold">{firstName} {lastName}</h2>
        <p className="text-sm text-white/80">{email}</p>
      </div>

      {/* Plans in cart */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-2xl font-bold mb-6">Plans in your cart</h3>
        <div className="space-y-4">
          {selectedPlans.map((plan, index) => (
            <div key={index} className="flex justify-between items-start border-b border-white/20 pb-4">
              <span className="font-medium">{plan.name}</span>
              <span className="font-bold">${plan.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment total */}
      <div className="mt-auto pt-6 border-t border-white/20">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">Payment total</span>
          <span className="text-3xl font-bold">
            ${totalPrice.toFixed(2)}/mo
          </span>
        </div>
      </div>
    </div>
  )
}