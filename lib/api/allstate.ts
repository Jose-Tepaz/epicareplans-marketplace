import { 
  AllStateQuoteRequest, 
  AllStateQuoteResponse, 
  InsuranceFormData, 
  InsurancePlan 
} from '@/lib/types/insurance';

// All State API client
export class AllStateAPI {
  private baseURL: string;
  private authToken: string;
  private agentId: string;

  constructor() {
    this.baseURL = process.env.ALLSTATE_API_URL || 'https://qa1-ngahservices.ngic.com/QuotingAPI/api/v1/Rate/AllPlans';
    this.authToken = process.env.ALLSTATE_AUTH_TOKEN || 'VGVzdFVzZXI6VGVzdDEyMzQ=';
    this.agentId = process.env.ALLSTATE_AGENT_ID || '159208';
  }

  // Map form data to All State API format
  private mapFormDataToRequest(formData: InsuranceFormData): AllStateQuoteRequest {
    // Convert dates to ISO format with time component (as required by API)
    const effectiveDate = new Date(formData.coverageStartDate).toISOString();
    const birthDate = new Date(formData.dateOfBirth).toISOString();

    const request: AllStateQuoteRequest = {
      PlansToRate: null,
      ExcludeAvailablePlans: false,
      agentId: this.agentId,
      effectiveDate: effectiveDate,
      zipCode: formData.zipCode,
      applicants: [
        {
          birthDate: birthDate,
          gender: formData.gender === 'male' ? 'Male' : formData.gender === 'female' ? 'Female' : 'Male',
          relationshipType: 'Primary',
          isSmoker: formData.smokes
        }
      ],
      paymentFrequency: this.mapPaymentFrequency(formData.paymentFrequency),
      productTypes: ['NHICSupplemental']
    };

    return request;
  }

  // Map payment frequency from form to API format
  private mapPaymentFrequency(frequency: string): "Monthly" | "Quarterly" | "Semi-Annually" | "Annually" {
    switch (frequency) {
      case 'monthly':
        return 'Monthly';
      case 'quarterly':
        return 'Quarterly';
      case 'semi-annually':
        return 'Semi-Annually';
      case 'annually':
        return 'Annually';
      default:
        return 'Monthly';
    }
  }

  // Map All State response to our UI format
  private mapResponseToPlans(response: AllStateQuoteResponse): InsurancePlan[] {
    // Check if response has the expected structure
    if (!response || !response.availablePlans || !Array.isArray(response.availablePlans)) {
      console.error('Invalid response structure:', response);
      return [];
    }

    return response.availablePlans.map(plan => {
      const mappedPlan = {
        id: plan.id || 'unknown',
        name: plan.planName || 'Unknown Plan',
        price: plan.insuranceRate || 0,
        coverage: plan.benefitDescription || 'No coverage description',
        productType: plan.productType || 'Unknown',
        benefits: plan.benefits && Array.isArray(plan.benefits) 
          ? plan.benefits.map(benefit => benefit.name || 'Unknown benefit')
          : [],
        allState: true,
        planType: plan.planType || 'Unknown',
        benefitDescription: plan.benefitDescription || 'No description',
        brochureUrl: plan.pathToBrochure, 
        carrierName: plan.carrierName,
        // Preservar campos necesarios para ApplicationBundle API
        productCode: plan.productCode,
        planKey: plan.planKey
      };

      console.log('Mapeando plan del Quoting API:', {
        originalPlan: {
          id: plan.id,
          productCode: plan.productCode,
          planKey: plan.planKey,
          planName: plan.planName
        },
        mappedPlan: {
          id: mappedPlan.id,
          productCode: mappedPlan.productCode,
          planKey: mappedPlan.planKey,
          name: mappedPlan.name
        }
      });

      // Log adicional para debugging
      if (!plan.productCode || !plan.planKey) {
        console.warn('Plan del Quoting API sin campos requeridos:', {
          id: plan.id,
          productCode: plan.productCode,
          planKey: plan.planKey,
          planName: plan.planName,
          allFields: Object.keys(plan)
        });
      }

      return mappedPlan;
    });
  }

  // Get insurance quotes from All State API
  async getInsuranceQuotes(formData: InsuranceFormData): Promise<InsurancePlan[]> {
    try {
      const requestData = this.mapFormDataToRequest(formData);
      
      console.log('Sending request to All State API:', {
        url: this.baseURL,
        requestData,
        authToken: this.authToken ? 'Present' : 'Missing',
        agentId: this.agentId
      });

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.authToken}`,
        },
        body: JSON.stringify(requestData),
        signal: AbortSignal.timeout(60000), // 60 second timeout
      }); 

      console.log('All State API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('All State API Error Response:', errorText);
        throw new Error(`All State API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: AllStateQuoteResponse = await response.json();
      
      // Log the response for debugging
      console.log('All State API Response:', data);
      
      return this.mapResponseToPlans(data);
    } catch (error) {
      console.error('Error fetching insurance quotes:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to fetch insurance quotes from All State: ${error.message}`);
      }
      throw new Error('Failed to fetch insurance quotes from All State');
    }
  }

  // Validate form data before sending to API
  validateFormData(formData: InsuranceFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!formData.zipCode || formData.zipCode.length < 5) {
      errors.push('ZIP code is required and must be at least 5 characters');
    }

    if (!formData.dateOfBirth) {
      errors.push('Date of birth is required');
    }

    if (!formData.gender) {
      errors.push('Gender is required');
    }

    if (formData.smokes === null || formData.smokes === undefined) {
      errors.push('Smoking status is required');
    }

    if (formData.smokes && !formData.lastTobaccoUse) {
      errors.push('Last tobacco use date is required for smokers');
    }

    if (!formData.coverageStartDate) {
      errors.push('Coverage start date is required');
    }

    if (!formData.paymentFrequency) {
      errors.push('Payment frequency is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const allStateAPI = new AllStateAPI();
