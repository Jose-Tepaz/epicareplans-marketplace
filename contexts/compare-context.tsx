/**
 * Compare Context
 * 
 * Context global para manejar la comparación de planes de seguro.
 * Permite agregar, remover y gestionar hasta 4 planes seleccionados para comparar.
 * 
 * @module CompareContext
 */

"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { InsurancePlan } from "@/lib/types/insurance"

interface CompareContextType {
  selectedPlans: InsurancePlan[]
  addPlanToCompare: (plan: InsurancePlan) => void
  removePlanFromCompare: (planId: string) => void
  clearComparison: () => void
  isInComparison: (planId: string) => boolean
  canAddMore: boolean
}

const CompareContext = createContext<CompareContextType | undefined>(undefined)

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [selectedPlans, setSelectedPlans] = useState<InsurancePlan[]>([])
  const [isClient, setIsClient] = useState(false)

  // Set client-side flag
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load compare plans from localStorage on mount
  useEffect(() => {
    if (isClient) {
      const savedCompare = localStorage.getItem('epicare_compare_plans')
      if (savedCompare) {
        try {
          const parsedCompare = JSON.parse(savedCompare)
          // Validate that we have valid plans and max 4
          const validPlans = Array.isArray(parsedCompare) 
            ? parsedCompare.slice(0, 4)
            : []
          setSelectedPlans(validPlans)
          console.log('Compare plans loaded from localStorage:', validPlans)
        } catch (error) {
          console.error('Error loading compare plans:', error)
        }
      }
    }
  }, [isClient])

  // Save compare plans to localStorage whenever it changes
  useEffect(() => {
    if (isClient && selectedPlans.length >= 0) {
      localStorage.setItem('epicare_compare_plans', JSON.stringify(selectedPlans))
      console.log('Compare plans saved to localStorage:', selectedPlans)
    }
  }, [selectedPlans, isClient])

  const addPlanToCompare = (plan: InsurancePlan) => {
    // Check if we can add more plans (max 4)
    if (selectedPlans.length >= 4) {
      console.log('Cannot add more plans: maximum of 4 plans allowed')
      return
    }

    // Check if plan already exists
    const exists = selectedPlans.find((p) => p.id === plan.id)
    if (exists) {
      console.log('Plan already in comparison:', plan.name)
      return
    }

    setSelectedPlans((prevPlans) => {
      const updated = [...prevPlans, plan]
      console.log('Adding plan to comparison:', plan.name)
      return updated
    })
  }

  const removePlanFromCompare = (planId: string) => {
    setSelectedPlans((prevPlans) => {
      const filtered = prevPlans.filter((p) => p.id !== planId)
      console.log('Removing plan from comparison:', planId)
      return filtered
    })
  }

  const clearComparison = () => {
    setSelectedPlans([])
    console.log('Compare plans cleared')
  }

  const isInComparison = (planId: string): boolean => {
    return selectedPlans.some((p) => p.id === planId)
  }

  const canAddMore = selectedPlans.length < 4

  return (
    <CompareContext.Provider
      value={{
        selectedPlans,
        addPlanToCompare,
        removePlanFromCompare,
        clearComparison,
        isInComparison,
        canAddMore,
      }}
    >
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const context = useContext(CompareContext)
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider')
  }
  return context
}

