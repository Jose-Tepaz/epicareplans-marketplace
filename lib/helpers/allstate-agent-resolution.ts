import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

/**
 * Resuelve el Allstate Agent Code usando la lógica de negocio estricta:
 * 1. Verifica cookie 'agent_referral_code'.
 * 2. Si no es válido o no existe, usa agente por defecto.
 * 3. Consulta la tabla `agents_with_companies` para obtener el código específico de Allstate.
 * 
 * @returns {Promise<string | undefined>} El código de agente de Allstate (ej. "PGRST205") o undefined si falla.
 */
export async function resolveAllstateAgentId(): Promise<string | undefined> {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const agentReferralCode = cookieStore.get('agent_referral_code')?.value;

  let agentProfileId: string | null = null;
  let debugLog: any[] = []; // Para acumular logs si es necesario debuggear externamente

  const log = (msg: string, data?: any) => {
    console.log(`[AgentResolution] ${msg}`, data || '');
  };
  const warn = (msg: string, data?: any) => {
    console.warn(`[AgentResolution] ⚠️ ${msg}`, data || '');
  };

  // 1. Determinar agent_profile_id
  if (agentReferralCode) {
    log('Cookie detectada:', agentReferralCode);
    const { data: verifyResult, error: verifyError } = await supabase.rpc('verify_agent_code', {
      link_code: agentReferralCode
    });

    if (!verifyError && Array.isArray(verifyResult) && verifyResult.length > 0 && verifyResult[0].is_valid) {
      agentProfileId = verifyResult[0].agent_id;
      log('Agente validado desde cookie:', agentProfileId);
    } else {
      warn('Referral inválido o error RPC:', verifyError);
    }
  }

  // 2. Fallback a Default
  if (!agentProfileId) {
    if (agentReferralCode) warn('Falló referral, buscando default...');
    
    // IMPORTANTE: Aseguramos que la función RPC se llama correctamente
    const { data: defaultAgentResult, error: defaultError } = await supabase.rpc('get_default_agent');
    
    if (!defaultError && Array.isArray(defaultAgentResult) && defaultAgentResult.length > 0) {
      agentProfileId = defaultAgentResult[0].agent_id;
      log('Agente por defecto encontrado:', agentProfileId);
    } else {
      console.error('[AgentResolution] ❌ Error buscando agente por defecto:', defaultError);
      return undefined; // Fallo crítico si no hay default
    }
  }

  // 3. Obtener Código Allstate desde agents_with_companies
  if (agentProfileId) {
    const { data: allstateCompany } = await supabase
      .from('insurance_companies')
      .select('id')
      .ilike('slug', 'allstate')
      .single();
    
    if (allstateCompany) {
        log(`Buscando código Allstate para Agente: ${agentProfileId}, CompanyId: ${allstateCompany.id}`);
        
        const { data: agentCompanyData, error: agentCompanyError } = await supabase
          .from('agents_with_companies')
          .select('agent_code')
          .eq('agent_profile_id', agentProfileId)
          .eq('company_id', allstateCompany.id)
          .single();

        if (agentCompanyData && agentCompanyData.agent_code) {
           log('🎯 Código Allstate resuelto:', agentCompanyData.agent_code);
           return agentCompanyData.agent_code;
        } else {
           warn('No se encontró registro en agents_with_companies (Allstate)', agentCompanyError);
           return undefined;
        }
    } else {
        console.error('[AgentResolution] ❌ Compañía Allstate no encontrada en DB');
        return undefined;
    }
  }

  return undefined;
}
