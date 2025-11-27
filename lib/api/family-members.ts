import { createClient } from '@/lib/supabase/client'

export interface FamilyMember {
  id?: string
  user_id?: string
  first_name: string
  middle_initial?: string
  last_name: string
  gender: string
  date_of_birth: string
  ssn?: string
  relationship: string
  smoker: boolean
  date_last_smoked?: string
  weight?: number
  height_feet?: number
  height_inches?: number
  has_prior_coverage: boolean
  included_in_quote?: boolean
  created_at?: string
  updated_at?: string
}

/**
 * Obtener todos los family members del usuario autenticado
 */
export async function getFamilyMembers(): Promise<FamilyMember[]> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching family members:', error)
    throw error
  }

  return data || []
}

/**
 * Guardar un nuevo family member
 */
export async function saveFamilyMember(memberData: Omit<FamilyMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<FamilyMember> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('family_members')
    .insert({
      ...memberData,
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving family member:', error)
    throw error
  }

  return data
}

/**
 * Actualizar un family member existente
 */
export async function updateFamilyMember(
  id: string, 
  memberData: Partial<Omit<FamilyMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<FamilyMember> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('family_members')
    .update(memberData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating family member:', error)
    throw error
  }

  return data
}

/**
 * Eliminar un family member
 */
export async function deleteFamilyMember(id: string): Promise<void> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('family_members')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting family member:', error)
    throw error
  }
}

/**
 * Convertir un FamilyMember a la estructura requerida por el formulario de enrollment
 */
export function familyMemberToApplicant(member: FamilyMember, index: number) {
  return {
    firstName: member.first_name,
    lastName: member.last_name,
    middleInitial: member.middle_initial || '',
    gender: member.gender,
    dob: member.date_of_birth,
    ssn: member.ssn || '',
    relationship: member.relationship,
    smoker: member.smoker,
    dateLastSmoked: member.date_last_smoked || '',
    weight: member.weight?.toString() || '',
    heightFeet: member.height_feet?.toString() || '',
    heightInches: member.height_inches?.toString() || '',
    hasPriorCoverage: member.has_prior_coverage,
    phone: '', // Family members usually don't have separate phones stored in this table
    email: '',
    questionResponses: [],
    medications: []
  }
}
