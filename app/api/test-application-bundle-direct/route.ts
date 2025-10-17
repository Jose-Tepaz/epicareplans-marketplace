import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/test-application-bundle-direct
 * 
 * Endpoint de prueba que envía directamente el formato que funciona en Insomnia
 */
export async function POST(request: NextRequest) {
  try {
    const allStateUrl = process.env.ALLSTATE_ENROLLMENT_URL || 'https://qa1-ngahservices.ngic.com/EnrollmentApi/api/ApplicationBundle';
    const authToken = process.env.ALLSTATE_AUTH_TOKEN || 'VGVzdFVzZXI6VGVzdDEyMzQ=';

    // Datos que sabemos que funcionan
    const testData = {
      state: "CA",
      planIds: ["21673"], 
      planKeys: ["Life 25000"],     
      effectiveDate: "2025-11-25T00:00:00Z",
      agentNumber: "159208"
    };

    console.log('Testing direct ApplicationBundle request:', testData);

    const response = await fetch(allStateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authToken}`,
      },
      body: JSON.stringify(testData),
    });

    console.log('Direct ApplicationBundle response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Direct ApplicationBundle error:', errorText);
      return NextResponse.json(
        {
          error: 'Direct ApplicationBundle API error',
          details: errorText,
          status: response.status
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('Direct ApplicationBundle success:', result);

    return NextResponse.json({
      success: true,
      message: 'Direct ApplicationBundle test successful',
      data: result
    });

  } catch (error) {
    console.error('Error in direct ApplicationBundle test:', error);
    return NextResponse.json(
      {
        error: 'Failed to test direct ApplicationBundle',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
