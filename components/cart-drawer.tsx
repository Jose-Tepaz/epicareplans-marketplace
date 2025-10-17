/**
 * Cart Drawer Component
 * 
 * Drawer lateral que muestra los planes de seguro seleccionados.
 * Permite ver, gestionar y proceder al checkout con los planes.
 * 
 * @module CartDrawer
 */

"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { Shield, X, ShoppingCart, Trash2 } from "lucide-react"
import Link from "next/link"

interface CartDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function CartDrawer({ isOpen, onOpenChange }: CartDrawerProps) {
  const { items, removeItem, clearCart, totalItems, totalPrice } = useCart()

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-2xl">
            <ShoppingCart className="w-6 h-6 text-primary" />
            Your Selected Plans
          </SheetTitle>
          <SheetDescription>
            {totalItems === 0 
              ? "Your cart is empty. Select plans to compare and purchase."
              : `You have ${totalItems} ${totalItems === 1 ? 'plan' : 'plans'} selected`
            }
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No plans selected yet</p>
              <p className="text-sm text-gray-400">
                Browse plans and click "Select this plan" to add them here
              </p>
            </div>
          ) : (
            <>
              {items.map((plan) => (
                <div
                  key={plan.id}
                  className="border-2 border-gray-200 rounded-2xl p-4 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-cyan/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-cyan" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 mb-1">{plan.name}</h3>
                      {plan.allState && (
                        <Badge className="bg-primary hover:bg-primary text-white rounded-full text-xs px-2 py-0.5 mb-2">
                          All state
                        </Badge>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <p className="text-2xl font-bold text-primary">${plan.price.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">per month</p>
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
                      <p className="text-sm text-gray-600 mt-2">{plan.coverage}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button */}
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="w-full text-red-500 hover:text-red-700 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Plans
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Footer with total and checkout */}
        {items.length > 0 && (
          <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t">
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Monthly</p>
                  <p className="text-3xl font-bold text-gray-900">${totalPrice.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{totalItems} {totalItems === 1 ? 'Plan' : 'Plans'}</p>
                </div>
              </div>
              <Link href="/checkout" className="block w-full">
                <Button className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-white font-semibold text-lg">
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}

