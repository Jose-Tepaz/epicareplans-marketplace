import { NextRequest, NextResponse } from 'next/server';
import { InsuranceFormData } from '@/lib/types/insurance';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const formData: InsuranceFormData = await request.json();

    console.log('Form data received:', formData);

    // Convert dates to ISO format
    const effectiveDate = new Date(formData.coverageStartDate).toISOString();
    const birthDate = new Date(formData.dateOfBirth).toISOString();

    // Map payment frequency
    const paymentFrequency = formData.paymentFrequency === 'monthly' ? 'Monthly' : 
                            formData.paymentFrequency === 'quarterly' ? 'Quarterly' :
                            formData.paymentFrequency === 'semi-annually' ? 'Semi-Annually' : 'Annually';

    // Build All State request exactly as it works in Insomnia
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
          isSmoker: formData.smokes,
          ...(formData.smokes && formData.lastTobaccoUse && {
            dateLastSmoked: new Date(formData.lastTobaccoUse).toISOString()
          })
        }
      ],
      paymentFrequency: paymentFrequency,
      productTypes: ['NHICSupplemental']
    };

    console.log('Sending to All State:', JSON.stringify(allStateRequest, null, 2));

    const allStateUrl = process.env.ALLSTATE_API_URL || 'https://qa1-ngahservices.ngic.com/QuotingAPI/api/v1/Rate/AllPlans';
    const authToken = process.env.ALLSTATE_AUTH_TOKEN || 'VGVzdFVzZXI6VGVzdDEyMzQ=';

    // Make request to All State
    const response = await fetch(allStateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authToken}`,
      },
      body: JSON.stringify(allStateRequest),
    });

    console.log('All State response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('All State error:', errorText);
      return NextResponse.json(
        { 
          error: 'All State API error', 
          details: errorText,
          status: response.status
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // All State returns an array directly, not an object with properties
    const allStatePlans = Array.isArray(data) ? data : (data.ratedPlans || data.availablePlans || []);
    
    console.log('All State plans received:', allStatePlans.length);
    console.log('First plan sample:', allStatePlans[0]?.planName);

    // Map response to our format
    const plans = allStatePlans.map((plan: any) => ({
      id: plan.id || 'unknown',
      name: plan.planName || 'Unknown Plan',
      price: plan.insuranceRate || 0,
      coverage: plan.benefitDescription || 'No coverage description',
      productType: plan.productType || 'Unknown',
      benefits: plan.benefits && Array.isArray(plan.benefits) 
        ? plan.benefits.map((benefit: any) => benefit.name || 'Unknown benefit')
        : [],
      allState: true,
      planType: plan.planType || 'Unknown',
      benefitDescription: plan.benefitDescription || 'No description',
      brochureUrl: plan.pathToBrochure,
      carrierName: plan.carrierName
    }));

    console.log('Mapped plans count:', plans.length);
    console.log('First plan:', plans[0]);

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