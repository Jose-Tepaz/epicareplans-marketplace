"use client"

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
  return (
    <div className="w-[450px] bg-primary text-white p-8 flex flex-col fixed h-screen">
      {/* Logo */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold">Epicare</h2>
        <p className="text-sm text-white/80">Plans</p>
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