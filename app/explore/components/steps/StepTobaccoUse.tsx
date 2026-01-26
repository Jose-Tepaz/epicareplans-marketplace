/**
 * Paso 4: Uso de Tabaco
 * 
 * Pregunta si el usuario fuma o usa productos de tabaco.
 * Si responde "Sí", solicita la fecha de último uso.
 */

import type React from "react"
import { CalendarIcon } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { StepContainer } from "../StepContainer"
import { StepNavigation } from "../StepNavigation"
import { ValidationMessage } from "../ValidationMessage"
import { parseDateLocal } from "../../utils/dateHelpers"
import type { StepProps } from "../../types"

interface StepTobaccoUseProps extends StepProps {
  smokes: boolean | null
  onSmokesChange: (smokes: boolean) => void
  lastTobaccoUse: string
  onLastTobaccoUseChange: (date: string) => void
  onDateSelect: (date: Date | undefined) => void
  error: string
  isValid: boolean
}

export const StepTobaccoUse: React.FC<StepTobaccoUseProps> = ({
  smokes,
  onSmokesChange,
  lastTobaccoUse,
  onLastTobaccoUseChange,
  onDateSelect,
  error,
  isValid,
  onNext,
  onBack,
  isValidating,
  isSubmitting,
  currentStep,
  totalSteps,
}) => {
  const canProceed = smokes !== null && (smokes === false || lastTobaccoUse.trim().length > 0)

  return (
    <StepContainer>
      <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8 text-center text-balance">
        Do you currently smoke or use tobacco?
      </h2>

      <div className="flex gap-6 justify-center mb-8">
        <div className="flex gap-6 justify-center w-full">
          <label
            className={`cursor-pointer rounded-full text-xl px-6 py-2 font-semibold flex items-center gap-3 transition-colors ${
              smokes === true
                ? "bg-white/30 border-rounded-1px text-black border-2 border-white hover:border-2 hover:border-white hover:bg-transparent"
                : "text-white border-2 border-white hover:border-2 hover:border-white hover:bg-transparent"
            }`}
          >
            <input
              type="radio"
              name="smokes"
              value="yes"
              checked={smokes === true}
              onChange={() => {
                onSmokesChange(true)
                onLastTobaccoUseChange("")
              }}
              className="accent-cyan w-5 h-5 mr-2"
            />
            Yes
          </label>
          <label
            className={`cursor-pointer rounded-full text-xl px-6 py-2 font-semibold flex items-center gap-3 transition-colors ${
              smokes === false
                ? "bg-white/30 border-rounded-1px text-black border-2 border-white hover:border-2 hover:border-white hover:bg-transparent"
                : "text-white border-2 border-white hover:border-2 hover:border-white hover:bg-transparent"
            }`}
          >
            <input
              type="radio"
              name="smokes"
              value="no"
              checked={smokes === false}
              onChange={() => {
                onSmokesChange(false)
                onLastTobaccoUseChange("")
              }}
              className="accent-cyan w-5 h-5 mr-2"
            />
            No
          </label>
        </div>
      </div>

      {smokes === true && (
        <div className="mb-8">
          <Label htmlFor="lastTobaccoUse" className="text-white text-lg font-medium mb-3 block">
            When last have you used tobacco in any form, or used nicotine products including a patch, gum, or
            electronic cigarettes? *
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={`input-epicare w-full justify-start text-left font-normal h-12 px-4 py-3 flex items-center ${
                  error ? 'border-red-500' : ''
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {lastTobaccoUse ? (
                  parseDateLocal(lastTobaccoUse).toLocaleDateString()
                ) : (
                  <span className="text-white">Pick a date</span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={lastTobaccoUse ? parseDateLocal(lastTobaccoUse) : undefined}
                onSelect={onDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {error && <p className="text-white text-sm mt-2">{error}</p>}
          {isValid && <ValidationMessage type="success" message="Valid last tobacco use" />}
        </div>
      )}

      <StepNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={onBack}
        onNext={onNext}
        canProceed={canProceed}
        isValidating={isValidating}
        isSubmitting={isSubmitting}
      />
    </StepContainer>
  )
}
