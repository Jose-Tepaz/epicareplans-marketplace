import { NextRequest, NextResponse } from 'next/server';
import { allstate } from '@/lib/api/carriers';
import { InsuranceFormData } from '@/lib/types/insurance';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const formData: InsuranceFormData = await request.json();

    console.log('Form data received:', formData);

    const allstateRequest = allstate.allstateAPI.buildQuoteRequest(formData);
    console.log('Sending to Allstate:', JSON.stringify(allstateRequest, null, 2));

    const plans = await allstate.allstateAPI.getInsuranceQuotes(formData);
    console.log('Plans received from Allstate:', plans.length);
    console.log('First plan sample:', plans[0]);

    // Return the plans
    return NextResponse.json({
      success: true,
      plans,
      totalPlans: plans.length
    });

  } catch (error) {
    console.error('Error in /api/insurance/quote:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch insurance quotes',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to get insurance quotes.' },
    { status: 405 }
  );
}