/**
 * Floating Cart Button Component
 * 
 * Botón flotante que muestra el carrito de compras y la cantidad de items.
 * Se posiciona en la esquina inferior derecha de la pantalla.
 * 
 * @module FloatingCartButton
 */

"use client"

import { useState } from "react"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { CartDrawer } from "@/components/cart-drawer"

export function FloatingCartButton() {
  const { totalItems } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-50 flex items-center justify-center group"
        aria-label="View cart"
      >
        <ShoppingCart className="w-6 h-6" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md animate-in zoom-in">
            {totalItems}
          </span>
        )}
        
        {/* Tooltip */}
        <span className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {totalItems === 0 ? 'Cart is empty' : `${totalItems} ${totalItems === 1 ? 'plan' : 'plans'} selected`}
        </span>
      </button>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  )
}

