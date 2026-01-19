import { NextRequest, NextResponse } from 'next/server';
import { allstate, manhattanLife } from '@/lib/api/carriers';
import { InsuranceFormData } from '@/lib/types/insurance';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const formData: InsuranceFormData = await request.json();

    console.log('📝 Form data received:', formData);

    // --- Lógica de Selección de Agente ---
    console.log('🔄 Resolving Allstate Agent ID (Quote)...');
    const { resolveAllstateAgentId } = await import('@/lib/helpers/allstate-agent-resolution');
    const allstateAgentCode = await resolveAllstateAgentId();

    if (allstateAgentCode) {
        console.log('✅ Quote Route: Agent ID resolved successfully:', allstateAgentCode);
    } else {
        console.warn('⚠️ Quote Route: Could not resolve Agent ID from DB (referral or default).');
        // No retornamos error aquí todavía, dejamos que el cliente API lance el error o maneje undefined
        // pero idealmente deberíamos fallar rápido si es crítico.
        // La implementación anterior intentaba seguir adelante y el cliente API lanzaba error.
    }

    // Llamar a ambos carriers en paralelo
    console.log(`🚀 Iniciando cotización con Allstate Agent Code: "${allstateAgentCode}" (undefined = fallo)`);

    const [allstateResult, manhattanLifeResult] = await Promise.allSettled([
      allstate.allstateAPI.getInsuranceQuotes(formData, allstateAgentCode), // Usar el código dinámico
      manhattanLife.manhattanLifeAPI.getInsuranceQuotes(formData)
    ]);

    const allstatePlans = allstateResult.status === 'fulfilled' ? allstateResult.value : [];
    const manhattanLifePlans = manhattanLifeResult.status === 'fulfilled' ? manhattanLifeResult.value.plans : [];
    const manhattanLifeAgentProducts =
      manhattanLifeResult.status === 'fulfilled'
        ? manhattanLifeResult.value.agentProducts.map(product => product.productName).filter(Boolean)
        : [];

    // Log errors if any
    if (allstateResult.status === 'rejected') {
      console.error('❌ Allstate error (Detailed):', JSON.stringify(allstateResult.reason, Object.getOwnPropertyNames(allstateResult.reason)));
    }
    if (manhattanLifeResult.status === 'rejected') {
      console.error('❌ Manhattan Life error:', manhattanLifeResult.reason);
    }

    const allPlans = [...allstatePlans, ...manhattanLifePlans];

    console.log(`✅ Total plans: ${allPlans.length} (Allstate: ${allstatePlans.length}, Manhattan Life: ${manhattanLifePlans.length})`);

    // Return the plans with carrier-specific metadata
    return NextResponse.json({
      success: true,
      plans: allPlans,
      totalPlans: allPlans.length,
      carriers: {
        allstate: {
          success: allstateResult.status === 'fulfilled',
          count: allstatePlans.length,
          error: allstateResult.status === 'rejected' ? allstateResult.reason.message : null
        },
        manhattanLife: {
          success: manhattanLifeResult.status === 'fulfilled',
          count: manhattanLifePlans.length,
          error: manhattanLifeResult.status === 'rejected' ? manhattanLifeResult.reason.message : null,
          products: manhattanLifeAgentProducts
        }
      }
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