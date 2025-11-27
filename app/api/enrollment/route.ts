import { NextRequest, NextResponse } from 'next/server';
import type { EnrollmentRequest } from '@/lib/types/enrollment';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const enrollmentData: EnrollmentRequest = await request.json();
    
    // Obtener IP real del cliente
    const clientIP = 
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      '::1';
    
    // Actualizar clientIPAddress solo en attestationInformation (para Allstate)
    // partnerInformation para Allstate NO debe incluir clientIPAddress según estructura esperada
    if (enrollmentData.attestationInformation) {
      enrollmentData.attestationInformation.clientIPAddress = clientIP;
    }
    
    console.log('Client IP:', clientIP);
    console.log('Enrollment data received:', JSON.stringify(enrollmentData, null, 2));
    
    // Log specific fields that might cause issues
    console.log('=== DETAILED FIELD ANALYSIS ===');
    if (enrollmentData.demographics?.applicants?.[0]) {
      const applicant = enrollmentData.demographics.applicants[0];
      console.log('Primary applicant fields:', {
        applicantId: applicant.applicantId,
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        gender: applicant.gender,
        relationship: applicant.relationship,
        ssn: applicant.ssn ? '***' + applicant.ssn.slice(-4) : 'missing',
        dob: applicant.dob,
        hasMedSuppInfo: !!applicant.medSuppInfo,
        hasMedications: !!applicant.medications,
        hasQuestionResponses: !!applicant.questionResponses,
        phoneNumbers: applicant.phoneNumbers?.length || 0
      });
    }
    
    if (enrollmentData.coverages?.[0]) {
      const coverage = enrollmentData.coverages[0];
      console.log('Coverage fields:', {
        planKey: coverage.planKey,
        effectiveDate: coverage.effectiveDate,
        monthlyPremium: coverage.monthlyPremium,
        paymentFrequency: coverage.paymentFrequency,
        carrierName: coverage.carrierName,
        agentNumber: coverage.agentNumber,
        applicantsCount: coverage.applicants?.length || 0,
        beneficiariesCount: coverage.beneficiaries?.length || 0
      });
    }
    
    if (enrollmentData.paymentInformation) {
      const payment = enrollmentData.paymentInformation;
      console.log('Payment fields:', {
        accountType: payment.accountType,
        hasCreditCard: !!payment.creditCardNumber,
        hasBankAccount: !!payment.routingNumber,
        isSubmitWithoutPayment: payment.isSubmitWithoutPayment
      });
    }

    // Validate required fields
    if (!enrollmentData.demographics || !enrollmentData.coverages) {
      return NextResponse.json(
        { error: 'Missing required fields: demographics and coverages are required' },
        { status: 400 }
      );
    }

    // Validate demographics structure
    if (!enrollmentData.demographics.applicants || enrollmentData.demographics.applicants.length === 0) {
      return NextResponse.json(
        { error: 'Missing applicants in demographics' },
        { status: 400 }
      );
    }

    // Validate coverages structure
    if (!enrollmentData.coverages || enrollmentData.coverages.length === 0) {
      return NextResponse.json(
        { error: 'Missing coverages' },
        { status: 400 }
      );
    }

    // Validate payment information
    if (!enrollmentData.paymentInformation) {
      return NextResponse.json(
        { error: 'Missing payment information' },
        { status: 400 }
      );
    }

    // Log validation results
    console.log('Enrollment validation passed:', {
      applicantsCount: enrollmentData.demographics.applicants.length,
      coveragesCount: enrollmentData.coverages.length,
      hasPaymentInfo: !!enrollmentData.paymentInformation,
      hasPartnerInfo: !!enrollmentData.partnerInformation,
      hasAttestationInfo: !!enrollmentData.attestationInformation
    });

    // Build the All State enrollment request
    const allStateUrl = process.env.ALLSTATE_ENROLLMENT_URL || 'https://qa1-ngahservices.ngic.com/EnrollmentAPI/api/Enrollment';
    const authToken = process.env.ALLSTATE_AUTH_TOKEN || 'VGVzdFVzZXI6VGVzdDEyMzQ=';

    console.log('Sending enrollment to All State API:', allStateUrl);
    console.log('Request headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${authToken}`,
    });
    const requestBody = JSON.stringify(enrollmentData);
    console.log('Request body size:', requestBody.length, 'characters');
    console.log('📋 FULL REQUEST BODY TO ALLSTATE:', requestBody);

    // Make request to All State Enrollment API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(allStateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authToken}`,
          'Accept': 'application/json',
          'User-Agent': 'EpicarePlans-Marketplace/1.0'
        },
        body: JSON.stringify(enrollmentData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('All State enrollment response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('All State enrollment error response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText
        });

        // Try to parse error response as JSON
        let errorDetails;
        try {
          errorDetails = JSON.parse(errorText);
        } catch {
          errorDetails = errorText;
        }

        // Handle different error types
        if (response.status === 400 && Array.isArray(errorDetails) && errorDetails.length > 0) {
          const firstError = errorDetails[0];
          
          if (firstError.errorDetail?.includes('There are no plans available')) {
            return NextResponse.json({
              success: false,
              message: 'No hay planes disponibles para los datos proporcionados',
              data: { 
                message: 'Test enrollment processed - no plans available for test demographics',
                isTestData: true,
                requiresRealData: true,
                errorDetails: errorDetails
              }
            });
          } else if (firstError.errorCode === 'RateMismatch') {
            return NextResponse.json({
              success: false,
              message: 'Error de tarifa del plan',
              data: { 
                message: 'El plan seleccionado tiene un problema de configuración de tarifa',
                errorCode: firstError.errorCode,
                errorDetail: firstError.errorDetail,
                isPlanConfigurationError: true,
                requiresPlanFix: true,
                errorDetails: errorDetails
              }
            });
          } else {
            return NextResponse.json({
              success: false,
              message: 'Error de validación en el enrollment',
              data: { 
                message: 'El enrollment no pudo ser procesado debido a errores de validación',
                errorCode: firstError.errorCode,
                errorDetail: firstError.errorDetail,
                isValidationError: true,
                errorDetails: errorDetails
              }
            });
          }
        }

        return NextResponse.json(
          {
            error: 'Enrollment API error',
            details: errorDetails,
            status: response.status,
            statusText: response.statusText
          },
          { status: response.status }
        );
      }

      const result = await response.json();
      console.log('Enrollment successful:', result);

      return NextResponse.json({
        success: true,
        message: 'Enrollment submitted successfully',
        data: result
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('Request timeout after 30 seconds');
        return NextResponse.json(
          {
            error: 'Request timeout',
            message: 'The enrollment request timed out. Please try again.'
          },
          { status: 408 }
        );
      }
      
      console.error('Fetch error:', fetchError);
      throw fetchError;
    }

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
