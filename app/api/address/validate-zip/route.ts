import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const zipCode = url.pathname.split('/').pop();
    
    if (!zipCode || !/^\d{5}$/.test(zipCode)) {
      return NextResponse.json(
        { error: 'Invalid ZIP code format. Must be 5 digits.' },
        { status: 400 }
      );
    }

    const allStateUrl = `https://qa1-ngahservices.ngic.com/QuotingAPI/api/v1/Address/StateAbbreviation/${zipCode}`;
    const authToken = process.env.ALLSTATE_AUTH_TOKEN || 'VGVzdFVzZXI6VGVzdDEyMzQ=';

    console.log('Validating ZIP code:', zipCode);

    const response = await fetch(allStateUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authToken}`,
      },
    });

    console.log('ZIP validation response status:', response.status);

    if (response.ok) {
      const stateAbbreviation = await response.text();
      console.log('Valid ZIP code, state:', stateAbbreviation);
      
      return NextResponse.json({
        valid: true,
        state: stateAbbreviation.replace(/"/g, ''), // Remove quotes if present
        zipCode: zipCode
      });
    } else {
      const errorText = await response.text();
      console.log('Invalid ZIP code:', errorText);
      
      return NextResponse.json({
        valid: false,
        error: 'ZIP code not found',
        zipCode: zipCode
      });
    }

  } catch (error) {
    console.error('Error validating ZIP code:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to validate ZIP code',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
