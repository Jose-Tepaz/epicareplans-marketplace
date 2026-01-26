/**
 * Layout compartido para todos los pasos del formulario
 * 
 * Proporciona:
 * - Fondo con color primario
 * - Ilustraciones decorativas
 * - Contenedor centrado para el contenido
 */

import type React from "react"
import Image from "next/image"
import img1 from "@/public/images/ilustration-1.png"
import img2 from "@/public/images/ilustration-2.png"

interface StepLayoutProps {
  children: React.ReactNode
}

export const StepLayout: React.FC<StepLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-tertiary relative overflow-hidden">
      {/* Ilustración - Persona con perro (izquierda) */}
      <div className="absolute left-[-10rem] bottom-0 w-[600px] h-[600px]">
        <Image
          src={img1}
          alt="Person with phone and dog"
          fill
          className="object-contain object-bottom"
        />
      </div>

      {/* Ilustración - Casas y clipboard médico (derecha) */}
      <div className="absolute right-[-20rem] bottom-0 w-[600px] h-[600px]">
        <Image
          src={img2}
          alt="Houses, car and medical clipboard"
          fill
          className="object-contain object-bottom"
        />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 flex items-center justify-center min-h-screen ">
        <div className="padding-global">
          <div className="w-full container-large">
            {children}
          </div>
        </div>
        
      </div>
    </div>
  )
}
