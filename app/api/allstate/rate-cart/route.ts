import { NextRequest, NextResponse } from 'next/server'

/**
 * Rate/Cart API Endpoint
 * 
 * Proxy para el endpoint de Allstate que calcula precios finales
 * basados en los aplicantes y planes seleccionados.
 * 
 * POST https://ngahservices.ngic.com/QuotingAPI/api/v1/Rate/Cart
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('📊 Rate/Cart Request:', JSON.stringify(body, null, 2))
    
    // Validar campos requeridos
    if (!body.agentId || !body.effectiveDate || !body.zipCode || !body.state) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: agentId, effectiveDate, zipCode, state' 
        },
        { status: 400 }
      )
    }

    if (!body.applicants || !Array.isArray(body.applicants) || body.applicants.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'At least one applicant is required' 
        },
        { status: 400 }
      )
    }

    if (!body.plansToRate || !Array.isArray(body.plansToRate) || body.plansToRate.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'At least one plan to rate is required' 
        },
        { status: 400 }
      )
    }

    // --- SECURE AGENT ID RESOLUTION ---
    // Sobrescribir cualquier agentId que venga del cliente con el valor validado en servidor
    const { resolveAllstateAgentId } = await import('@/lib/helpers/allstate-agent-resolution');
    const secureAgentId = await resolveAllstateAgentId();

    if (!secureAgentId) {
      console.error('❌ Failed to resolve Allstate Agent ID (Rate/Cart)');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Agent ID Resolution Failed',
          message: 'Could not determine a valid Allstate Agent ID from database.'
        },
        { status: 400 }
      );
    }
    
    console.log(`🔒 Overwriting request agentId (${body.agentId}) with secure ID: ${secureAgentId}`);
    body.agentId = secureAgentId;
    // -----------------------------------

    // Llamar a la API de Allstate
    // Usar QA environment si no hay token de producción
    const allstateUrl = process.env.ALLSTATE_API_URL_RATE_CART || 
                        'https://qa1-ngahservices.ngic.com/QuotingAPI/api/v1/Rate/Cart'
    
    // Token de autenticación (Basic Auth)
    const authToken = process.env.ALLSTATE_AUTH_TOKEN || 'VGVzdFVzZXI6VGVzdDEyMzQ='
    
    const response = await fetch(allstateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authToken}`,
      },
      body: JSON.stringify(body)
    })

    const responseText = await response.text()
    console.log('📡 Allstate Response Status:', response.status)
    console.log('📡 Allstate Response:', responseText)

    if (!response.ok) {
      console.error('❌ Allstate Rate/Cart error:', responseText)
      
      // Intentar parsear el error
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { message: responseText }
      }

      return NextResponse.json(
        {
          success: false,
          error: `Allstate API error: ${response.status}`,
          details: errorData,
          message: errorData.message || 'Failed to get pricing from Allstate'
        },
        { status: response.status }
      )
    }

    // Parsear respuesta exitosa
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('❌ Error parsing Allstate response:', parseError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to parse Allstate response',
          details: responseText
        },
        { status: 500 }
      )
    }

    console.log('✅ Rate/Cart successful:', data)

    // Allstate devuelve ratedPlans, no plans
    const plans = data.ratedPlans || data.plans || data

    return NextResponse.json({
      success: true,
      plans: plans,
      rawResponse: data
    })
    
  } catch (error) {
    console.error('❌ Error calling Allstate Rate/Cart:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
      },
      { status: 500 }
    )
  }
}

