import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Endpoint para asignar agente a cliente existente después del login
 * 
 * Este endpoint se ejecuta cuando un cliente existente hace login y tiene
 * una cookie agent_referral_code. Agrega el agente a agent_clients sin
 * cambiar el agent_profile_id principal del cliente.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar que el usuario está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }
    
    // Leer cookie de agente referral
    const cookieStore = await cookies()
    const agentReferralCode = cookieStore.get('agent_referral_code')?.value
    
    if (!agentReferralCode) {
      return NextResponse.json(
        { success: false, message: 'No hay código de agente en la cookie' },
        { status: 200 } // No es un error, simplemente no hay código
      )
    }
    
    // Verificar que el usuario es un cliente
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', user.id)
      .single()
    
    if (userError || !userData) {
      console.error('❌ Error obteniendo datos del usuario:', userError)
      return NextResponse.json(
        { error: 'Error obteniendo datos del usuario' },
        { status: 500 }
      )
    }
    
    if (userData.role !== 'client') {
      // Si no es cliente, limpiar la cookie y retornar
      cookieStore.delete('agent_referral_code')
      return NextResponse.json(
        { success: false, message: 'Usuario no es cliente' },
        { status: 200 }
      )
    }
    
    // Llamar a la función RPC para agregar el agente
    const { data: result, error: rpcError } = await supabase
      .rpc('add_agent_to_existing_client', {
        client_user_id: user.id,
        agent_referral_code: agentReferralCode
      })
    
    if (rpcError) {
      console.error('❌ Error en RPC add_agent_to_existing_client:', rpcError)
      return NextResponse.json(
        { error: 'Error asignando agente', details: rpcError.message },
        { status: 500 }
      )
    }
    
    // Si la operación fue exitosa, limpiar la cookie
    if (result && result.success) {
      cookieStore.delete('agent_referral_code')
      console.log('✅ Agente asignado a cliente existente:', {
        client_id: user.id,
        agent_profile_id: result.agent_profile_id,
        already_exists: result.already_exists
      })
    }
    
    return NextResponse.json(result || { success: false })
    
  } catch (error) {
    console.error('❌ Error en assign-agent-from-cookie:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}


