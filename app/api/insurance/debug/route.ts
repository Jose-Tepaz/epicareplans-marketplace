import { NextRequest, NextResponse } from 'next/server';
import { allstate } from '@/lib/api/carriers';
import { InsuranceFormData } from '@/lib/types/insurance';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const formData: InsuranceFormData = await request.json();

    // Validate form data
    const validation = allstate.allstateAPI.validateFormData(formData);
    
    // Build the request that would be sent to All State
    const allstateRequest = allstate.allstateAPI.buildQuoteRequest(formData);

    // Return debug information
    return NextResponse.json({
      success: true,
      message: 'Debug endpoint - no actual API call made',
      formDataReceived: formData,
      allStateRequestToBeSent: allstateRequest,
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
