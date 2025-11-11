import { NextRequest, NextResponse } from 'next/server'
import { addressAPI } from '@/lib/api/address'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const zipCode = searchParams.get('zipCode')

    if (!zipCode) {
      return NextResponse.json(
        { error: 'ZIP code is required' },
        { status: 400 }
      )
    }

    if (!/^\d{5}$/.test(zipCode)) {
      return NextResponse.json(
        { error: 'ZIP code must be 5 digits' },
        { status: 400 }
      )
    }

    console.log('🔍 Getting ZIP code info for:', zipCode)

    const zipCodeInfo = await addressAPI.getZipCodeInfo(zipCode)
    
    if (!zipCodeInfo) {
      return NextResponse.json(
        { error: 'ZIP code not found or invalid' },
        { status: 404 }
      )
    }

    console.log('📊 ZIP code info result:', zipCodeInfo)

    return NextResponse.json(zipCodeInfo)

  } catch (error) {
    console.error('Error getting ZIP code info:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get ZIP code information',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
