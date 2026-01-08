"use client"

import { useCart } from "@/contexts/cart-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

/**
 * Componente para debuggear los planes del carrito
 */
export function DebugCartPlans() {
  const { items: cartItems } = useCart()

  const hasRequiredFields = cartItems.every(plan => 
    (plan.productCode || plan.id) && (plan.planKey || plan.name)
  )

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🛒 Debug Carrito de Planes
          {hasRequiredFields ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <strong>Total de planes en carrito:</strong> {cartItems.length}
        </div>

        {!hasRequiredFields && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">
              <strong>Problema:</strong> Algunos planes no tienen los campos requeridos para ApplicationBundle API
            </AlertDescription>
          </Alert>
        )}

        {cartItems.length === 0 && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-700">
              <strong>Carrito vacío:</strong> No hay planes seleccionados
            </AlertDescription>
          </Alert>
        )}

        {cartItems.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold">Planes en el Carrito:</h4>
            {cartItems.map((plan, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-semibold">{plan.name}</h5>
                        <p className="text-sm text-gray-600">ID: {plan.id}</p>
                        <p className="text-sm text-gray-500">Precio: ${plan.price}</p>
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
                    
                    <div className="text-xs text-gray-500">
                      <strong>Campos disponibles:</strong>
                      <ul className="list-disc list-inside ml-2">
                        {Object.keys(plan).map(key => (
                          <li key={key}>{key}: {typeof (plan as any)[key] === 'object' ? JSON.stringify((plan as any)[key]) : String((plan as any)[key])}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500">
          <strong>Mapeo para ApplicationBundle:</strong>
          <ul className="list-disc list-inside ml-2">
            <li>planIds: [{cartItems.map(plan => plan.productCode || plan.id).join(', ')}]</li>
            <li>planKeys: [{cartItems.map(plan => plan.planKey || plan.name).join(', ')}]</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
