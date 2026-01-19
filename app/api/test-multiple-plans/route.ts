import { NextRequest, NextResponse } from 'next/server';
import { applicationBundleAPI } from '@/lib/api/carriers/allstate';

/**
 * POST /api/test-multiple-plans
 * 
 * Endpoint de testing para probar múltiples planes
 */
export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    
    console.log('Testing multiple plans with data:', requestData);

    // Datos de prueba para 2 planes
    const testPlans = [
      {
        id: "2144",
        name: "Accident Fixed-Benefit",
        price: 25.15,
        coverage: "$25,000/$50,000 Benefit",
        productType: "NHICSupplemental",
        benefits: ["One Time Enrollment Fee", "LIFE Association Membership"],
        allState: true,
        planType: "NICAFB",
        benefitDescription: "$25,000/$50,000 Benefit",
        brochureUrl: "https://allstatehealth.canto.com/direct/document/arajrcs24944d28vfj22097p4p/bmb78ne6pRgoe0oRhGAAgc7AHYs/original?content-type=application%2Fpdf&name=2024_0125_AHS_AFB_1037-2_BRO.pdf",
        carrierName: null
      },
      {
        id: "2145",
        name: "Life Insurance",
        price: 35.50,
        coverage: "$50,000 Life Insurance",
        productType: "NHICSupplemental",
        benefits: ["Life Coverage", "Death Benefit"],
        allState: true,
        planType: "NICLI",
        benefitDescription: "$50,000 Life Insurance Coverage",
        brochureUrl: "https://example.com/life-insurance.pdf",
        carrierName: null
      }
    ];

    const testRequest = {
      selectedPlans: testPlans,
      state: "CA",
      effectiveDate: "2025-11-25T00:00:00Z",
      dateOfBirth: "2002-10-03",
      isSmoker: false,
      hasHealthConditions: false,
      weight: 150,
      heightFeet: 5,
      heightInches: 8,
      hasPriorCoverage: false,
      hasMedicare: false
    };

    console.log('Sending test request:', testRequest);

    // Llamar al ApplicationBundle API
    const applicationBundle = await applicationBundleAPI.getApplicationBundle(
      testRequest.selectedPlans,
      testRequest.state,
      testRequest.effectiveDate,
      "TEST_AGENT_ID",
      testRequest.dateOfBirth,
      testRequest.isSmoker,
      testRequest.hasHealthConditions,
      testRequest.weight,
      testRequest.heightFeet,
      testRequest.heightInches,
      testRequest.hasPriorCoverage,
      testRequest.hasMedicare
    );

    console.log('Test successful:', applicationBundle);

    return NextResponse.json({
      success: true,
      message: 'Multiple plans test successful',
      data: {
        applicationBundle,
        testPlans,
        testRequest
      }
    });

  } catch (error) {
    console.error('Error in multiple plans test:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Multiple plans test failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to test multiple plans.' },
    { status: 405 }
  );
}
