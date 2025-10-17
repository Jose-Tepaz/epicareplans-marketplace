"use client"

import { useEffect, useRef, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface KnockoutNotificationManagerProps {
  hasKnockout: boolean
  errors: string[]
  onDismiss?: () => void
}

export function KnockoutNotificationManager({ 
  hasKnockout, 
  errors, 
  onDismiss 
}: KnockoutNotificationManagerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentErrors, setCurrentErrors] = useState<string[]>([])
  const lastErrorsRef = useRef<string[]>([])
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Solo mostrar si hay knockouts Y los errores han cambiado
    if (hasKnockout && errors.length > 0) {
      const errorsChanged = JSON.stringify(errors) !== JSON.stringify(lastErrorsRef.current)
      
      if (errorsChanged) {
        console.log('Mostrando notificación knockout:', errors)
        lastErrorsRef.current = [...errors]
        setCurrentErrors([...errors])
        setIsVisible(true)
        
        // Auto-ocultar después de 5 segundos
        timeoutRef.current = setTimeout(() => {
          setIsVisible(false)
        }, 5000)
      }
    } else {
      setIsVisible(false)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [hasKnockout, errors])

  const handleDismiss = () => {
    setIsVisible(false)
    if (onDismiss) {
      onDismiss()
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert className="border-orange-200 bg-orange-50 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <AlertDescription className="text-orange-800 font-medium">
                Respuesta Descalificada
              </AlertDescription>
              <div className="mt-2 space-y-1">
                {currentErrors.map((error, index) => (
                  <div key={index} className="text-sm text-orange-700">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-orange-500 hover:text-orange-700 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>
    </div>
  )
}
