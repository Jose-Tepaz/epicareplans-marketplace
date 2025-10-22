import { NextRequest, NextResponse } from 'next/server'
import { addressAPI } from '@/lib/api/address'

export async function POST(request: NextRequest) {
  try {
    const addressData = await request.json()

    console.log('🔍 Validating address:', addressData)

    // Validar que todos los campos requeridos estén presentes
    if (!addressData.address1 || !addressData.state || !addressData.city || !addressData.zip) {
      return NextResponse.json(
        { error: 'Missing required fields: address1, state, city, zip' },
        { status: 400 }
      )
    }

    const validationResult = await addressAPI.validateAddress(addressData)
    
    console.log('📊 Address validation result:', validationResult)

    return NextResponse.json(validationResult)

  } catch (error) {
    console.error('Error validating address:', error)
    return NextResponse.json(
      { 
        error: 'Failed to validate address',
        isValid: false,
        errors: ['Failed to validate address. Please try again.']
      },
      { status: 500 }
    )
  }
}
