"use client"

import { useEffect, useState } from "react"
import type { EnrollmentFormState } from "@/lib/types/enrollment"
import { FamilyMembersManager } from "@/components/family-members-manager"
import { familyMemberToApplicant, FamilyMember } from "@/lib/api/family-members"

interface Step5AdditionalApplicantsProps {
  formData: EnrollmentFormState
  updateFormData: (field: keyof EnrollmentFormState, value: any) => void
}

export function Step5AdditionalApplicants({ formData, updateFormData }: Step5AdditionalApplicantsProps) {
  
  const handleMemberChange = (activeMembers: FamilyMember[]) => {
    // Map selected family members to applicants
    const applicants = activeMembers.map((member, index) => 
      familyMemberToApplicant(member, index)
    )
    updateFormData('additionalApplicants', applicants)
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">Family Members</h3>
        <p className="text-sm text-gray-600">
          Add spouse, children, or other dependents to this policy. 
          Use the manager below to add or select family members.
        </p>
      </div>

      <FamilyMembersManager 
        showTitle={false}
        compact={false}
        onMemberChange={handleMemberChange}
      />

      <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Selected family members will be included in your application. 
          Make sure to check the "Included in Quote" status for each member you want to cover.
        </p>
      </div>
    </div>
  )
}
