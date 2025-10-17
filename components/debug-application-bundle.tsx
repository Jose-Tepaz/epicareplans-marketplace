"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Copy, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

interface DebugApplicationBundleProps {
  selectedPlans: any[]
  state: string
  effectiveDate: string
  dateOfBirth: string
}

export function DebugApplicationBundle({ 
  selectedPlans, 
  state, 
  effectiveDate, 
  dateOfBirth 
}: DebugApplicationBundleProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [copied, setCopied] = useState(false)

  const debugData = {
    selectedPlans,
    state,
    effectiveDate,
    dateOfBirth,
    mappedData: {
      planIds: selectedPlans.map(plan => plan.productCode || plan.id),
      planKeys: selectedPlans.map(plan => plan.planKey || plan.name)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(debugData, null, 2))
      setCopied(true)
      toast.success('Datos copiados al portapapeles')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Error al copiar datos')
    }
  }

  const hasRequiredFields = selectedPlans.every(plan => 
    (plan.productCode || plan.id) && (plan.planKey || plan.name)
  )

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            🔍 Debug ApplicationBundle
            {hasRequiredFields ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showDetails ? 'Ocultar' : 'Mostrar'} Detalles
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
            >
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copiado' : 'Copiar'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumen de datos */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <strong>Estado:</strong> {state}
          </div>
          <div>
            <strong>Fecha Efectiva:</strong> {effectiveDate}
          </div>
          <div>
            <strong>Fecha Nacimiento:</strong> {dateOfBirth}
          </div>
          <div>
            <strong>Planes:</strong> {selectedPlans.length}
          </div>
        </div>

        {/* Validación de campos requeridos */}
        {!hasRequiredFields && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              <strong>Problema detectado:</strong> Algunos planes no tienen los campos requeridos (productCode/planKey)
            </AlertDescription>
          </Alert>
        )}

        {/* Detalles de planes */}
        <div className="space-y-2">
          <h4 className="font-semibold">Planes Seleccionados:</h4>
          {selectedPlans.map((plan, index) => (
            <div key={index} className="p-3 bg-white rounded border">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{plan.name}</p>
                  <p className="text-sm text-gray-600">ID: {plan.id}</p>
                </div>
                <div className="flex gap-1">
                  {plan.productCode ? (
                    <Badge variant="default" className="text-xs">productCode: {plan.productCode}</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">Sin productCode</Badge>
                  )}
                  {plan.planKey ? (
                    <Badge variant="default" className="text-xs">planKey: {plan.planKey}</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">Sin planKey</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mapeo de datos */}
        <div className="space-y-2">
          <h4 className="font-semibold">Mapeo para ApplicationBundle:</h4>
          <div className="p-3 bg-white rounded border">
            <p><strong>planIds:</strong> [{debugData.mappedData.planIds.join(', ')}]</p>
            <p><strong>planKeys:</strong> [{debugData.mappedData.planKeys.join(', ')}]</p>
          </div>
        </div>

        {/* Datos completos (solo si se muestran) */}
        {showDetails && (
          <div className="space-y-2">
            <h4 className="font-semibold">Datos Completos:</h4>
            <pre className="bg-white p-4 rounded border text-xs overflow-auto max-h-96">
              {JSON.stringify(debugData, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
