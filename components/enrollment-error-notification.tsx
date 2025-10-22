import React from 'react'
import { AlertCircle, X, RefreshCw, ExternalLink } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

interface EnrollmentErrorNotificationProps {
  error: {
    message: string
    data?: {
      isTestData?: boolean
      isPlanConfigurationError?: boolean
      isValidationError?: boolean
      requiresRealData?: boolean
      errorCode?: string
      errorDetail?: string
      errorDetails?: any[]
    }
    warning?: string
  }
  onRetry?: () => void
  onDismiss?: () => void
}

export function EnrollmentErrorNotification({ 
  error, 
  onRetry, 
  onDismiss 
}: EnrollmentErrorNotificationProps) {
  const getErrorIcon = () => {
    if (error.data?.isTestData) return <AlertCircle className="h-5 w-5 text-yellow-500" />
    if (error.data?.isPlanConfigurationError) return <AlertCircle className="h-5 w-5 text-red-500" />
    if (error.data?.isValidationError) return <AlertCircle className="h-5 w-5 text-orange-500" />
    return <AlertCircle className="h-5 w-5 text-red-500" />
  }

  const getErrorColor = () => {
    if (error.data?.isTestData) return 'border-yellow-200 bg-yellow-50'
    if (error.data?.isPlanConfigurationError) return 'border-red-200 bg-red-50'
    if (error.data?.isValidationError) return 'border-orange-200 bg-orange-50'
    return 'border-red-200 bg-red-50'
  }

  const getActionButtons = () => {
    if (error.data?.isTestData) {
      return (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onDismiss}>
            Entendido
          </Button>
          <Button size="sm" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Intentar con datos reales
          </Button>
        </div>
      )
    }

    if (error.data?.isPlanConfigurationError) {
      return (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onDismiss}>
            Cerrar
          </Button>
          <Button size="sm" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Seleccionar otro plan
          </Button>
        </div>
      )
    }

    if (error.data?.isValidationError) {
      return (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onDismiss}>
            Cerrar
          </Button>
          <Button size="sm" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Corregir datos
          </Button>
        </div>
      )
    }

    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onDismiss}>
          Cerrar
        </Button>
        <Button size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    )
  }

  const getDetailedErrorInfo = () => {
    if (error.data?.errorDetails && Array.isArray(error.data.errorDetails)) {
      return (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Detalles del error:</h4>
          <div className="space-y-1">
            {error.data.errorDetails.map((detail, index) => (
              <div key={index} className="text-xs text-gray-600">
                <strong>Código:</strong> {detail.errorCode || 'N/A'}<br />
                <strong>Detalle:</strong> {detail.errorDetail || 'N/A'}
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className={`w-full max-w-2xl mx-auto ${getErrorColor()}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          {getErrorIcon()}
          <div className="flex-1">
            <CardTitle className="text-lg">{error.message}</CardTitle>
            <CardDescription>
              {error.data?.isTestData && 'Este enrollment contiene datos de prueba. Para un enrollment real, necesitas datos válidos del usuario.'}
              {error.data?.isPlanConfigurationError && 'El plan seleccionado tiene un problema de configuración. Por favor, selecciona otro plan o contacta al soporte.'}
              {error.data?.isValidationError && (error.data.errorDetail || 'Los datos proporcionados no son válidos. Por favor, revisa la información.')}
              {error.data?.requiresRealData && 'Para completar el enrollment, necesitas datos reales del usuario, no datos de prueba.'}
            </CardDescription>
          </div>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {getDetailedErrorInfo()}
        
        {error.warning && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> {error.warning}
            </p>
          </div>
        )}
        
        <div className="mt-4 flex justify-end">
          {getActionButtons()}
        </div>
      </CardContent>
    </Card>
  )
}

