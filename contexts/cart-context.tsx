/**
 * Cart Context
 * 
 * Context global para manejar el carrito de compras de planes de seguro.
 * Permite agregar, remover y gestionar múltiples planes seleccionados.
 * 
 * @module CartContext
 */

"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { InsurancePlan } from "@/lib/types/insurance"

interface CartContextType {
  items: InsurancePlan[]
  addItem: (plan: InsurancePlan) => void
  removeItem: (planId: string) => void
  clearCart: () => void
  isInCart: (planId: string) => boolean
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<InsurancePlan[]>([])
  const [isClient, setIsClient] = useState(false)

  // Set client-side flag
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load cart from localStorage on mount
  useEffect(() => {
    if (isClient) {
      const savedCart = localStorage.getItem('insuranceCart')
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart)
          setItems(parsedCart)
          console.log('Cart loaded from localStorage:', parsedCart)
        } catch (error) {
          console.error('Error loading cart:', error)
        }
      }
    }
  }, [isClient])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isClient && items.length >= 0) {
      localStorage.setItem('insuranceCart', JSON.stringify(items))
      console.log('Cart saved to localStorage:', items)
    }
  }, [items, isClient])

  const addItem = (plan: InsurancePlan) => {
    setItems((prevItems) => {
      // Check if item already exists
      const exists = prevItems.find((item) => item.id === plan.id)
      if (exists) {
        console.log('Plan already in cart:', plan.name)
        return prevItems
      }
      console.log('Adding plan to cart:', plan.name)
      return [...prevItems, plan]
    })
  }

  const removeItem = (planId: string) => {
    setItems((prevItems) => {
      const filtered = prevItems.filter((item) => item.id !== planId)
      console.log('Removing plan from cart:', planId)
      return filtered
    })
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem('insuranceCart')
    console.log('Cart cleared')
  }

  const isInCart = (planId: string) => {
    return items.some((item) => item.id === planId)
  }

  const totalItems = items.length

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        isInCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

