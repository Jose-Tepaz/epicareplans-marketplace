// Exportar carriers originales para quotes (desde sus index.ts)
export * as allstate from './allstate'
export * as manhattanLife from './manhattan-life'

// Enrollment functions
import { submitAllstateEnrollment } from './allstate/enrollment'
import { submitManhattanEnrollment } from './manhattan-life/enrollment'
import type { EnrollmentRequest } from '@/lib/types/enrollment'

export const enrollmentCarriers = {
  allstate: {
    submitEnrollment: submitAllstateEnrollment,
  },
  'manhattan-life': {
    submitEnrollment: submitManhattanEnrollment,
  },
  // Futuro:
  // 'triple-s': {
  //   submitEnrollment: submitTripleSEnrollment,
  // },
}

export async function submitEnrollmentToCarrier(
  carrierSlug: string,
  enrollmentData: EnrollmentRequest
) {
  const carrier = enrollmentCarriers[carrierSlug as keyof typeof enrollmentCarriers]
  
  if (!carrier) {
    throw new Error(`Carrier not supported: ${carrierSlug}`)
  }
  
  return await carrier.submitEnrollment(enrollmentData)
}
