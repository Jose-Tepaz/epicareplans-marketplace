import type { EnrollmentByCompany, MultiCarrierResult } from '@/lib/types/insurance-config'

/**
 * Dividir planes por aseguradora
 * Agrupa los planes del carrito por company_id/company_slug
 */
export function splitPlansByCompany(plans: any[]): EnrollmentByCompany[] {
  const byCompany = new Map<string, EnrollmentByCompany>()
  
  plans.forEach(plan => {
    // Priorizar carrierSlug sobre company_slug y company_id
    // Esto asegura que Triple S se agrupe correctamente con 'triple-s'
    const companySlug = plan.carrierSlug || plan.company_slug || 'allstate'
    const companyId = plan.company_id || companySlug
    
    // Usar companySlug como key para agrupar
    if (!byCompany.has(companySlug)) {
      byCompany.set(companySlug, {
        company_id: companyId,
        company_slug: companySlug,
        plans: [],
        amount: 0
      })
    }
    
    const entry = byCompany.get(companySlug)!
    entry.plans.push(plan)
    entry.amount += plan.price || 0
  })
  
  return Array.from(byCompany.values())
}

/**
 * Construir enrollments separados por aseguradora
 * Cada aseguradora recibe solo sus planes
 */
export function buildEnrollmentsByCompany(
  formData: any,
  companySplit: EnrollmentByCompany[]
): Array<{ company_slug: string; enrollment: any; amount: number }> {
  
  return companySplit.map(companyData => {
    // Construir enrollment específico para esta aseguradora
    const enrollment = {
      demographics: {
        zipCode: formData.zipCode,
        email: formData.email,
        // ... resto de demographics
        applicants: [
          {
            firstName: formData.firstName,
            lastName: formData.lastName,
            // ... resto de applicant data
          }
        ]
      },
      // SOLO los planes de esta aseguradora
      coverages: companyData.plans.map(plan => ({
        planKey: plan.planKey,
        monthlyPremium: plan.price,
        // ... resto de coverage
      })),
      // Payment se manejará por separado
      paymentInformation: {
        // Se llenará con datos específicos de la aseguradora
      }
    }
    
    return {
      company_slug: companyData.company_slug,
      enrollment,
      amount: companyData.amount
    }
  })
}

/**
 * Evaluar resultados de multi-carrier
 * Determina si el enrollment fue exitoso, parcial o falló
 */
export function evaluateMultiCarrierResults(results: MultiCarrierResult[]) {
  const total = results.length
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  
  return {
    total,
    successful,
    failed,
    allSuccess: successful === total,
    someSuccess: successful > 0,
    allFailed: successful === 0,
    successRate: total > 0 ? (successful / total) * 100 : 0
  }
}

/**
 * Obtener mensaje de resultado para el usuario
 */
export function getMultiCarrierMessage(results: MultiCarrierResult[]) {
  const evaluation = evaluateMultiCarrierResults(results)
  
  if (evaluation.allSuccess) {
    return {
      type: 'success',
      title: 'Enrollment Completado',
      message: `Todos los planes se procesaron exitosamente (${evaluation.successful}/${evaluation.total})`
    }
  } else if (evaluation.someSuccess) {
    return {
      type: 'warning',
      title: 'Enrollment Parcialmente Completado',
      message: `${evaluation.successful} de ${evaluation.total} planes se procesaron exitosamente. Algunos requieren atención.`
    }
  } else {
    return {
      type: 'error',
      title: 'Enrollment Falló',
      message: 'No se pudo procesar ningún plan. Por favor, intenta nuevamente.'
    }
  }
}

/**
 * Filtrar planes por aseguradora
 * Útil para mostrar solo los planes de una aseguradora específica
 */
export function filterPlansByCompany(plans: any[], companySlug: string) {
  return plans.filter(plan => 
    (plan.carrierSlug || plan.company_slug || 'allstate') === companySlug
  )
}

/**
 * Calcular total por aseguradora
 * Suma los precios de todos los planes de una aseguradora
 */
export function calculateTotalByCompany(plans: any[], companySlug: string): number {
  return plans
    .filter(plan => (plan.carrierSlug || plan.company_slug || 'allstate') === companySlug)
    .reduce((total, plan) => total + (plan.price || 0), 0)
}

/**
 * Verificar si un enrollment es multi-carrier
 * True si hay planes de múltiples aseguradoras
 */
export function isMultiCarrierEnrollment(plans: any[]): boolean {
  const companies = new Set(plans.map(plan => plan.company_slug || 'allstate'))
  return companies.size > 1
}

/**
 * Obtener lista de aseguradoras en el enrollment
 */
export function getCompaniesInEnrollment(plans: any[]): string[] {
  const companies = new Set(plans.map(plan => plan.carrierSlug || plan.company_slug || 'allstate'))
  return Array.from(companies)
}
