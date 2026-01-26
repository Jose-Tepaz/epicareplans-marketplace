/**
 * Componente para mostrar mensajes de validación
 * 
 * Muestra mensajes de error o éxito con iconos apropiados
 */

import type React from "react"
import { AlertCircleIcon, CheckCircleIcon } from "lucide-react"

interface ValidationMessageProps {
  type: 'error' | 'success'
  message: string
}

export const ValidationMessage: React.FC<ValidationMessageProps> = ({ type, message }) => {
  const isError = type === 'error'
  const Icon = isError ? AlertCircleIcon : CheckCircleIcon
  const colorClass = isError ? 'text-red-500' : 'text-green-500'

  return (
    <div className="flex flex-row bg-white rounded-md p-2 gap-2 mb-6 max-w-fit">
      <Icon className={`h-4 w-4 ${colorClass}`} />
      <p className={`${colorClass} text-sm`}>{message}</p>
    </div>
  )
}
