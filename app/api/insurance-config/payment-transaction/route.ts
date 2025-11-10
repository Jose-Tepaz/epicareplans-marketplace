import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔍 Payment transaction API - Datos recibidos:', body)
    
    const supabase = await createClient()
    
    const insertData = {
      ...body,
      processed_at: new Date().toISOString()
    }
    
    console.log('🔍 Payment transaction API - Datos a insertar:', insertData)
    
    const { data, error } = await supabase
      .from('application_payment_transactions')
      .insert(insertData)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Error saving payment transaction:', error)
      console.error('❌ Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json({ error: 'Failed to save payment transaction', details: error }, { status: 500 })
    }
    
    console.log('✅ Payment transaction saved successfully:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Error in payment-transaction API:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('applicationId')
    
    if (!applicationId) {
      return NextResponse.json({ error: 'applicationId is required' }, { status: 400 })
    }

    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('application_payment_transactions')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching transactions:', error)
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in payment-transaction GET API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

