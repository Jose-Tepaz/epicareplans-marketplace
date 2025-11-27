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
    const payload = {
      zipCode: baseFormData.zipCode || "",
      dateOfBirth: baseFormData.dateOfBirth || "",
      gender: baseFormData.gender || "",
      smokes: baseFormData.smokes || false,
      lastTobaccoUse: baseFormData.lastTobaccoUse || "",
      coverageStartDate: baseFormData.coverageStartDate || new Date(Date.now() + 86400000).toISOString().split("T")[0],
      paymentFrequency: baseFormData.paymentFrequency || "monthly",
      // Agregar información de dependientes
      dependents: familyMembers.map(member => ({
        firstName: member.first_name,
        lastName: member.last_name,
        dateOfBirth: member.date_of_birth, // YYYY-MM-DD
        gender: member.gender,
        relationship: member.relationship,
        smoker: member.smoker
      }))
    }

    // Verificar campos requeridos mínimos
    if (!payload.zipCode || !payload.dateOfBirth || !payload.gender) {
      console.warn("⚠️ recalculateQuotes: Falta información básica (zip, dob, gender)")
      return { updatedPlans: currentPlans, error: "Missing basic information" }
    }

    console.log("🔄 Recalculando cotizaciones con payload:", payload)

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

