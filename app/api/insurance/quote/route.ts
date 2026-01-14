import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { allstate, manhattanLife } from '@/lib/api/carriers';
import { InsuranceFormData } from '@/lib/types/insurance';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const formData: InsuranceFormData = await request.json();

    console.log('📝 Form data received:', formData);

    // --- Lógica de Selección de Agente ---
    const supabase = await createClient();
    const cookieStore = await cookies();
    const agentReferralCode = cookieStore.get('agent_referral_code')?.value;
    
    let agentProfileId: string | null = null;

    // 1. Determinar agent_profile_id
    if (agentReferralCode) {
      console.log('🍪 Cookie de agente detectada:', agentReferralCode);
      const { data: verifyResult, error: verifyError } = await supabase.rpc('verify_agent_code', {
        link_code: agentReferralCode
      });

      if (!verifyError && Array.isArray(verifyResult) && verifyResult.length > 0 && verifyResult[0].is_valid) {
        agentProfileId = verifyResult[0].agent_id;
        console.log('✅ Agente validado desde cookie:', agentProfileId);
      } else {
        console.warn('⚠️ Agente inválido o error en verificación:', verifyError || 'No encontrado');
      }
    }

    // Si no tenemos agente por cookie (o falló), buscar default
    if (!agentProfileId) {
      if (agentReferralCode) {
         console.warn('⚠️ Se intentó usar referral, pero falló la validación. CAYENDO A DEFAULT.');
      }
      console.log('🔍 Buscando agente por defecto...');
      const { data: defaultAgentResult, error: defaultError } = await supabase.rpc('get_default_agent');
      
      if (!defaultError && Array.isArray(defaultAgentResult) && defaultAgentResult.length > 0) {
        agentProfileId = defaultAgentResult[0].agent_id;
        console.log('✅ Agente por defecto encontrado:', agentProfileId);
      } else {
        console.error('❌ Error buscando agente por defecto:', defaultError);
      }
    } else {
        console.log('ℹ️ Usando agente obtenido previamente (Referral validado). NO se busca default.');
    }

    let allstateAgentCode: string | undefined;

    // 2. Si tenemos agent_profile_id, buscar su código específico para Allstate
    if (agentProfileId) {
      // Buscar ID de compañía Allstate
      const { data: allstateCompany } = await supabase
        .from('insurance_companies')
        .select('id')
        .ilike('slug', 'allstate')
        .single();
      
      if (allstateCompany) {
        // Buscar agent_code en agents_with_companies
        console.log(`🔎 Consultando agents_with_companies para Agent Profile: ${agentProfileId}, Company ID: ${allstateCompany.id}`);
        const { data: agentCompanyData, error: agentCompanyError } = await supabase
          .from('agents_with_companies')
          .select('agent_code')
          .eq('agent_profile_id', agentProfileId)
          .eq('company_id', allstateCompany.id)
          .single();
          
        if (agentCompanyData && agentCompanyData.agent_code) {
          allstateAgentCode = agentCompanyData.agent_code;
          console.log('🎯 Código de Agente Allstate encontrado:', allstateAgentCode);
        } else {
          console.warn('⚠️ No se encontró registro en agents_with_companies para este agente y Allstate:', agentCompanyError);
        }
      } else {
        console.error('❌ No se encontró la compañía Allstate en la BD');
      }
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