"use client"

import { ApplicationBundleTest } from "@/components/application-bundle-test"

export default function TestApplicationBundlePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Prueba de ApplicationBundle API
          </h1>
          <p className="text-gray-600">
            Esta página permite probar la integración con el endpoint ApplicationBundle de NGIC
          </p>
        </div>
        
        <ApplicationBundleTest />
      </div>
    </div>
  )
}
