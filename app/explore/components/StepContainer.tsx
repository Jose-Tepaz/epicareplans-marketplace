/**
 * Contenedor con estilo para los pasos del formulario
 * 
 * Proporciona el diseño visual consistente:
 * - Fondo blanco limpio
 * - Bordes sutiles
 * - Padding consistente
 */

import type React from "react"

interface StepContainerProps {
  children: React.ReactNode
}

export const StepContainer: React.FC<StepContainerProps> = ({ children }) => {
  return (
    <div className="bg-white rounded-3xl p-12 shadow-sm">
      {children}
    </div>
  )
}
