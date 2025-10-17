"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import img1 from "@/public/images/ilustration-1.png"
import img2 from "@/public/images/ilustration-2.png"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { AlertCircleIcon, CalendarIcon, CheckCircleIcon, Loader2 } from "lucide-react" 

export default function ExplorePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [hasAccount, setHasAccount] = useState<boolean | null>(null)
  const [registrationStep, setRegistrationStep] = useState(1)
  
  // Loading states
  const [isValidating, setIsValidating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const [zipCode, setZipCode] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [gender, setGender] = useState("")
  const [smokes, setSmokes] = useState<boolean | null>(null)
  const [lastTobaccoUse, setLastTobaccoUse] = useState("")
  const [coverageStartDate, setCoverageStartDate] = useState("")
  
  // Validation states
  const [zipCodeValid, setZipCodeValid] = useState<boolean | null>(null)
  const [zipCodeError, setZipCodeError] = useState("")
  const [dateOfBirthError, setDateOfBirthError] = useState("")
  const [dateOfBirthValid, setDateOfBirthValid] = useState(false)
  const [coverageStartDateError, setCoverageStartDateError] = useState("")
  const [lastTobaccoUseError, setLastTobaccoUseError] = useState("")
  const [lastTobaccoUseValid, setLastTobaccoUseValid] = useState(false)
  const [coverageStartDateValid, setCoverageStartDateValid] = useState(false)
  
  // Set default coverage start date to a future date
  useEffect(() => {
    if (!coverageStartDate) {
      const futureDate = new Date()
      futureDate.setMonth(futureDate.getMonth() + 1) // 1 month from now
      setCoverageStartDate(futureDate.toISOString().split('T')[0])
    }
  }, [coverageStartDate])
  const [paymentFrequency, setPaymentFrequency] = useState("")

  // Login state
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleAccountChoice = (choice: boolean) => {
    setHasAccount(choice)
    setStep(2)
  }

  // Validation functions
  const validateZipCode = async (zip: string) => {
    if (!zip || !/^\d{5}$/.test(zip)) {
      setZipCodeError("Please enter a valid 5-digit ZIP code")
      setZipCodeValid(false)
      return false
    }

    try {
      const response = await fetch(`/api/address/validate-zip/${zip}`)
      const data = await response.json()
      
      if (data.success) {
        setZipCodeError("")
        setZipCodeValid(true)
        
        // Guardar ZIP code en localStorage para el enrollment
        localStorage.setItem('userZipCode', zip)
        console.log('ZIP code guardado en localStorage:', zip)
        
        return true
      } else {
        setZipCodeError("ZIP code not found. Please enter a valid ZIP code.")
        setZipCodeValid(false)
        return false
      }
    } catch (error) {
      setZipCodeError("Error validating ZIP code. Please try again.")
      setZipCodeValid(false)
      return false
    }
  }

  const validateDateOfBirth = (date: string) => {
    if (!date) {
      setDateOfBirthError("Please enter your date of birth")
      setDateOfBirthValid(false)
      return false
    }

    const birthDate = new Date(date)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    if (age < 18) {
      setDateOfBirthError("You must be at least 18 years old")
      setDateOfBirthValid(false)
      return false
    }

    setDateOfBirthError("")
    setDateOfBirthValid(true)
    return true
  }

  const validateCoverageStartDate = (date: string) => {
    if (!date) {
      setCoverageStartDateError("Please select a coverage start date")
      setCoverageStartDateValid(false)
      return false
    }

    const startDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day

    if (startDate < today) {
      setCoverageStartDateError("Coverage start date must be today or later")
      setCoverageStartDateValid(false)
      return false
    }

    setCoverageStartDateError("")
    setCoverageStartDateValid(true)
    return true
  }

  const validateLastTobaccoUse = (date: string) => {
    if (smokes && !date) {
      setLastTobaccoUseError("Please enter when you last used tobacco")
      setLastTobaccoUseValid(false)
      return false
    }

    setLastTobaccoUseError("")
    setLastTobaccoUseValid(true)
    return true
  }

  const handleBackToAccountQuestion = () => {
    setStep(1)
    setHasAccount(null)
    setRegistrationStep(1)
  }

  const handleRegistrationNext = async () => {
    // Validate current step before proceeding
    let isValid = true
    
    setIsValidating(true)

    try {
      if (registrationStep === 1) {
        // Validate ZIP code
        isValid = await validateZipCode(zipCode)
      } else if (registrationStep === 2) {
        // Validate date of birth
        isValid = validateDateOfBirth(dateOfBirth)
      } else if (registrationStep === 4) {
        // Validate last tobacco use if smokes is true
        if (smokes) {
          isValid = validateLastTobaccoUse(lastTobaccoUse)
        }
      } else if (registrationStep === 5) {
        isValid = validateCoverageStartDate(coverageStartDate)
      }

    if (registrationStep < 6 && isValid) {
      setRegistrationStep(registrationStep + 1)
    } else if (registrationStep === 6 && isValid) {
      setIsSubmitting(true)
      // Prepare form data for API
      const formData = { zipCode, dateOfBirth, gender, smokes, lastTobaccoUse, coverageStartDate, paymentFrequency }

      // Save form data to sessionStorage immediately
      console.log('Saving form data to sessionStorage:', formData)
      sessionStorage.setItem('insuranceFormData', JSON.stringify(formData))

      try {
        const response = await fetch('/api/insurance/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
        if (!response.ok) throw new Error(`Insurance API failed: ${response.status} - ${await response.text()}`)
        const result = await response.json()
        // Save plans to sessionStorage
        sessionStorage.setItem('insurancePlans', JSON.stringify(result.plans))
        router.push("/insurance-options")
      } catch (error) {
        console.error('Error fetching insurance quotes:', error)
        // Even if API fails, navigate with saved form data
        router.push("/insurance-options")
      } finally {
        setIsSubmitting(false)
      }
    }
    } finally {
      setIsValidating(false)
    }
  }

  const handleRegistrationBack = () => {
    if (registrationStep > 1) {
      setRegistrationStep(registrationStep - 1)
    } else {
      handleBackToAccountQuestion()
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    
    try {
      // Simular llamada a API de login
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log("[v0] Login attempt:", { email, password: "***" })
      // Aquí iría la lógica real de login
    } catch (error) {
      console.error('Error during login:', error)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const isStepValid = () => {
    switch (registrationStep) {
      case 1:
        return zipCode.trim().length > 0
      case 2:
        return dateOfBirth.trim().length > 0
      case 3:
        return gender.trim().length > 0
      case 4:
        return smokes !== null && (smokes === false || lastTobaccoUse.trim().length > 0)
      case 5:
        return coverageStartDate.trim().length > 0
      case 6:
        return paymentFrequency.trim().length > 0
      default:
        return false
    }
  }

  if (step === 2 && hasAccount === false) {
    return (
      <div className="min-h-screen bg-primary relative overflow-hidden">
        {/* Illustration - Person with dog */}
        <div className="absolute left-[-10rem] bottom-0 w-[600px] h-[600px]">
          <Image
            src={img1}
            alt="Person with phone and dog"
            fill
            className="object-contain object-bottom"
          />
        </div>

        <div className="absolute right-[-20rem] bottom-0 w-[600px] h-[600px]">
          <Image
            src={img2}
            alt="Houses, car and medical clipboard"
            fill
            className="object-contain object-bottom"
          />
        </div>

        {/* Main content */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-20">
          <div className="w-full max-w-2xl">
            {/* Registration Step 1: ZIP Code */}
            {registrationStep === 1 && (
              <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-3xl p-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center text-balance">
                  What is your ZIP code?
                </h2>

                <Input
                  type="text"
                  placeholder="Enter your ZIP Code"
                  value={zipCode}
                  onChange={(e) => {
                    setZipCode(e.target.value)
                    if (zipCodeError) setZipCodeError("") // Clear error when typing
                  }}
                  className={`input-epicare ${zipCodeError ? 'border-red-500' : zipCodeValid ? 'border-green-500' : ''}`}
                />
                {zipCodeError && (
                  <div className="flex flex-row bg-white rounded-md p-2 gap-2 mb-6 max-w-fit">
                    <AlertCircleIcon className="h-4 w-4 text-red-500" />
                  <p className="text-red-500 text-sm">{zipCodeError}</p>
                  </div>
                )}
                {zipCodeValid && (
                  <div className="flex flex-row bg-white rounded-md p-2 gap-2 mb-6 max-w-fit">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <p className="text-green-500 text-sm">Valid ZIP code</p>
                  </div>
                )}  

                <div className="flex items-center justify-between">
                  <span className="text-white text-lg font-medium">Step 1/6</span>
                  <div className="flex gap-4">
                    <Button
                      onClick={handleRegistrationBack}
                      className="btn-white-outline"
                      disabled={isValidating}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleRegistrationNext}
                      disabled={!isStepValid() || isValidating}
                      className="btn-white"
                    >
                      {isValidating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Validando...
                        </>
                      ) : (
                        'Next'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {registrationStep === 2 && (
              <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-3xl p-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center text-balance">
                  What is your date of birth?
                </h2>

                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className={`input-epicare w-full justify-start text-left font-normal h-12 px-4 py-3 flex items-center ${dateOfBirthError ? 'border-red-500' : ''}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateOfBirth ? (
                        new Date(dateOfBirth).toLocaleDateString()
                      ) : (
                        <span className="text-white">Pick a date</span>
                      )}  
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateOfBirth ? new Date(dateOfBirth) : undefined}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        setDateOfBirth(date ? date.toISOString().split("T")[0] : "")
                        if (dateOfBirthError) setDateOfBirthError("") // Clear error when selecting
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {dateOfBirthError && (
                  <div className="flex flex-row bg-white rounded-md p-2 gap-2 mb-6 max-w-fit">
                    <AlertCircleIcon className="h-4 w-4 text-red-500" />
                  <p className="text-red-500 text-sm">{dateOfBirthError}</p>
                  </div>
                )}
                {dateOfBirthValid && (
                  <div className="flex flex-row bg-white rounded-md p-2 gap-2 mb-6 max-w-fit">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <p className="text-green-500 text-sm">Valid date of birth</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-white text-lg font-medium">Step 2/6</span>
                  <div className="flex gap-4">
                    <Button
                      onClick={handleRegistrationBack}
                      className="btn-white-outline"
                      disabled={isValidating}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleRegistrationNext}
                      disabled={!isStepValid() || isValidating}
                      className="btn-white"
                    >
                      {isValidating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Validando...
                        </>
                      ) : (
                        'Next'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {registrationStep === 3 && (
              <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-3xl p-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center text-balance">
                  What is your gender?
                </h2>

                <div className="flex flex-col gap-4 ">
                  <div className="flex flex-row gap-4 ">
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger className="input-epicare w-full text-lg font-semibold mb-0">
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white text-lg font-medium">Step 3/6</span>
                  <div className="flex gap-4 ">
                    <Button
                      onClick={handleRegistrationBack}
                      className="btn-white-outline"
                      disabled={isValidating}
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleRegistrationNext}
                      disabled={!isStepValid() || isValidating}
                      className="btn-white"
                    >
                      {isValidating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        'Next'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {registrationStep === 4 && (
              <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-3xl p-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center text-balance">
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
                          setSmokes(true)
                          setLastTobaccoUse("")
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
                          setSmokes(false)
                          setLastTobaccoUse("")
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
                      className={`input-epicare w-full justify-start text-left font-normal h-12 px-4 py-3 flex items-center ${lastTobaccoUseError ? 'border-red-500' : ''}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {lastTobaccoUse ? new Date(lastTobaccoUse).toLocaleDateString() : <span className="text-white">Pick a date</span>}  
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={lastTobaccoUse ? new Date(lastTobaccoUse) : undefined} onSelect={(date) => {
                      setLastTobaccoUse(date ? date.toISOString().split("T")[0] : "")
                      if (lastTobaccoUseError) setLastTobaccoUseError("") // Clear error when selecting
                    }} initialFocus />
                  </PopoverContent>
                </Popover>
                {lastTobaccoUseError && <p className="text-white text-sm mt-2">{lastTobaccoUseError}</p>}
                {lastTobaccoUseValid && (
                  <div className="flex flex-row bg-white rounded-md p-2 gap-2 mb-6 max-w-fit">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <p className="text-green-500 text-sm">Valid last tobacco use</p>
                  </div>
                )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-white text-lg font-medium">Step 4/6</span>
                  <div className="flex gap-4">
                    <Button
                      onClick={handleRegistrationBack}
                      className="btn-white-outline"
                      disabled={isValidating}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleRegistrationNext}
                      disabled={!isStepValid() || isValidating}
                      className="btn-white"
                    >
                      {isValidating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Validando...
                        </>
                      ) : (
                        'Next'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {registrationStep === 5 && (
              <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-3xl p-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center text-balance">
                  When would you like your coverage to begin?
                </h2>

                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className={`input-epicare w-full justify-start text-left font-normal h-12 px-4 py-3 flex items-center ${coverageStartDateError ? 'border-red-500' : ''}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {coverageStartDate ? new Date(coverageStartDate).toLocaleDateString() : <span className="text-white">Pick a date</span>}  
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={coverageStartDate ? new Date(coverageStartDate) : undefined} onSelect={(date) => {
                      setCoverageStartDate(date ? date.toISOString().split("T")[0] : "")
                      if (coverageStartDateError) setCoverageStartDateError("") // Clear error when selecting
                    }} initialFocus />
                  </PopoverContent>
                </Popover>
                {coverageStartDateValid && (
                  <div className="flex flex-row bg-white rounded-md p-2 gap-2 mb-6 max-w-fit">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <p className="text-green-500 text-sm">Valid coverage start date</p>
                  </div>
                )}
                {coverageStartDateError && (
                  <div className="flex flex-row bg-white rounded-md p-2 gap-2 mb-6 max-w-fit">
                    <AlertCircleIcon className="h-4 w-4 text-red-500" />
                  <p className="text-red-500 text-sm">{coverageStartDateError}</p>
                  </div>
                )}
                {coverageStartDateValid && (
                  <div className="flex flex-row bg-white rounded-md p-2 gap-2 mb-6 max-w-fit">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <p className="text-green-500 text-sm">Valid coverage start date</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-white text-lg font-medium">Step 5/6</span>
                  <div className="flex gap-4">
                    <Button
                      onClick={handleRegistrationBack}
                      className="btn-white-outline"
                      disabled={isValidating}
                    >   
                      Back
                    </Button>
                    <Button
                      onClick={handleRegistrationNext}
                      disabled={!isStepValid() || isValidating}
                      className="btn-white"
                    >
                      {isValidating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Validando...
                        </>
                      ) : (
                        'Next'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {registrationStep === 6 && (
              <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-3xl p-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center text-balance">
                  How often would you like to make payments?
                </h2>

                <div className="mb-8">
                  <Select
                    value={paymentFrequency}
                    onValueChange={setPaymentFrequency}
                  >
                    <SelectTrigger className="input-epicare w-full text-lg font-semibold mb-0">
                      <SelectValue placeholder="Select payment frequency" />
                    </SelectTrigger>
                    <SelectContent>   
                      <SelectItem value="monthly"  >Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="semi-annually">Semi-Annually</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white text-lg font-medium">Step 6/6</span>
                  <div className="flex gap-4">
                    <Button
                      onClick={handleRegistrationBack}
                      className="btn-white-outline"
                      disabled={isSubmitting}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleRegistrationNext}
                      disabled={!isStepValid() || isSubmitting}
                      className="btn-white"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        'Complete'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (step === 2 && hasAccount === true) {
    return (
      <div className="min-h-screen flex">
        {/* Left side - Orange with illustrations */}
        <div className="hidden md:flex md:w-1/2 bg-[#FF7A45] relative overflow-hidden">
          {/* Illustration - Person with dog */}
          <div className="absolute left-8 bottom-0 w-48 h-80 lg:w-56 lg:h-96">
            <Image
              src="/images/design-mode/IdWjh1_1_.png"
              alt="Person with phone and dog"
              fill
              className="object-contain object-bottom"
            />
          </div>

          <div className="absolute right-0 bottom-0 w-64 h-96 lg:w-80 lg:h-[500px]">
            <Image
              src="/images/design-mode/Group%205.png"
              alt="Houses, car and medical clipboard"
              fill
              className="object-contain object-bottom"
            />
          </div>
        </div>

        {/* Right side - White with login form */}
        <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="border-2 border-gray-300 rounded-3xl p-8 md:p-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Login</h1>
              <p className="text-gray-600 mb-8">Login with the data you entered during your registration.</p>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-gray-900 font-semibold mb-2 block">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-epicare"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-gray-900 font-semibold mb-2 block">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-epicare"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-full bg-[#4ABADB] hover:bg-[#3AA0C5] text-white  text-lg font-semibold"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    'Log in'
                  )}
                </Button>

                <div className="text-center">
                  <Link href="/forgot-password" className="text-gray-600 hover:text-gray-900 text-sm">
                    Did you forget your password?
                  </Link>
                </div>
              </form>
            </div>

            {/* Footer links */}
            <div className="flex justify-end gap-6 mt-8 text-sm text-gray-600">
              <Link href="/cookies" className="hover:text-gray-900">
                Cookies
              </Link>
              <Link href="/legal-policy" className="hover:text-gray-900">
                Legal policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary relative overflow-hidden">
      {/* Illustration - Person with dog */}
      <div className="absolute left-[-10rem] bottom-0 w-[600px] h-[600px]">
        <Image
          src={img1}
          alt="Person with phone and dog"
          fill
          className="object-contain object-bottom"
        />
      </div>

      <div className="absolute right-[-20rem] bottom-0 w-[600px] h-[600px]">
        <Image
          src={img2}
          alt="Houses, car and medical clipboard"
          fill
          className="object-contain object-bottom"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-20">
        <div className="w-full max-w-2xl">
          {/* Step 1: Account question */}
          {step === 1 && (
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-3xl p-12 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-12 text-balance">
                Do you already have an account?
              </h2>
              <div className="flex gap-6 justify-center">
                <Button
                  size="lg"
                  onClick={() => handleAccountChoice(true)}
                  className="btn-white-outline"
                >
                  Yes
                </Button>
                <Button
                  size="lg"
                  onClick={() => handleAccountChoice(false)}
                    className="btn-white"
                >
                  No
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
