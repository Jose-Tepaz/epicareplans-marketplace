/**
 * Paso inicial: Pregunta si el usuario ya tiene cuenta
 * 
 * - Si responde "Sí" → redirige a login
 * - Si responde "No" → continúa con el formulario
 */

import type React from "react"
import { Button } from "@/components/ui/button"
import { StepContainer } from "./StepContainer"

interface AccountQuestionProps {
  onChoice: (hasAccount: boolean) => void
}

export const AccountQuestion: React.FC<AccountQuestionProps> = ({ onChoice }) => {
  return (
    <StepContainer>
      <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center text-balance">
        Do you already have an account?
      </h2>
      <div className="flex gap-6 justify-center">
        <Button
          size="lg"
          onClick={() => onChoice(true)}
          className="bg-secondary-foreground"  
        >
          Yes
        </Button>
        <Button
          size="lg"
          onClick={() => onChoice(false)}
          className=""
        >
          No
        </Button>
      </div>
    </StepContainer>
  )
}
