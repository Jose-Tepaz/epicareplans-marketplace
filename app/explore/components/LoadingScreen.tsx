/**
 * Pantalla de carga para el proceso de exploración
 * 
 * Se muestra mientras:
 * - Se carga la autenticación
 * - Se carga el perfil del usuario
 * - Se verifica información existente
 */

import type React from "react"
import { Loader2 } from "lucide-react"

interface LoadingScreenProps {
  message?: string
  subtitle?: string
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading...",
  subtitle = ""
}) => {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <div className="text-white text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
        <p className="text-xl font-bold mb-2">{message}</p>
        {subtitle && <p className="text-white/80">{subtitle}</p>}
      </div>
    </div>
  )
}
