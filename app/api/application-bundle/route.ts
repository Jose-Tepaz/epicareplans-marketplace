import { NextRequest, NextResponse } from 'next/server';
import { applicationBundleAPI } from '@/lib/api/application-bundle';
import type { ApplicationBundleRequest } from '@/lib/types/application-bundle';

/**
 * POST /api/application-bundle
 * 
 * Endpoint para obtener las preguntas dinámicas del ApplicationBundle API
 * antes de proceder con el enrollment.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const requestData: {
      selectedPlans: any[];
      state: string;
      effectiveDate: string;
      dateOfBirth?: string;
      isSmoker?: boolean;
      hasHealthConditions?: boolean;
      weight?: number;
      heightFeet?: number;
      heightInches?: number;
      hasPriorCoverage?: boolean;
      hasMedicare?: boolean;
    } = await request.json();

    console.log('ApplicationBundle request received:', JSON.stringify(requestData, null, 2));
    
    // Log detallado de los datos recibidos
    console.log('ApplicationBundle Request Analysis:', {
      hasSelectedPlans: !!requestData.selectedPlans,
      plansCount: requestData.selectedPlans?.length || 0,
      state: requestData.state,
      effectiveDate: requestData.effectiveDate,
      dateOfBirth: requestData.dateOfBirth,
      allPlans: requestData.selectedPlans?.map(plan => ({
        id: plan.id,
        name: plan.name,
        productCode: plan.productCode,
        planKey: plan.planKey,
        hasProductCode: !!plan.productCode,
        hasPlanKey: !!plan.planKey
      })) || []
    });

    // Validar datos requeridos
    if (!requestData.selectedPlans || !Array.isArray(requestData.selectedPlans) || requestData.selectedPlans.length === 0) {
      return NextResponse.json(
        { error: 'selectedPlans is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    if (!requestData.state || requestData.state.length !== 2) {
      return NextResponse.json(
        { error: 'state is required and must be a 2-letter code' },
        { status: 400 }
      );
    }

    if (!requestData.effectiveDate) {
      return NextResponse.json(
        { error: 'effectiveDate is required' },
        { status: 400 }
      );
    }

    // Validar datos con el cliente API
    const validation = applicationBundleAPI.validateApplicationBundleRequest(
      requestData.selectedPlans,
      requestData.state,
      requestData.effectiveDate
    );

    console.log('ApplicationBundle Validation Result:', {
      isValid: validation.isValid,
      errors: validation.errors,
      selectedPlans: requestData.selectedPlans.map(plan => ({
        id: plan.id,
        name: plan.name,
        productCode: plan.productCode,
        planKey: plan.planKey,
        hasProductCode: !!plan.productCode,
        hasPlanKey: !!plan.planKey
      }))
    });

    if (!validation.isValid) {
      console.log('ApplicationBundle validation failed:', validation.errors);
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.errors
        },
        { status: 400 }
      );
    }

    // Log antes de llamar al API
    console.log('About to call ApplicationBundle API with:', {
      selectedPlans: requestData.selectedPlans,
      state: requestData.state,
      effectiveDate: requestData.effectiveDate,
      dateOfBirth: requestData.dateOfBirth,
      isSmoker: requestData.isSmoker,
      hasHealthConditions: requestData.hasHealthConditions,
      weight: requestData.weight,
      heightFeet: requestData.heightFeet,
      heightInches: requestData.heightInches,
      hasPriorCoverage: requestData.hasPriorCoverage,
      hasMedicare: requestData.hasMedicare
    });

    // Llamar al ApplicationBundle API
    console.log('Calling applicationBundleAPI.getApplicationBundle...');
    const applicationBundle = await applicationBundleAPI.getApplicationBundle(
      requestData.selectedPlans,
      requestData.state,
      requestData.effectiveDate,
      requestData.dateOfBirth,
      requestData.isSmoker,
      requestData.hasHealthConditions,
      requestData.weight,
      requestData.heightFeet,
      requestData.heightInches,
      requestData.hasPriorCoverage,
      requestData.hasMedicare
    );
    console.log('ApplicationBundle API call successful');

    console.log('ApplicationBundle API successful:', applicationBundle);

    // Crear estado inicial del formulario dinámico
    const dynamicFormState = applicationBundleAPI.createDynamicFormState(applicationBundle.applications);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'ApplicationBundle retrieved successfully',
      data: {
        applicationBundle,
        dynamicFormState
      }
    });

  } catch (error) {
    console.error('Error in /api/application-bundle:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      cause: error instanceof Error ? error.cause : undefined
    });

    // Manejar errores específicos de la API
    if (error instanceof Error) {
      // Verificar si es un error 404 (plan no encontrado)
      if (error.message.includes('404')) {
        return NextResponse.json(
          {
            error: 'Plan not found',
            message: 'The selected plan(s) are not available for enrollment in the specified state. Please select different plans.',
            details: error.message
          },
          { status: 404 }
        );
      }

      // Verificar si es un error 401 (autenticación)
      if (error.message.includes('401')) {
        return NextResponse.json(
          {
            error: 'Authentication failed',
            message: 'Invalid API credentials. Please contact support.',
            details: error.message
          },
          { status: 401 }
        );
      }

      // Verificar si es un error 400 (datos inválidos)
      if (error.message.includes('400')) {
        return NextResponse.json(
          {
            error: 'Invalid request data',
            message: 'The request data is invalid. Please check your plan selection and try again.',
            details: error.message
          },
          { status: 400 }
        );
      }

      // Verificar si es un error 500 (servidor)
      if (error.message.includes('500')) {
        return NextResponse.json(
          {
            error: 'Server error',
            message: 'The ApplicationBundle API returned a server error. This may be due to invalid plan combinations or server issues.',
            details: error.message,
            suggestion: 'Try selecting different plans or contact support if the issue persists.'
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to retrieve ApplicationBundle',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to retrieve ApplicationBundle.' },
    { status: 405 }
  );
}
