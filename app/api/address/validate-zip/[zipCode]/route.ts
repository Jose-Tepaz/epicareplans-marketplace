import { NextRequest, NextResponse } from 'next/server'
import { addressAPI } from '@/lib/api/address'

export async function GET(
  request: NextRequest,
  { params }: { params: { zipCode: string } }
) {
  try {
    const { zipCode } = params

    if (!zipCode || zipCode.length !== 5) {
      return NextResponse.json(
        { error: 'ZIP code must be 5 digits' },
        { status: 400 }
      )
    }

    console.log('🔍 Validating ZIP code with real API:', zipCode)

    // Usar el nuevo endpoint de StateAbbreviation
    const stateAbbreviation = await addressAPI.getStateAbbreviationByZipCode(zipCode)
    
    console.log('📊 State abbreviation result:', stateAbbreviation)
    
    if (!stateAbbreviation) {
      console.log('❌ ZIP code not found or invalid:', zipCode)
      return NextResponse.json({
        success: false,
        error: 'ZIP code not found',
        message: 'The ZIP code you entered is not valid. Please enter a valid 5-digit ZIP code.'
      })
    }

    console.log('✅ ZIP code validation successful:', {
      zipCode,
      state: stateAbbreviation
    })

    return NextResponse.json({
      success: true,
      data: {
        state: stateAbbreviation,
        stateAbbreviation: stateAbbreviation,
        deliverable: true,
        preferred: true
      }
    })

  } catch (error) {
    console.error('Error validating ZIP code:', error)
    return NextResponse.json(
      { error: 'Failed to validate ZIP code' },
      { status: 500 }
    )
  }
}