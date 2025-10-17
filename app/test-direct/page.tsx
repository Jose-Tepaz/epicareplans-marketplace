"use client"

import { TestDirectApplicationBundle } from "@/components/test-direct-application-bundle"

export default function TestDirectPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Prueba Directa ApplicationBundle API
          </h1>
          <p className="text-gray-600">
            Esta página prueba el ApplicationBundle API con el formato exacto que funciona en Insomnia
          </p>
        </div>
        
        <TestDirectApplicationBundle />
      </div>
    </div>
  )
}
