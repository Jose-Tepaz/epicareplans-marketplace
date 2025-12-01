import type { FamilyMember } from "@/lib/types/enrollment"
import type { InsurancePlan, InsuranceFormData } from "@/lib/types/insurance"

/**
 * Normaliza los productos de agente desde la respuesta de la API
 */
const normalizeAgentProducts = (products: any[]): string[] => {
  return Array.from(
    new Set(
      products
        .filter((name): name is string => typeof name === "string")
        .map((name) => name.trim())
        .filter((name) => name.length > 0)
    )
  )
}

/**
 * Normaliza un plan de seguro desde la respuesta de la API
 */
const normalizeInsurancePlan = (plan: any): InsurancePlan => {
  return {
    id: String(plan?.id ?? ""),
    name: plan?.name ?? "Unknown Plan",
    price:
      typeof plan?.price === "number" ? plan.price : Number(plan?.price ?? 0),
    coverage: plan?.coverage ?? "",
    productType: plan?.productType ?? "",
    benefits: Array.isArray(plan?.benefits) ? plan.benefits : [],
    allState: Boolean(plan?.allState),
    manhattanLife: Boolean(plan?.manhattanLife),
    planType: plan?.planType ?? "",
    benefitDescription: plan?.benefitDescription ?? "",
    brochureUrl: plan?.brochureUrl ?? plan?.pathToBrochure ?? undefined,
    carrierName: plan?.carrierName ?? undefined,
    carrierSlug:
      plan?.carrierSlug ?? (plan?.allState ? "allstate" : undefined),
    productCode: plan?.productCode ?? undefined,
    planKey: plan?.planKey ?? undefined,
    metadata: plan?.metadata ?? undefined,
  }
}

/**
 * Calcula nuevas cotizaciones basadas en la composición familiar actualizada
 */
export async function recalculateQuotes(
  baseFormData: Partial<InsuranceFormData>,
  familyMembers: FamilyMember[],
  currentPlans: InsurancePlan[]
): Promise<{ updatedPlans: InsurancePlan[]; error?: string }> {
  try {
    // 1. Preparar payload base
    // Asegurar que tenemos los campos mínimos necesarios
    // Normalizar fecha de nacimiento a formato YYYY-MM-DD si viene en ISO
    const normalizeDate = (dateStr: string): string => {
      if (!dateStr) return ""
      // Si ya está en formato YYYY-MM-DD, retornarlo
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
      // Si está en formato ISO, extraer solo la fecha
      if (dateStr.includes('T')) return dateStr.split('T')[0]
      return dateStr
    }

    // Normalizar gender a formato esperado (male/female)
    const normalizeGender = (gender: string): string => {
      if (!gender) return ""
      const g = gender.toLowerCase()
      if (g === 'male' || g === 'm') return 'male'
      if (g === 'female' || g === 'f') return 'female'
      return gender // Mantener original si no coincide
    }

    // Mapear dependents con formato correcto
    const dependents = familyMembers.map(member => {
      const dob = normalizeDate(member.date_of_birth || member.dob || "")
      return {
        firstName: member.first_name || member.firstName || "",
        lastName: member.last_name || member.lastName || "",
        dateOfBirth: dob,
        gender: normalizeGender(member.gender || ""),
        relationship: member.relationship || "Dependent",
        smoker: member.smoker || false
      }
    })

    const payload = {
      zipCode: baseFormData.zipCode || "",
      dateOfBirth: normalizeDate(baseFormData.dateOfBirth || ""),
      gender: normalizeGender(baseFormData.gender || ""),
      smokes: baseFormData.smokes || false,
      lastTobaccoUse: baseFormData.lastTobaccoUse || "",
      coverageStartDate: baseFormData.coverageStartDate || new Date(Date.now() + 86400000).toISOString().split("T")[0],
      paymentFrequency: baseFormData.paymentFrequency || "monthly",
      dependents: dependents
    }

    // Verificar campos requeridos mínimos
    if (!payload.zipCode || !payload.dateOfBirth || !payload.gender) {
      console.warn("⚠️ recalculateQuotes: Falta información básica (zip, dob, gender)")
      return { updatedPlans: currentPlans, error: "Missing basic information" }
    }

    console.log("🔄 Recalculando cotizaciones con payload:", {
      zipCode: payload.zipCode,
      dateOfBirth: payload.dateOfBirth,
      gender: payload.gender,
      dependentsCount: payload.dependents.length,
      dependents: payload.dependents.map(d => ({
        name: `${d.firstName} ${d.lastName}`,
        dateOfBirth: d.dateOfBirth,
        gender: d.gender,
        relationship: d.relationship,
        smoker: d.smoker
      }))
    })

    // 2. Llamar a la API de cotización
    const response = await fetch("/api/insurance/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API Error (${response.status}): ${errorText}`)
    }

    const result = await response.json()
    const newPlansRaw = Array.isArray(result?.plans) ? result.plans : []
    const normalizedNewPlans = newPlansRaw.map(normalizeInsurancePlan)
    
    console.log(`✅ Recibidos ${normalizedNewPlans.length} planes nuevos`)

    // 3. Mapear precios actualizados a los planes actuales
    // Intentamos encontrar el plan equivalente en los nuevos resultados
    const updatedPlans = currentPlans.map(currentPlan => {
      // Buscar coincidencia por ID o planKey/productCode
      const matchingNewPlan = normalizedNewPlans.find(newPlan => {
        // Coincidencia exacta de ID
        if (newPlan.id === currentPlan.id) return true
        
        // Coincidencia por planKey (Allstate) o productCode
        if (currentPlan.planKey && newPlan.planKey && currentPlan.planKey === newPlan.planKey) return true
        if (currentPlan.productCode && newPlan.productCode && currentPlan.productCode === newPlan.productCode) return true
        
        // Coincidencia por nombre y carrier (fallback)
        if (currentPlan.name === newPlan.name && 
            currentPlan.carrierName === newPlan.carrierName &&
            currentPlan.productType === newPlan.productType) return true
            
        return false
      })

      if (matchingNewPlan) {
        console.log(`✅ Plan actualizado: ${currentPlan.name} (${currentPlan.price} -> ${matchingNewPlan.price})`)
        return {
          ...currentPlan,
          price: matchingNewPlan.price,
          // Actualizar metadata relevante
          metadata: {
            ...currentPlan.metadata,
            ...matchingNewPlan.metadata,
            priceUpdatedWithRateCart: true,
            applicantsIncluded: 1 + familyMembers.length, // Primary + members
            originalPrice: currentPlan.metadata?.originalPrice || currentPlan.price // Guardar precio original si no existe
          }
        }
      } else {
        console.warn(`⚠️ No se encontró actualización para plan: ${currentPlan.name}`)
        return currentPlan
      }
    })

    return { updatedPlans }

  } catch (error) {
    console.error("❌ Error recalculating quotes:", error)
    return { 
      updatedPlans: currentPlans, 
      error: error instanceof Error ? error.message : "Failed to recalculate quotes" 
    }
  }
}

