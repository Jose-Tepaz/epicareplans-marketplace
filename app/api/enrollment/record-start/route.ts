import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { applicationId, userId } = await request.json()
    
    if (!applicationId || !userId) {
      return NextResponse.json({ error: 'applicationId and userId are required' }, { status: 400 })
    }

    console.log('🔍 API recordEnrollmentStart - Iniciando con applicationId:', applicationId, 'userId:', userId)
    
    const supabase = await createClient()
    
    console.log('🔍 API recordEnrollmentStart - Insertando en application_status_history...')
    
    const { error } = await supabase
      .from('application_status_history')
      .insert({
        application_id: applicationId,
        previous_status: null, // No hay estado previo para el primer registro
        new_status: 'draft',
        changed_by: userId,
        notes: 'Enrollment iniciado - datos del formulario completados',
      })

    if (error) {
      console.error('❌ API recordEnrollmentStart - Error:', error)
      return NextResponse.json({ error: 'Failed to record enrollment start', details: error }, { status: 500 })
    }
    
    console.log('✅ API recordEnrollmentStart - Historial registrado exitosamente')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error in recordEnrollmentStart API:', error)
    return NextResponse.json({ error: 'Internal server error', details: (error as Error).message || 'Unknown error' }, { status: 500 })
  }
}
