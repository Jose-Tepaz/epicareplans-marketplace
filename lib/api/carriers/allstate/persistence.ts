import type { AllstateApiResponse } from './types'

export async function saveAllstateApiResponse(
  applicationId: string,
  apiResponse: AllstateApiResponse
) {
  try {
    const response = await fetch('/api/insurance-config/allstate-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        applicationId,
        apiResponse,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to save Allstate API response')
    }

    return response.json()
  } catch (error) {
    console.error('Error saving Allstate API response:', error)
    throw error
  }
}

