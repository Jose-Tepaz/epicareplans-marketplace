import {
  AllstateQuoteRequest,
  AllstateQuoteResponse,
  AllstateMappedPlan,
} from './types'
import type { InsuranceFormData, InsurancePlan } from '@/lib/types/insurance'

class AllstateAPI {
  private readonly baseURL: string
  private readonly authToken: string
  private readonly agentId: string

  constructor() {
    this.baseURL =
      process.env.ALLSTATE_API_URL ||
      'https://qa1-ngahservices.ngic.com/QuotingAPI/api/v1/Rate/AllPlans'
    this.authToken =
      process.env.ALLSTATE_AUTH_TOKEN || 'VGVzdFVzZXI6VGVzdDEyMzQ='
    this.agentId = '' // No environment fallback allowed by user policy. Must be provided by caller (DB).
  }

  buildQuoteRequest(formData: InsuranceFormData & { dependents?: any[] }, agentId?: string): AllstateQuoteRequest {
    const effectiveDate = new Date(formData.coverageStartDate).toISOString()
    const birthDate = new Date(formData.dateOfBirth).toISOString()

    // Primary applicant structure matching the user's example
    const applicants: any[] = [
      {
        birthDate,
        gender:
          formData.gender === 'male'
            ? 'Male'
            : formData.gender === 'female'
            ? 'Female'
            : 'Male',
        relationshipType: 'Primary',
        isSmoker: formData.smokes,
        hasPriorCoverage: false,
        rateTier: 'Standard',
        memberId: 'primary-001',
        ...(formData.smokes &&
          formData.lastTobaccoUse && {
            dateLastSmoked: new Date(formData.lastTobaccoUse).toISOString(),
          }),
      },
    ]

    // Add dependents if present
    console.log('🔍 buildQuoteRequest - formData.dependents:', formData.dependents)
    console.log('🔍 buildQuoteRequest - dependents count:', formData.dependents?.length || 0)
    
    if (formData.dependents && Array.isArray(formData.dependents)) {
      formData.dependents.forEach((dep, index) => {
        // Support both camelCase and snake_case for dateOfBirth
        const dobString = dep.dateOfBirth || dep.date_of_birth
        
        console.log(`🔍 Processing dependent ${index + 1}:`, {
          firstName: dep.firstName,
          lastName: dep.lastName,
          dateOfBirth: dobString,
          gender: dep.gender,
          relationship: dep.relationship,
          smoker: dep.smoker
        })
        
        if (dobString) {
          try {
            const depBirthDate = new Date(dobString).toISOString()
            const applicant = {
              birthDate: depBirthDate,
              gender:
                dep.gender === 'Male' || dep.gender === 'male' ? 'Male' : 'Female',
              // Map relationship to Allstate accepted values: None, Primary, Spouse, Dependent
              relationshipType: dep.relationship === 'Spouse' ? 'Spouse' : 'Dependent',
              isSmoker: dep.smoker || false,
              hasPriorCoverage: false,
              rateTier: 'Standard',
              memberId: `additional-${String(index + 1).padStart(3, '0')}`
            }
            console.log(`✅ Added dependent ${index + 1} to applicants:`, applicant)
            applicants.push(applicant)
          } catch (e) {
            console.warn('❌ Skipping invalid dependent date of birth:', dobString, e)
          }
        } else {
          console.warn(`⚠️ Dependent ${index + 1} missing dateOfBirth:`, dep)
        }
      })
    } else {
      console.warn('⚠️ No dependents found or dependents is not an array')
    }
    
    console.log(`📊 Total applicants (primary + dependents): ${applicants.length}`)

    // Construct the payload exactly as requested, removing extra fields
    // Note: 'productTypes' was removed as it wasn't in the user's example
    // Note: 'PlansToRate' and 'ExcludeAvailablePlans' were removed
    const finalAgentId = agentId || this.agentId
    if (!finalAgentId) {
      throw new Error('Allstate Agent ID is required and was not provided from database (no referral code or default agent found).')
    }

    const requestPayload = {
      agentId: finalAgentId,
      effectiveDate,
      zipCode: formData.zipCode,
      applicants,
      paymentFrequency: this.mapPaymentFrequency(formData.paymentFrequency)
    } as unknown as AllstateQuoteRequest // Type assertion to bypass strict type checks if interface differs
    
    console.log('📤 Allstate Quote Request Payload:', {
      agentId: requestPayload.agentId,
      zipCode: requestPayload.zipCode,
      effectiveDate: requestPayload.effectiveDate,
      applicantsCount: requestPayload.applicants?.length || 0,
      applicants: requestPayload.applicants?.map((app: any) => ({
        memberId: app.memberId,
        relationshipType: app.relationshipType,
        gender: app.gender,
        birthDate: app.birthDate,
        isSmoker: app.isSmoker
      }))
    })
    
    return requestPayload
  }

  private mapPaymentFrequency(
    frequency: InsuranceFormData['paymentFrequency']
  ): AllstateQuoteRequest['paymentFrequency'] {
    switch (frequency) {
      case 'quarterly':
        return 'Quarterly'
      case 'semi-annually':
        return 'Semi-Annually'
      case 'annually':
        return 'Annually'
      default:
        return 'Monthly'
    }
  }

  private mapResponseToPlans(response: AllstateQuoteResponse | any[]): InsurancePlan[] {
    // Handle both array response and object with availablePlans
    let plansArray: any[] = []
    
    if (Array.isArray(response)) {
      plansArray = response
    } else if (response && Array.isArray(response.availablePlans)) {
      plansArray = response.availablePlans
    } else {
      console.error('Invalid Allstate response structure:', response)
      return []
    }

    if (plansArray.length === 0) {
      console.warn('Allstate returned 0 plans')
      return []
    }

    return plansArray.map<AllstateMappedPlan>((plan) => {
      // Determine price from available fields
      // Prioritize totalRate > rate > insuranceRate > monthlyPremium
      const rawPrice = plan.totalRate || plan.rate || plan.insuranceRate || plan.monthlyPremium || 0
      const price = typeof rawPrice === 'number' ? rawPrice : parseFloat(rawPrice) || 0

      if (price === 0) {
        console.warn('Plan with 0 price detected:', { 
          name: plan.planName, 
          id: plan.id, 
          raw: plan 
        })
      }

      const mappedPlan: AllstateMappedPlan = {
        id: plan.id || 'unknown',
        name: plan.planName || 'Unknown Plan',
        price,
        coverage: plan.benefitDescription || 'No coverage description',
        productType: plan.productType || 'Unknown',
        benefits: Array.isArray(plan.benefits)
          ? plan.benefits.map((benefit: any) => benefit.name || 'Unknown benefit')
          : [],
        allState: true,
        planType: plan.planType || 'Unknown',
        benefitDescription: plan.benefitDescription || 'No description',
        brochureUrl: plan.pathToBrochure,
        carrierName: plan.carrierName,
        carrierSlug: 'allstate',
        productCode: plan.productCode,
        planKey: plan.planKey,
      }

      return mappedPlan
    })
  }

  async getInsuranceQuotes(formData: InsuranceFormData & { dependents?: any[] }, agentId?: string): Promise<InsurancePlan[]> {
    const requestData = this.buildQuoteRequest(formData, agentId)

    const finalId = agentId || this.agentId;
    console.log('⚡ [CLIENT] getInsuranceQuotes usando AgentID:', finalId || "UNDEFINED/EMPTY");
 
    console.log('Sending request to Allstate API:', {
      url: this.baseURL,
      requestData,
      authToken: this.authToken ? 'Present' : 'Missing',
      agentId: finalId,
    })

    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${this.authToken}`,
      },
      body: JSON.stringify(requestData),
      signal: AbortSignal.timeout(60_000),
    })

    console.log(
      'Allstate API Response Status:',
      response.status,
      response.statusText
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Allstate API Error Response:', errorText)
      throw new Error(
        `Allstate API error: ${response.status} ${response.statusText} - ${errorText}`
      )
    }

    const data = await response.json()
    console.log('Allstate API Response:', data)
    console.log('Response is array:', Array.isArray(data))
    console.log('Plans count:', Array.isArray(data) ? data.length : (data?.availablePlans?.length || 0))
    return this.mapResponseToPlans(data)
  }

  validateFormData(
    formData: InsuranceFormData
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!formData.zipCode) {
      errors.push('ZIP Code is required')
    }

    if (!formData.dateOfBirth) {
      errors.push('Date of birth is required')
    }

    const dob = new Date(formData.dateOfBirth)
    if (Number.isNaN(dob.getTime())) {
      errors.push('Invalid date of birth')
    }

    const startDate = new Date(formData.coverageStartDate)
    if (Number.isNaN(startDate.getTime())) {
      errors.push('Invalid coverage start date')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

export const allstateAPI = new AllstateAPI()
