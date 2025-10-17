import { NextRequest, NextResponse } from 'next/server';
import type { EnrollmentRequest } from '@/lib/types/enrollment';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const enrollmentData: EnrollmentRequest = await request.json();

    console.log('Enrollment data received:', JSON.stringify(enrollmentData, null, 2));

    // TODO: Add validation here
    if (!enrollmentData.demographics || !enrollmentData.coverages) {
      return NextResponse.json(
        { error: 'Missing required fields: demographics and coverages are required' },
        { status: 400 }
      );
    }

    // Build the All State enrollment request
    const allStateUrl = process.env.ALLSTATE_ENROLLMENT_URL || 'https://qa1-ngahservices.ngic.com/EnrollmentAPI/api/Enrollment';
    const authToken = process.env.ALLSTATE_AUTH_TOKEN || 'VGVzdFVzZXI6VGVzdDEyMzQ=';

    console.log('Sending enrollment to All State API:', allStateUrl);

    // Make request to All State Enrollment API
    const response = await fetch(allStateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authToken}`,
      },
      body: JSON.stringify(enrollmentData),
    });

    console.log('All State enrollment response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('All State enrollment error:', errorText);

      return NextResponse.json(
        {
          error: 'Enrollment API error',
          details: errorText,
          status: response.status
        },
        { status: response.status }
      );
    }

    const result = await response.json();

    console.log('Enrollment successful:', result);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Enrollment submitted successfully',
      data: result
    });

  } catch (error) {
    console.error('Error in /api/enrollment:', error);

    return NextResponse.json(
      {
        error: 'Failed to process enrollment',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to submit enrollment.' },
    { status: 405 }
  );
}
