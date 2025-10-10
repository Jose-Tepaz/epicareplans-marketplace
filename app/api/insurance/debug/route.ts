import { NextRequest, NextResponse } from 'next/server';
import { allStateAPI } from '@/lib/api/allstate';
import { InsuranceFormData } from '@/lib/types/insurance';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const formData: InsuranceFormData = await request.json();

    // Validate form data
    const validation = allStateAPI.validateFormData(formData);
    
    // Build the request that would be sent to All State
    const effectiveDate = new Date(formData.coverageStartDate).toISOString();
    const birthDate = new Date(formData.dateOfBirth).toISOString();
    
    const allStateRequest = {
      PlansToRate: null,
      ExcludeAvailablePlans: false,
      agentId: process.env.ALLSTATE_AGENT_ID || '159208',
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
      paymentFrequency: formData.paymentFrequency === 'monthly' ? 'Monthly' : 
                        formData.paymentFrequency === 'quarterly' ? 'Quarterly' :
                        formData.paymentFrequency === 'semi-annually' ? 'Semi-Annually' : 'Annually',
      productTypes: ['NHICSupplemental']
    };

    // Return debug information
    return NextResponse.json({
      success: true,
      message: 'Debug endpoint - no actual API call made',
      formDataReceived: formData,
      allStateRequestToBeSent: allStateRequest,
      validation: validation,
      endpoint: process.env.ALLSTATE_API_URL || 'https://qa1-ngahservices.ngic.com/QuotingAPI/api/v1/Rate/AllPlans',
      authToken: process.env.ALLSTATE_AUTH_TOKEN ? 'Present' : 'Missing'
    });

  } catch (error) {
    console.error('Error in /api/insurance/debug:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
