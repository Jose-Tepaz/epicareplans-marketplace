/**
 * User Information Summary Component
 * 
 * Muestra un resumen de la información del usuario:
 * - ZIP Code
 * - Edad (calculada desde fecha de nacimiento)
 * - Género
 * - Estado de fumador
 * 
 * @module UserInfoSummary
 */

interface FormData {
  zipCode: string
  dateOfBirth: string
  gender: string
  smokes: boolean
}

interface UserInfoSummaryProps {
  formData: FormData
}

export function UserInfoSummary({ formData }: UserInfoSummaryProps) {
  if (!formData.zipCode) return null

  const calculateAge = () => {
    if (!formData.dateOfBirth) return 'N/A'
    return new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear()
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="font-semibold text-gray-900">ZIP Code:</span>
          <span className="ml-2 text-gray-700">{formData.zipCode}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-900">Age:</span>
          <span className="ml-2 text-gray-700">{calculateAge()}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-900">Gender:</span>
          <span className="ml-2 text-gray-700 capitalize">{formData.gender || 'N/A'}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-900">Smoker:</span>
          <span className="ml-2 text-gray-700">{formData.smokes ? 'Yes' : 'No'}</span>
        </div>
      </div>
    </div>
  )
}

