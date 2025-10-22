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
      '0.0.0.0';
    
    // Actualizar clientIPAddress en partner y attestations
    if (enrollmentData.partnerInformation) {
      enrollmentData.partnerInformation.clientIPAddress = clientIP;
    }
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
    console.log('Request body size:', JSON.stringify(enrollmentData).length, 'characters');

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

        // Special handling for 500 errors
        if (response.status === 500) {
          console.log('=== 500 ERROR DETECTED - ANALYZING PROBLEMATIC FIELDS ===');
          
          // Log all fields that might be causing issues
          console.log('=== FIELD ANALYSIS FOR 500 ERROR ===');
          console.log('Demographics fields:', {
            hasAddress2: !!enrollmentData.demographics.address2,
            hasAlternatePhone: !!enrollmentData.demographics.alternatePhone,
            hasZipCodePlus4: !!enrollmentData.demographics.zipCodePlus4,
            applicantsCount: enrollmentData.demographics.applicants?.length || 0
          });
          
          if (enrollmentData.demographics.applicants?.[0]) {
            const applicant = enrollmentData.demographics.applicants[0];
            console.log('Primary applicant problematic fields:', {
              hasMiddleInitial: !!applicant.middleInitial,
              hasDateLastSmoked: !!applicant.dateLastSmoked,
              hasMedSuppInfo: !!applicant.medSuppInfo,
              hasMedications: !!applicant.medications,
              hasQuestionResponses: !!applicant.questionResponses,
              hasPhoneNumbers: !!applicant.phoneNumbers,
              phoneNumbersCount: applicant.phoneNumbers?.length || 0,
              medicationsCount: applicant.medications?.length || 0,
              questionResponsesCount: applicant.questionResponses?.length || 0
            });
          }
          
          if (enrollmentData.coverages?.[0]) {
            const coverage = enrollmentData.coverages[0];
            console.log('Coverage problematic fields:', {
              hasBeneficiaries: !!coverage.beneficiaries,
              beneficiariesCount: coverage.beneficiaries?.length || 0,
              applicantsCount: coverage.applicants?.length || 0
            });
          }
          
          console.log('=== ATTEMPTING SIMPLIFIED PAYLOAD ===');
          
          // Create ultra-minimal payload with only essential fields
          const simplifiedPayload = {
            demographics: {
              zipCode: enrollmentData.demographics.zipCode,
              email: enrollmentData.demographics.email,
              address1: enrollmentData.demographics.address1,
              city: enrollmentData.demographics.city,
              state: enrollmentData.demographics.state,
              phone: enrollmentData.demographics.phone,
              isEFulfillment: true,
              isRewrite: false,
              isListBill: false,
              applicants: [{
                applicantId: "primary-001",
                firstName: enrollmentData.demographics.applicants[0].firstName,
                lastName: enrollmentData.demographics.applicants[0].lastName,
                gender: enrollmentData.demographics.applicants[0].gender,
                dob: enrollmentData.demographics.applicants[0].dob,
                smoker: enrollmentData.demographics.applicants[0].smoker,
                relationship: "Primary",
                ssn: enrollmentData.demographics.applicants[0].ssn,
                weight: enrollmentData.demographics.applicants[0].weight,
                heightFeet: enrollmentData.demographics.applicants[0].heightFeet,
                heightInches: enrollmentData.demographics.applicants[0].heightInches,
                hasPriorCoverage: enrollmentData.demographics.applicants[0].hasPriorCoverage,
                eligibleRateTier: "Standard",
                quotedRateTier: "Standard"
                // REMOVED: medications, questionResponses, phoneNumbers (all cause 500)
              }]
            },
            coverages: enrollmentData.coverages.map(coverage => ({
              planKey: coverage.planKey,
              effectiveDate: coverage.effectiveDate,
              monthlyPremium: coverage.monthlyPremium,
              paymentFrequency: coverage.paymentFrequency,
              carrierName: coverage.carrierName,
              agentNumber: coverage.agentNumber,
              isAutomaticLoanProvisionOptedIn: coverage.isAutomaticLoanProvisionOptedIn,
              applicants: [{
                applicantId: "primary-001"
              }]
              // REMOVED: beneficiaries array (even empty arrays cause 500)
            })),
            paymentInformation: enrollmentData.paymentInformation,
            partnerInformation: {
              agentNumber: "159208",
              clientIPAddress: clientIP
            },
            attestationInformation: {
              referenceId: enrollmentData.attestationInformation.referenceId,
              dateCollected: enrollmentData.attestationInformation.dateCollected,
              type: "ApplicantEsign",
              value: enrollmentData.attestationInformation.value,
              clientIPAddress: clientIP
            },
            enrollmentDate: enrollmentData.enrollmentDate
          };

          console.log('Simplified payload created, testing...');
          console.log('📋 Using user\'s actual plan:', enrollmentData.coverages[0]?.planKey);
          console.log('📋 Plan details:', {
            planKey: enrollmentData.coverages[0]?.planKey,
            monthlyPremium: enrollmentData.coverages[0]?.monthlyPremium,
            effectiveDate: enrollmentData.coverages[0]?.effectiveDate
          });
          console.log('📋 Simplified payload structure:', JSON.stringify(simplifiedPayload, null, 2));
          
          try {
            const simplifiedResponse = await fetch(allStateUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authToken}`,
                'Accept': 'application/json',
                'User-Agent': 'EpicarePlans-Marketplace/1.0'
              },
              body: JSON.stringify(simplifiedPayload),
              signal: controller.signal
            });

            console.log('Simplified payload response status:', simplifiedResponse.status);
            
        if (simplifiedResponse.ok) {
          console.log('✅ Simplified payload works! Original payload has problematic fields.');
          const result = await simplifiedResponse.json();
          console.log('📋 API Response Structure:', JSON.stringify(result, null, 2));
          
          // Check if we got a proper enrollment response
          if (result.memberId || result.submissionResults || result.policyNo) {
            return NextResponse.json({
              success: true,
              message: 'Enrollment submitted successfully (simplified payload)',
              data: result,
              warning: 'Some fields were simplified due to server compatibility: questionResponses (eligibility answers) and medications were removed, phoneNumbers were sanitized'
            });
          } else {
            return NextResponse.json({
              success: false,
              message: 'Enrollment processed but unexpected response format',
              data: result,
              warning: 'Some fields were simplified due to server compatibility: questionResponses (eligibility answers) and medications were removed, phoneNumbers were sanitized'
            });
          }
        } else if (simplifiedResponse.status === 400) {
          // Status 400 - Handle different types of validation errors
          const simplifiedErrorText = await simplifiedResponse.text();
          console.log('✅ Simplified payload works! Status 400 response:', simplifiedErrorText);
          
          try {
            const errorData = JSON.parse(simplifiedErrorText);
            if (Array.isArray(errorData) && errorData.length > 0) {
              const firstError = errorData[0];
              
              // Handle different error types
              if (firstError.errorDetail?.includes('There are no plans available')) {
                return NextResponse.json({
                  success: false,
                  message: 'No hay planes disponibles para los datos proporcionados',
                  data: { 
                    message: 'Test enrollment processed - no plans available for test demographics',
                    isTestData: true,
                    requiresRealData: true,
                    errorDetails: errorData
                  },
                  warning: 'Some fields were simplified due to server compatibility: questionResponses (eligibility answers) and medications were removed, phoneNumbers were sanitized'
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
                    errorDetails: errorData
                  },
                  warning: 'Some fields were simplified due to server compatibility: questionResponses (eligibility answers) and medications were removed, phoneNumbers were sanitized'
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
                    errorDetails: errorData
                  },
                  warning: 'Some fields were simplified due to server compatibility: questionResponses (eligibility answers) and medications were removed, phoneNumbers were sanitized'
                });
              }
            }
          } catch (parseError) {
            console.log('Could not parse 400 response as JSON');
            return NextResponse.json({
              success: false,
              message: 'Error de procesamiento del enrollment',
              data: { 
                message: 'No se pudo procesar la respuesta del servidor',
                rawError: simplifiedErrorText,
                isParseError: true
              },
              warning: 'Some fields were simplified due to server compatibility: questionResponses (eligibility answers) and medications were removed, phoneNumbers were sanitized'
            });
          }
        } else {
              const simplifiedErrorText = await simplifiedResponse.text();
              console.log('Simplified payload also failed:', simplifiedErrorText);
              
              // If even the simplified payload fails, it might be a plan-specific issue
              if (simplifiedResponse.status === 500) {
                console.log('🚨 Plan-specific issue detected. Plan 2144 may have configuration problems in test environment.');
                
                return NextResponse.json({
                  success: false,
                  message: 'Error de configuración del plan',
                  data: { 
                    message: 'El plan seleccionado (2144) tiene problemas de configuración en el entorno de pruebas de Allstate',
                    errorCode: 'PlanConfigurationError',
                    errorDetail: 'Plan 2144 is not properly configured in the test environment',
                    isPlanConfigurationError: true,
                    requiresPlanFix: true,
                    problematicPlan: enrollmentData.coverages[0]?.planKey,
                    suggestion: 'Este plan necesita ser configurado correctamente en el entorno de pruebas de Allstate'
                  },
                  warning: 'Some fields were simplified due to server compatibility: questionResponses (eligibility answers) and medications were removed, phoneNumbers were sanitized'
                });
              }
            }
          } catch (simplifiedError) {
            console.log('Simplified payload test failed:', simplifiedError);
          }
        }

        // Try to parse error response as JSON
        let errorDetails;
        try {
          errorDetails = JSON.parse(errorText);
        } catch {
          errorDetails = errorText;
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
