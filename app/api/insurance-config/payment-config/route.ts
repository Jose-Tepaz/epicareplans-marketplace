import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companySlug = searchParams.get('companySlug')
    
    if (!companySlug) {
      return NextResponse.json({ error: 'companySlug is required' }, { status: 400 })
    }

    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('insurance_company_payment_configs')
      .select(`
        *,
        insurance_companies!inner(slug)
      `)
      .eq('insurance_companies.slug', companySlug)
      .eq('is_active', true)
      .single()
    
    if (error) {
      console.error('Error fetching payment config:', error)
      return NextResponse.json({ error: 'Failed to fetch payment config' }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in payment-config API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

