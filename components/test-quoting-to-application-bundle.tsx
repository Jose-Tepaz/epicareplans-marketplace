"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

/**
 * Componente para probar el mapeo de datos del Quoting API al ApplicationBundle API
 */
export function TestQuotingToApplicationBundle() {
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Datos de prueba que simulan la respuesta del Quoting API
  const mockQuotingResponse = {
    availablePlans: [
      {
        id: "Life25000",
        productCode: "21673",
        planKey: "Life 25000",
        planName: "Life Only - Individual",
        insuranceRate: 12.52,
        benefitDescription: "Life insurance coverage",
        productType: "TermLife",
        planType: "Individual",
        carrierName: "National General",
        pathToBrochure: "https://example.com/brochure.pdf"
      }
    ]
  }

  const testMapping = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      // Simular el mapeo que hace AllStateAPI
      const mappedPlans = mockQuotingResponse.availablePlans.map(plan => ({
        id: plan.id || 'unknown',
        name: plan.planName || 'Unknown Plan',
        price: plan.insuranceRate || 0,
        coverage: plan.benefitDescription || 'No coverage description',
        productType: plan.productType || 'Unknown',
        benefits: [],
        allState: true,
        planType: plan.planType || 'Unknown',
        benefitDescription: plan.benefitDescription || 'No description',
        brochureUrl: plan.pathToBrochure,
        carrierName: plan.carrierName,
        // Campos críticos para ApplicationBundle
        productCode: plan.productCode,
        planKey: plan.planKey
      }))

      // Simular el mapeo que hace ApplicationBundleAPI
      const planIds = mappedPlans.map(plan => {
        if (plan.productCode) {
          return plan.productCode
        }
        return plan.id
      })

      const planKeys = mappedPlans.map(plan => {
        if (plan.planKey) {
          return plan.planKey
        }
        return plan.name
      })

      const applicationBundleRequest = {
        state: "CA",
        planIds,
        planKeys,
        effectiveDate: new Date().toISOString(),
        dateOfBirth: "1960-01-01T00:00:00Z",
        agentNumber: "159208",
        isEFulfillment: true
      }

      setTestResult({
        originalQuotingData: mockQuotingResponse.availablePlans[0],
        mappedPlan: mappedPlans[0],
        applicationBundleRequest,
        hasRequiredFields: !!(mappedPlans[0].productCode && mappedPlans[0].planKey)
      })

      toast.success('Mapeo completado', {
        description: 'Revisa los resultados del mapeo'
      })

    } catch (error) {
      toast.error('Error en el mapeo', {
        description: error instanceof Error ? error.message : 'Error desconocido'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔄 Prueba de Mapeo Quoting → ApplicationBundle
            {testResult && testResult.hasRequiredFields ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : testResult ? (
              <XCircle className="h-5 w-5 text-red-500" />
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testMapping} disabled={isLoading} className="w-full">
            {isLoading ? 'Probando mapeo...' : 'Probar Mapeo de Datos'}
          </Button>

          {testResult && (
            <div className="space-y-4">
              {/* Validación de campos requeridos */}
              {!testResult.hasRequiredFields && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-700">
                    <strong>Error:</strong> El plan mapeado no tiene los campos requeridos (productCode/planKey)
                  </AlertDescription>
                </Alert>
              )}

              {testResult.hasRequiredFields && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700">
                    <strong>Éxito:</strong> El plan tiene todos los campos requeridos
                  </AlertDescription>
                </Alert>
              )}

              {/* Datos originales del Quoting API */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Datos Originales (Quoting API)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>ID:</strong> {testResult.originalQuotingData.id}</div>
                    <div><strong>Product Code:</strong> {testResult.originalQuotingData.productCode}</div>
                    <div><strong>Plan Key:</strong> {testResult.originalQuotingData.planKey}</div>
                    <div><strong>Plan Name:</strong> {testResult.originalQuotingData.planName}</div>
                    <div><strong>Price:</strong> ${testResult.originalQuotingData.insuranceRate}</div>
                    <div><strong>Carrier:</strong> {testResult.originalQuotingData.carrierName}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Plan mapeado */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Plan Mapeado (InsurancePlan)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>ID:</strong> {testResult.mappedPlan.id}</div>
                    <div><strong>Name:</strong> {testResult.mappedPlan.name}</div>
                    <div><strong>Price:</strong> ${testResult.mappedPlan.price}</div>
                    <div><strong>Product Code:</strong> 
                      {testResult.mappedPlan.productCode ? (
                        <Badge variant="default" className="ml-2">{testResult.mappedPlan.productCode}</Badge>
                      ) : (
                        <Badge variant="destructive" className="ml-2">FALTANTE</Badge>
                      )}
                    </div>
                    <div><strong>Plan Key:</strong> 
                      {testResult.mappedPlan.planKey ? (
                        <Badge variant="default" className="ml-2">{testResult.mappedPlan.planKey}</Badge>
                      ) : (
                        <Badge variant="destructive" className="ml-2">FALTANTE</Badge>
                      )}
                    </div>
                    <div><strong>Carrier:</strong> {testResult.mappedPlan.carrierName}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Request para ApplicationBundle */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Request para ApplicationBundle API</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div><strong>State:</strong> {testResult.applicationBundleRequest.state}</div>
                    <div><strong>Plan IDs:</strong> [{testResult.applicationBundleRequest.planIds.join(', ')}]</div>
                    <div><strong>Plan Keys:</strong> [{testResult.applicationBundleRequest.planKeys.join(', ')}]</div>
                    <div><strong>Effective Date:</strong> {testResult.applicationBundleRequest.effectiveDate}</div>
                    <div><strong>Date of Birth:</strong> {testResult.applicationBundleRequest.dateOfBirth}</div>
                    <div><strong>Agent Number:</strong> {testResult.applicationBundleRequest.agentNumber}</div>
                  </div>
                </CardContent>
              </Card>

              {/* JSON completo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">JSON Completo</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
