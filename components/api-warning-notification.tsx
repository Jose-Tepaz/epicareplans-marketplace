/**
 * API Warning Notification Component
 * 
 * Notificación que aparece cuando el API falla pero la información
 * del usuario se guardó exitosamente.
 * 
 * - Se auto-oculta después de un tiempo
 * - Puede cerrarse manualmente
 * - Diseño con animación de entrada
 * 
 * @module ApiWarningNotification
 */

import { AlertCircle } from "lucide-react"

interface ApiWarningNotificationProps {
  show: boolean
  onClose: () => void
}

export function ApiWarningNotification({ show, onClose }: ApiWarningNotificationProps) {
  if (!show) return null

  return (
    <div className="mt-4 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg animate-in fade-in slide-in-from-top-5 duration-300">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-orange-900 font-semibold mb-1">We saved your information</p>
          <p className="text-orange-800 text-sm">
            We couldn’t fetch live insurance plans right now. Please try again later or adjust your details to refresh the results.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-orange-600 hover:text-orange-800 font-bold text-xl"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  )
}

