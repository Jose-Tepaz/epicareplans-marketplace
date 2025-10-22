import { createClient } from '@/lib/supabase/client'
import type { EnrollmentRequest } from '@/lib/types/enrollment'

export async function saveEnrollmentToDatabase(enrollmentData: EnrollmentRequest) {
  const supabase = createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated to save enrollment')
  }

  // Call the API endpoint to save
  const response = await fetch('/api/enrollment/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(enrollmentData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to save enrollment')
  }

  return await response.json()
}

export async function getUserApplications() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      applicants(*),
      coverages(*),
      beneficiaries(*)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getApplicationById(id: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      applicants(*),
      coverages(*),
      beneficiaries(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function updateApplicationStatus(
  applicationId: string,
  newStatus: 'draft' | 'submitted' | 'pending_approval' | 'approved' | 'rejected' | 'active' | 'cancelled',
  notes?: string
) {
  const supabase = createClient()
  
  // Get current application
  const { data: currentApp } = await supabase
    .from('applications')
    .select('status')
    .eq('id', applicationId)
    .single()

  // Update application status
  const { error: updateError } = await supabase
    .from('applications')
    .update({ status: newStatus })
    .eq('id', applicationId)

  if (updateError) throw updateError

  // Create history record
  const { data: { user } } = await supabase.auth.getUser()
  
  const { error: historyError } = await supabase
    .from('application_status_history')
    .insert({
      application_id: applicationId,
      previous_status: currentApp?.status,
      new_status: newStatus,
      changed_by: user?.id,
      notes,
    })

  if (historyError) throw historyError
}

export async function updateUserProfile(profileData: {
  first_name?: string
  last_name?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  date_of_birth?: string
  gender?: string
  is_smoker?: boolean
  last_tobacco_use?: string
  coverage_start_date?: string
  explore_completed?: boolean
  profile_completed?: boolean
}) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated')
  }

  const { error } = await supabase
    .from('users')
    .update(profileData)
    .eq('id', user.id)

  if (error) throw error
}

export async function getUserProfile() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    // If profile doesn't exist, return null (it will be created by trigger)
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data
}

export async function saveExploreDataToProfile(exploreData: {
  zip_code: string
  date_of_birth: string
  gender: string
  is_smoker: boolean
  last_tobacco_use?: string
}) {
  console.log('🔍 saveExploreDataToProfile - Starting with data:', exploreData)
  
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  console.log('🔍 saveExploreDataToProfile - User:', user?.id)
  
  if (!user) {
    throw new Error('User must be authenticated')
  }

  // Primero verificar si el usuario existe en la tabla users
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  console.log('🔍 saveExploreDataToProfile - Existing user:', existingUser)
  console.log('🔍 saveExploreDataToProfile - Fetch error:', fetchError)

  if (fetchError && fetchError.code === 'PGRST116') {
    // Usuario no existe, crear el registro
    console.log('🔍 saveExploreDataToProfile - User not found, creating new record')
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        ...exploreData,
        explore_completed: true,
      })
      .select()
      .single()

    console.log('🔍 saveExploreDataToProfile - Insert result:', { newUser, insertError })
    if (insertError) throw insertError
    return newUser
  } else if (fetchError) {
    console.error('❌ Error fetching user:', fetchError)
    throw fetchError
  } else {
    // Usuario existe, actualizar
    console.log('🔍 saveExploreDataToProfile - User exists, updating record')
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        ...exploreData,
        explore_completed: true,
      })
      .eq('id', user.id)
      .select()
      .single()

    console.log('🔍 saveExploreDataToProfile - Update result:', { updatedUser, updateError })
    if (updateError) throw updateError
    return updatedUser
  }
}

