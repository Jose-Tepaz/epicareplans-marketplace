"use client"

import { TestQuotingToApplicationBundle } from "@/components/test-quoting-to-application-bundle"

export default function TestMappingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Prueba de Mapeo de Datos
          </h1>
          <p className="text-gray-600">
            Esta página permite probar el mapeo de datos del Quoting API al ApplicationBundle API
          </p>
        </div>
        
        <TestQuotingToApplicationBundle />
      </div>
    </div>
  )
}
