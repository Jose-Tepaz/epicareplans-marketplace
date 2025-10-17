"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

/**
 * Componente de prueba para verificar la integración de ApplicationBundle API
 * Este componente permite probar la funcionalidad sin pasar por todo el flujo de enrollment
 */
export function ApplicationBundleTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [testData, setTestData] = useState({
    state: "CA",
    effectiveDate: new Date().toISOString().split('T')[0],
    dateOfBirth: "1960-01-01",
    planIds: ["21673"],
    planKeys: ["Life 25000"]
  })

  const handleTest = async () => {
    setIsLoading(true)
    setResult(null)
    setError(null)

    try {
      // Crear datos de prueba
      const mockSelectedPlans = [
        {
          id: "Life25000",
          productCode: testData.planIds[0],
          planKey: testData.planKeys[0],
          name: "Life Only - Individual",
          price: 12.52,
          carrierName: "National General"
        }
      ]

      const response = await fetch('/api/application-bundle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedPlans: mockSelectedPlans,
          state: testData.state,
          effectiveDate: testData.effectiveDate,
          dateOfBirth: testData.dateOfBirth
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
      
      toast.success('Prueba exitosa', {
        description: 'ApplicationBundle API funcionando correctamente'
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      
      toast.error('Error en la prueba', {
        description: errorMessage
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
            🧪 Prueba de ApplicationBundle API
            {result && <CheckCircle className="h-5 w-5 text-green-500" />}
            {error && <XCircle className="h-5 w-5 text-red-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={testData.state}
                onChange={(e) => setTestData({ ...testData, state: e.target.value })}
                placeholder="CA"
                maxLength={2}
              />
            </div>
            <div>
              <Label htmlFor="effectiveDate">Fecha Efectiva</Label>
              <Input
                id="effectiveDate"
                type="date"
                value={testData.effectiveDate}
                onChange={(e) => setTestData({ ...testData, effectiveDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={testData.dateOfBirth}
                onChange={(e) => setTestData({ ...testData, dateOfBirth: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="planIds">Plan IDs (comma separated)</Label>
              <Input
                id="planIds"
                value={testData.planIds.join(',')}
                onChange={(e) => setTestData({ ...testData, planIds: e.target.value.split(',') })}
                placeholder="21673"
              />
            </div>
            <div>
              <Label htmlFor="planKeys">Plan Keys (comma separated)</Label>
              <Input
                id="planKeys"
                value={testData.planKeys.join(',')}
                onChange={(e) => setTestData({ ...testData, planKeys: e.target.value.split(',') })}
                placeholder="Life 25000"
              />
            </div>
          </div>

          <Button 
            onClick={handleTest} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Probando API...
              </>
            ) : (
              'Probar ApplicationBundle API'
            )}
          </Button>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700">
                <strong>Error:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700">
                  <strong>Éxito:</strong> API respondió correctamente
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Respuesta de la API</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información de Prueba</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Estado:</strong> {testData.state}</p>
            <p><strong>Fecha Efectiva:</strong> {testData.effectiveDate}</p>
            <p><strong>Fecha de Nacimiento:</strong> {testData.dateOfBirth}</p>
            <p><strong>Plan IDs:</strong> {testData.planIds.join(', ')}</p>
            <p><strong>Plan Keys:</strong> {testData.planKeys.join(', ')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
