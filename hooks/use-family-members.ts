import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import {
  getFamilyMembers,
  saveFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  type FamilyMember
} from '@/lib/api/family-members'

/**
 * Hook para manejar family members del usuario
 * Carga desde BD, sincroniza con sessionStorage, y provee funciones CRUD
 */
export function useFamilyMembers() {
  const { user } = useAuth()
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  /**
   * Cargar family members desde la BD
   */
  const loadFamilyMembers = useCallback(async () => {
    if (!user) {
      setFamilyMembers([])
      setIsInitialized(true)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const members = await getFamilyMembers()
      setFamilyMembers(members)
      
      // Guardar en sessionStorage para persistencia temporal
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('familyMembers', JSON.stringify(members))
      }
      
      console.log('✅ Family members loaded:', members.length)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load family members'
      setError(errorMessage)
      console.error('❌ Error loading family members:', err)
      
      // Intentar cargar desde sessionStorage como fallback
      if (typeof window !== 'undefined') {
        const cached = sessionStorage.getItem('familyMembers')
        if (cached) {
          try {
            setFamilyMembers(JSON.parse(cached))
            console.log('📦 Loaded family members from sessionStorage')
          } catch {
            // Ignorar error de parse
          }
        }
      }
    } finally {
      setIsLoading(false)
      setIsInitialized(true)
    }
  }, [user])

  /**
   * Cargar al montar o cuando cambie el usuario
   */
  useEffect(() => {
    loadFamilyMembers()
  }, [loadFamilyMembers])

  /**
   * Agregar un nuevo family member
   */
  const addMember = useCallback(async (memberData: Omit<FamilyMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      throw new Error('User must be authenticated to add family members')
    }

    setIsLoading(true)
    setError(null)

    try {
      const newMember = await saveFamilyMember(memberData)
      setFamilyMembers(prev => [...prev, newMember])
      
      // Actualizar sessionStorage
      if (typeof window !== 'undefined') {
        const updated = [...familyMembers, newMember]
        sessionStorage.setItem('familyMembers', JSON.stringify(updated))
      }
      
      console.log('✅ Family member added:', newMember)
      return newMember
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add family member'
      setError(errorMessage)
      console.error('❌ Error adding family member:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user, familyMembers])

  /**
   * Actualizar un family member existente
   */
  const updateMember = useCallback(async (
    id: string, 
    memberData: Partial<Omit<FamilyMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ) => {
    if (!user) {
      throw new Error('User must be authenticated to update family members')
    }

    setIsLoading(true)
    setError(null)

    try {
      const updatedMember = await updateFamilyMember(id, memberData)
      setFamilyMembers(prev => 
        prev.map(m => m.id === id ? updatedMember : m)
      )
      
      // Actualizar sessionStorage
      if (typeof window !== 'undefined') {
        const updated = familyMembers.map(m => m.id === id ? updatedMember : m)
        sessionStorage.setItem('familyMembers', JSON.stringify(updated))
      }
      
      console.log('✅ Family member updated:', updatedMember)
      return updatedMember
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update family member'
      setError(errorMessage)
      console.error('❌ Error updating family member:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user, familyMembers])

  /**
   * Eliminar un family member
   */
  const removeMember = useCallback(async (id: string) => {
    if (!user) {
      throw new Error('User must be authenticated to remove family members')
    }

    setIsLoading(true)
    setError(null)

    try {
      await deleteFamilyMember(id)
      setFamilyMembers(prev => prev.filter(m => m.id !== id))
      
      // Actualizar sessionStorage
      if (typeof window !== 'undefined') {
        const updated = familyMembers.filter(m => m.id !== id)
        sessionStorage.setItem('familyMembers', JSON.stringify(updated))
      }
      
      console.log('✅ Family member removed:', id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove family member'
      setError(errorMessage)
      console.error('❌ Error removing family member:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user, familyMembers])

  /**
   * Refrescar family members desde la BD
   */
  const refreshMembers = useCallback(async () => {
    await loadFamilyMembers()
  }, [loadFamilyMembers])

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    familyMembers,
    isLoading,
    error,
    isInitialized,
    addMember,
    updateMember,
    removeMember,
    refreshMembers,
    clearError,
    hasMembers: familyMembers.length > 0,
    membersCount: familyMembers.length
  }
}

