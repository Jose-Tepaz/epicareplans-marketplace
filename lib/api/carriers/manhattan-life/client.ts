import type { InsuranceFormData, InsurancePlan } from '@/lib/types/insurance'
import type {
  ManhattanLifeProduct,
  ManhattanLifePlanHierarchy,
  ManhattanLifeProductWithId,
  ManhattanLifeMappedPlan,
  ManhattanLifeQuoteResult
} from './types'
import { manhattanLifeAuth } from './auth'
import { ZIP_TO_STATE_MAP } from './zip-codes'

/**
 * Cliente para interactuar con la API de Manhattan Life.
 * Maneja la obtención de productos, mapeo de jerarquías y generación de cotizaciones.
 */
class ManhattanLifeAPI {
  private readonly baseURL: string
  private readonly agentNumber: string

  constructor() {
    this.baseURL = process.env.MANHATTAN_LIFE_API_URL || ''
    this.agentNumber = process.env.MANHATTAN_LIFE_AGENT_NUMBER || ''
  }

  /**
   * Obtiene la lista de productos disponibles para el agente configurado.
   * @throws {Error} Si MANHATTAN_LIFE_AGENT_NUMBER no está configurado.
   */
  async getAgentProducts(): Promise<ManhattanLifeProduct[]> {
    if (!this.agentNumber) {
      throw new Error('Manhattan Life agent number not configured. Please set MANHATTAN_LIFE_AGENT_NUMBER in .env.local')
    }
    
    const url = `${this.baseURL}/api/v2/product/agentProducts?agentNumber=${this.agentNumber}`
    console.log(`🔗 Calling: ${url} (POST)`)
    
    // La API parece requerir POST con query string (y opcionalmente body)
    return manhattanLifeAuth.makeAuthenticatedRequest<ManhattanLifeProduct[]>(url, {
      method: 'POST',
      body: JSON.stringify({ agentNumber: this.agentNumber })
    })
  }

  /**
   * Obtiene la jerarquía de productos para los nombres de productos y estado dados.
   * @param productNames Lista de nombres de productos para obtener la jerarquía
   * @param stateCode Código de estado (ej. 'TX')
   */
  async getProductHierarchy(productNames: string[], stateCode: string): Promise<ManhattanLifePlanHierarchy[]> {
    const url = `${this.baseURL}/api/v2/product/producthierarchy`
    return manhattanLifeAuth.makeAuthenticatedRequest<ManhattanLifePlanHierarchy[]>(url, {
      method: 'POST',
      body: JSON.stringify({ stateCode, productNames })
    })
  }

  /**
   * Obtiene todas las jerarquías de planes activos (usado para obtener IDs de productos).
   */
  async getProductIds(): Promise<ManhattanLifeProductWithId[]> {
    const url = `${this.baseURL}/api/Enrollment/GetActiveProductPlanRiderHierarchy`
    return manhattanLifeAuth.makeAuthenticatedRequest<ManhattanLifeProductWithId[]>(url)
  }

  /**
   * Obtiene enlaces a folletos para un producto y estado específicos.
   * @param productId El ID del producto
   * @param stateCode El código del estado
   */
  async getBrochureLinks(productId: number, stateCode: string): Promise<string[]> {
    const url = `${this.baseURL}/api/Enrollment/BrochureLink?productId=${productId}&stateCode=${stateCode}`
    try {
      return await manhattanLifeAuth.makeAuthenticatedRequest<string[]>(url)
    } catch (error) {
      console.warn(`No brochures for product ${productId}:`, error)
      return []
    }
  }

  /**
   * Método auxiliar para obtener folletos para una lista de productos.
   * Mapea nombres de productos a sus URLs de folletos.
   */
  private async fetchBrochuresForProducts(
    hierarchies: ManhattanLifePlanHierarchy[],
    stateCode: string
  ): Promise<Map<string, string[]>> {
    console.log('🔄 Fetching product IDs for brochures...')
    const productIds = await this.getProductIds()
    const productIdMap = new Map(productIds.map(p => [p.productName, p.productId]))

    console.log('🔄 Fetching individual brochures...')
    const brochurePromises = hierarchies.map(async (hierarchy) => {
      const productId = productIdMap.get(hierarchy.productName)
      if (!productId) return { productName: hierarchy.productName, brochures: [] }
      const brochures = await this.getBrochureLinks(productId, stateCode)
      return { productName: hierarchy.productName, brochures }
    })

    const brochureResults = await Promise.all(brochurePromises)
    return new Map(brochureResults.map(r => [r.productName, r.brochures]))
  }

  /**
   * Método principal para obtener cotizaciones de seguros basadas en los datos del formulario.
   * Orquesta la obtención de productos del agente, jerarquías y folletos.
   * @param formData Los datos enviados por el usuario
   */
  async getInsuranceQuotes(formData: InsuranceFormData): Promise<ManhattanLifeQuoteResult> {
    console.log('🏢 Manhattan Life: Starting quote process')

    try {
      // 1. Obtener estado desde ZIP
      const stateCode = this.getStateFromZip(formData.zipCode)
      console.log(`📍 State: ${stateCode}`)

      // 2. Obtener productos del agente
      console.log('🔄 Fetching agent products...')
      const products = await this.getAgentProducts()
      console.log(`📦 Products available: ${products.length}`)

      // 3. Obtener jerarquía de productos
      console.log('🔄 Fetching product hierarchy...')
      const productNames = products.map(p => p.productName)
      const hierarchies = await this.getProductHierarchy(productNames, stateCode)
      console.log(`🏗️  Hierarchies loaded: ${hierarchies.length}`)

      // 4. Obtener folletos (lógica extraída)
      const brochureMap = await this.fetchBrochuresForProducts(hierarchies, stateCode)
      console.log(`📄 Brochures loaded for ${brochureMap.size} products`)

      // 5. Mapear a InsurancePlan[]
      const plans = this.mapResponseToPlans(hierarchies, brochureMap)
      console.log(`✅ Manhattan Life: ${plans.length} plans mapped`)

      return {
        plans,
        agentProducts: products
      }
    } catch (error) {
      console.error('❌ Manhattan Life error in getInsuranceQuotes:', error)
      throw error
    }
  }

  /**
   * Determina el código de estado a partir del código postal (ZIP).
   * Utiliza un mapa estático para la resolución, por defecto 'TX' si no se encuentra.
   */
  private getStateFromZip(zipCode: string): string {
    try {
      const prefix = zipCode.substring(0, 3)
      const state = ZIP_TO_STATE_MAP[prefix]
      
      if (state) {
        console.log(`📍 Manhattan Life: ZIP ${zipCode} → State ${state}`)
        return state
      }
      
      console.warn(`⚠️  Manhattan Life: ZIP ${zipCode} not found in map, defaulting to TX`)
      return 'TX'
    } catch (error) {
      console.warn('❌ Manhattan Life: Error getting state from ZIP, defaulting to TX:', error)
      return 'TX'
    }
  }

  /**
   * Mapea las jerarquías de respuesta de la API y los folletos al formato interno InsurancePlan.
   */
  private mapResponseToPlans(
    hierarchies: ManhattanLifePlanHierarchy[],
    brochureMap: Map<string, string[]>
  ): ManhattanLifeMappedPlan[] {
    const plans: ManhattanLifeMappedPlan[] = []

    for (const hierarchy of hierarchies) {
      const brochures = brochureMap.get(hierarchy.productName) || []
      const brochureUrl = brochures[0] // Usar primer folleto disponible

      for (const plan of hierarchy.plans) {
        plans.push({
          id: `ml-${plan.planUnitStateCodeId}`,
          name: `${hierarchy.productName} - ${plan.planName}`,
          price: plan.coverageAmount || 0,
          coverage: plan.unitName, // ej. "$5,000" o "PLAN A"
          productType: hierarchy.productName,
          benefits: [], // TODO: Extraer de brochure en fase 2
          manhattanLife: true,
          allState: false,
          planType: plan.planName,
          benefitDescription: `Coverage: ${plan.unitName}`,
          brochureUrl,
          carrierName: 'Manhattan Life',
          carrierSlug: 'manhattan-life',
          productCode: plan.planCode,
          planKey: plan.planCode,
          metadata: {
            planUnitStateCodeId: plan.planUnitStateCodeId,
            riders: plan.riders,
            ridersCount: plan.riders.length,
            productName: hierarchy.productName
          }
        })
      }
    }

    return plans
  }
}

export const manhattanLifeAPI = new ManhattanLifeAPI()



