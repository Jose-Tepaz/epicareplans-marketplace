import { NextRequest, NextResponse } from 'next/server';
/**
 * POST /api/debug-application-bundle
 * 
 * Endpoint de debugging para probar con datos reales
 */
export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    
    console.log('=== DEBUG APPLICATION BUNDLE ===');
    console.log('Request received:', JSON.stringify(requestData, null, 2));

    // Validar datos básicos
    if (!requestData.selectedPlans || !Array.isArray(requestData.selectedPlans)) {
      return NextResponse.json({
        error: 'Invalid request: selectedPlans is required and must be an array',
        received: requestData
      }, { status: 400 });
    }

    console.log('Plans analysis:', {
      totalPlans: requestData.selectedPlans.length,
      plans: requestData.selectedPlans.map((plan: any, index: number) => ({
        index: index + 1,
        id: plan.id,
        name: plan.name,
        productCode: plan.productCode,
        planKey: plan.planKey,
        hasProductCode: !!plan.productCode,
        hasPlanKey: !!plan.planKey,
        allFields: Object.keys(plan)
      }))
    });

    // Intentar mapear los datos manualmente
    console.log('=== MANUAL MAPPING TEST ===');
    
    const planIds = requestData.selectedPlans.map((plan: any, index: number) => {
      console.log(`Mapping plan ${index + 1}:`, {
        id: plan.id,
        name: plan.name,
        productCode: plan.productCode,
        planKey: plan.planKey
      });
      
      // Mapeo manual para planes conocidos
      if (plan.id === "2144" && plan.name === "Accident Fixed-Benefit") {
        console.log('Using manual mapping for Accident Fixed-Benefit');
        return "21673";
      }
      
      if (plan.id === "Life50000" && plan.name === "Life Only - Individual") {
        console.log('Using manual mapping for Life Only - Individual');
        return "21675";
      }
      
      if (plan.id === "2145" && plan.name === "Life Insurance") {
        console.log('Using manual mapping for Life Insurance');
        return "21674";
      }
      
      // Usar productCode si existe
      if (plan.productCode) {
        console.log(`Using productCode: ${plan.productCode}`);
        return plan.productCode;
      }
      
      // Fallback al ID
      console.log(`Using ID as fallback: ${plan.id}`);
      return plan.id;
    });

    const planKeys = requestData.selectedPlans.map((plan: any, index: number) => {
      // Mapeo manual para planes conocidos
      if (plan.id === "2144" && plan.name === "Accident Fixed-Benefit") {
        return "Life 25000";
      }
      
      if (plan.id === "Life50000" && plan.name === "Life Only - Individual") {
        return "Life Only Premium";
      }
      
      if (plan.id === "2145" && plan.name === "Life Insurance") {
        return "Life Insurance Premium";
      }
      
      // Usar planKey si existe
      if (plan.planKey) {
        return plan.planKey;
      }
      
      // Fallback al name
      return plan.name;
    });

    console.log('Mapped data:', {
      planIds,
      planKeys,
      state: requestData.state,
      effectiveDate: requestData.effectiveDate
    });

    // Crear request manual
    const manualRequest = {
      state: requestData.state || "CA",
      planIds: planIds,
      planKeys: planKeys,
      effectiveDate: requestData.effectiveDate || "2025-11-25T00:00:00Z",
      dateOfBirth: requestData.dateOfBirth,
      agentNumber: "159208",
      isEFulfillment: true,
      isFulfillment: true,
      paymentFrequency: "Monthly",
      termLengthInDays: 365,
      memberCount: 1,
      rateTier: "Standard",
      medSuppEnrollmentType: undefined,
      isTrioMedAme: false,
      isTrioMedCi: false,
      isBundledWithRecuro: false,
      isRenewalRider: false,
      userType: "Individual",
      applicationFormNumber: `APP-${Date.now()}`
    };

    console.log('Manual request to send:', JSON.stringify(manualRequest, null, 2));

    // Intentar llamar al API externo directamente
    console.log('=== CALLING EXTERNAL API ===');
    
    const response = await fetch('https://qa1-ngahservices.ngic.com/EnrollmentApi/api/ApplicationBundle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic VGVzdFVzZXI6VGVzdDEyMzQ=',
      },
      body: JSON.stringify(manualRequest),
      signal: AbortSignal.timeout(30000)
    });

    console.log('External API response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error response:', errorText);
      
      return NextResponse.json({
        error: 'External API error',
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
        requestSent: manualRequest
      }, { status: 500 });
    }

    const data = await response.json();
    console.log('External API success response:', data);

    return NextResponse.json({
      success: true,
      message: 'Debug successful',
      requestSent: manualRequest,
      responseReceived: data
    });

  } catch (error) {
    console.error('Debug error:', error);
    
    return NextResponse.json({
      error: 'Debug failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to debug ApplicationBundle.' },
    { status: 405 }
  );
}
