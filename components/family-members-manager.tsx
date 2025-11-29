"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AddFamilyMemberModal } from '@/components/add-family-member-modal'
import { useFamilyMembers } from '@/hooks/use-family-members'
import { Users, UserPlus, Edit2, Trash2, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { FamilyMember } from '@/lib/types/enrollment'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface FamilyMembersManagerProps {
  showTitle?: boolean
  compact?: boolean
  onMemberChange?: (activeMembers: FamilyMember[]) => void
}

export function FamilyMembersManager({ showTitle = true, compact = false, onMemberChange }: FamilyMembersManagerProps) {
  const {
    familyMembers,
    isLoading,
    error,
    isInitialized,
    addMember,
    updateMember,
    removeMember,
    hasMembers,
    membersCount,
    clearError
  } = useFamilyMembers()

  const [isListModalOpen, setIsListModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set())
  const [hasInitialSelection, setHasInitialSelection] = useState(false)

  // Initialize selected members when familyMembers change
  useEffect(() => {
    if (isInitialized && familyMembers.length > 0 && !hasInitialSelection) {
      // Initial load: Select based on included_in_quote (default true)
      const selectedIds = new Set(
        familyMembers
          .filter(m => m.id && (m.included_in_quote !== false))
          .map(m => m.id as string)
      )
      
      setSelectedMemberIds(selectedIds)
      setHasInitialSelection(true)
      
      // Removed automatic call to onMemberChange on initialization to prevent double fetch
      // Parent component should handle initial fetch based on persistent state (DB)
    }
  }, [isInitialized, familyMembers, hasInitialSelection, onMemberChange])

  const getActiveMembers = (selectedIds: Set<string>) => {
    return familyMembers.filter(m => m.id && selectedIds.has(m.id))
  }

  const notifyChange = (ids: Set<string>) => {
    if (onMemberChange) {
      const active = familyMembers.filter(m => m.id && ids.has(m.id))
      onMemberChange(active)
    }
  }

  const handleAddMember = async (memberData: Omit<FamilyMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    let newMember: FamilyMember | null = null
    if (editingMember && editingMember.id) {
      // Update existing member
      newMember = await updateMember(editingMember.id, memberData)
    } else {
      // Add new member
      newMember = await addMember(memberData)
      
      // Auto-select new member
      if (newMember && newMember.id) {
        setSelectedMemberIds(prev => {
          const next = new Set(prev)
          if (newMember?.id) next.add(newMember.id)
          return next
        })
      }
    }
    setEditingMember(null)
    setIsAddModalOpen(false)
  }
  
  const pendingUpdate = useRef(false)
  
  useEffect(() => {
    if (pendingUpdate.current && isInitialized) {
       notifyChange(selectedMemberIds)
       pendingUpdate.current = false
    }
  }, [familyMembers, isInitialized]) 

  const handleAddMemberWrapper = async (data: any) => {
     pendingUpdate.current = true
     await handleAddMember(data)
  }
  
  const handleDeleteWrapper = async (id: string) => {
     pendingUpdate.current = true
     await handleDeleteClick(id)
  }

  const toggleSelection = async (memberId: string) => {
    const next = new Set(selectedMemberIds)
    const isSelected = !next.has(memberId)
    
    if (!isSelected) {
      next.delete(memberId)
    } else {
      next.add(memberId)
    }
    setSelectedMemberIds(next)
    
    // Update DB
    try {
      console.log('🔄 Updating member quote status in DB:', memberId, isSelected)
      await updateMember(memberId, { included_in_quote: isSelected })
      console.log('✅ Member quote status updated in DB')
    } catch (err) {
      console.error('Failed to persist selection state', err)
      // Optional: revert UI state or show error
    }
    
    // We notify change immediately here
    if (onMemberChange) {
       // active uses 'familyMembers' from hook
       // IMPORTANT: The member being toggled might still have old status in 'familyMembers'
       // We must explicitly ensure it's treated as selected/deselected based on 'next'
       const active = familyMembers.filter(m => m.id && next.has(m.id))
       
       // Update the local member object for correct passing
       const activeWithUpdate = active.map(m => 
         m.id === memberId ? { ...m, included_in_quote: isSelected } : m
       )
       
       console.log('📣 Notifying member change. Active count:', activeWithUpdate.length, 'IDs:', activeWithUpdate.map(m => m.id))
       onMemberChange(activeWithUpdate)
    }
  }

  const handleEditClick = (member: FamilyMember) => {
    setEditingMember(member)
    setIsAddModalOpen(true)
  }

  const handleDeleteClick = async (id: string) => {
    if (!id) return
    
    if (!confirm('Are you sure you want to remove this family member? They will no longer be included in pricing calculations.')) {
      return
    }

    setDeletingId(id)
    try {
      await removeMember(id)
      const next = new Set(selectedMemberIds)
      next.delete(id)
      setSelectedMemberIds(next)
      toast.success('Family member removed')
    } catch (error) {
      toast.error('Failed to remove family member')
    } finally {
      setDeletingId(null)
    }
  }

  const handleAddNewClick = () => {
    setEditingMember(null)
    setIsAddModalOpen(true)
  }

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false)
    setEditingMember(null)
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  if (!isInitialized && isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading...</span>
      </div>
    )
  }

  return (
    <>
      {/* Main Button to open list modal */}
      <div className="flex items-center gap-4">
        <Button 
          onClick={() => setIsListModalOpen(true)} 
          variant="outline"
          className="w-full sm:w-auto gap-2 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white"
        >
          <Users className="h-4 w-4" />
          {hasMembers 
            ? `View Family Members (${membersCount})` 
            : 'Add Family Member'
          }
        </Button>
      </div>

      {/* List Modal */}
      <Dialog open={isListModalOpen} onOpenChange={setIsListModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Family Members</span>
              {hasMembers && (
                <Badge variant="secondary" className="mr-8">
                  {membersCount} {membersCount === 1 ? 'member' : 'members'}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearError}
                    className="ml-2"
                  >
                    Dismiss
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {!hasMembers ? (
              <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border-2 border-dashed">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">No family members added</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add family members to get accurate pricing for multi-person coverage
                </p>
                <Button onClick={handleAddNewClick} variant="outline" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add Your First Family Member
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddNewClick}
                    size="sm"
                    className="gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Add Member
                  </Button>
                </div>
                <div className="space-y-3">
                  {familyMembers.map((member) => (
                    <Card key={member.id} className={`border-l-4 ${member.id && selectedMemberIds.has(member.id) ? 'border-l-primary' : 'border-l-gray-300'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center mr-4 pt-1">
                             <Checkbox 
                               checked={member.id ? selectedMemberIds.has(member.id) : false}
                               onCheckedChange={() => member.id && toggleSelection(member.id)}
                               id={`select-${member.id}`}
                             />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-lg">
                                {member.first_name} {member.middle_initial && `${member.middle_initial}.`} {member.last_name}
                              </h4>
                              <Badge variant="outline">{member.relationship}</Badge>
                              {member.smoker && (
                                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                  Smoker
                                </Badge>
                              )}
                              {member.id && selectedMemberIds.has(member.id) && (
                                <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                  Included in Quote
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Age:</span> {calculateAge(member.date_of_birth)} years
                              </div>
                              <div>
                                <span className="font-medium">Gender:</span> {member.gender}
                              </div>
                              {member.weight && (
                                <div>
                                  <span className="font-medium">Weight:</span> {member.weight} lbs
                                </div>
                              )}
                              {member.height_feet && (
                                <div>
                                  <span className="font-medium">Height:</span> {member.height_feet}'{member.height_inches || 0}"
                                </div>
                              )}
                            </div>
                            {member.has_prior_coverage && (
                              <div className="mt-2">
                                <Badge variant="outline" className="text-xs">
                                  Has Prior Coverage
                                </Badge>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(member)}
                              disabled={isLoading}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => member.id && handleDeleteWrapper(member.id)}
                              disabled={isLoading || deletingId === member.id}
                            >
                              {deletingId === member.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-red-500" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Form Modal */}
      <AddFamilyMemberModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSave={handleAddMemberWrapper}
        editMember={editingMember}
      />
    </>
  )
}
