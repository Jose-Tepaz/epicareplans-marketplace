import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { applicationId, apiResponse } = body
    
    if (!applicationId || !apiResponse) {
      return NextResponse.json({ error: 'applicationId and apiResponse are required' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // 1. Actualizar application con datos principales
    const { error: appError } = await supabase
      .from('applications')
      .update({
        member_id: apiResponse.memberId,
        member_portal_url: apiResponse.memberPortalUrl,
        attestation_status: apiResponse.attestationStatus,
        allstate_links: apiResponse.links
      })
      .eq('id', applicationId)
    
    if (appError) {
      console.error('Error updating application:', appError)
      return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
    }
    
    // 2. Guardar submission results
    if (apiResponse.submissionResults && apiResponse.submissionResults.length > 0) {
      const submissionData = apiResponse.submissionResults.map((result: any) => ({
        application_id: applicationId,
        plan_type: result.planType,
        submission_received: result.submissionReceived,
        policy_no: result.policyNo,
        total_rate: result.totalRate,
        effective_date: result.effectiveDate,
        application_id_external: result.applicationID,
        partner_application_id: result.partnerApplicationId,
        submission_errors: result.submissionErrors
      }))
      
      const { error: submissionError } = await supabase
        .from('application_submission_results')
        .insert(submissionData)
      
      if (submissionError) {
        console.error('Error saving submission results:', submissionError)
        return NextResponse.json({ error: 'Failed to save submission results' }, { status: 500 })
      }
    }
    
    // 3. Guardar validation errors
    if (apiResponse.validationErrors && apiResponse.validationErrors.length > 0) {
      const validationData = apiResponse.validationErrors.map((error: any) => ({
        application_id: applicationId,
        error_code: error.errorCode,
        error_detail: error.errorDetail
      }))
      
      const { error: validationError } = await supabase
        .from('application_validation_errors')
        .insert(validationData)
      
      if (validationError) {
        console.error('Error saving validation errors:', validationError)
        return NextResponse.json({ error: 'Failed to save validation errors' }, { status: 500 })
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in allstate-response API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

