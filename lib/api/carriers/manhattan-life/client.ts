import type { InsuranceFormData, InsurancePlan } from '@/lib/types/insurance'
import type {
  ManhattanLifeProduct,
  ManhattanLifePlanHierarchy,
  ManhattanLifeProductWithId,
  ManhattanLifeMappedPlan,
  ManhattanLifeQuoteResult
} from './types'
import { manhattanLifeAuth } from './auth'

class ManhattanLifeAPI {
  private readonly baseURL: string
  private readonly agentNumber: string

  constructor() {
    this.baseURL = process.env.MANHATTAN_LIFE_API_URL || ''
    this.agentNumber = process.env.MANHATTAN_LIFE_AGENT_NUMBER || ''
  }

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

  async getProductHierarchy(productNames: string[], stateCode: string): Promise<ManhattanLifePlanHierarchy[]> {
    const url = `${this.baseURL}/api/v2/product/producthierarchy`
    return manhattanLifeAuth.makeAuthenticatedRequest<ManhattanLifePlanHierarchy[]>(url, {
      method: 'POST',
      body: JSON.stringify({ stateCode, productNames })
    })
  }

  async getProductIds(): Promise<ManhattanLifeProductWithId[]> {
    const url = `${this.baseURL}/api/Enrollment/GetActiveProductPlanRiderHierarchy`
    return manhattanLifeAuth.makeAuthenticatedRequest<ManhattanLifeProductWithId[]>(url)
  }

  async getBrochureLinks(productId: number, stateCode: string): Promise<string[]> {
    const url = `${this.baseURL}/api/Enrollment/BrochureLink?productId=${productId}&stateCode=${stateCode}`
    try {
      return await manhattanLifeAuth.makeAuthenticatedRequest<string[]>(url)
    } catch (error) {
      console.warn(`No brochures for product ${productId}:`, error)
      return []
    }
  }

  async getInsuranceQuotes(formData: InsuranceFormData): Promise<ManhattanLifeQuoteResult> {
    console.log('🏢 Manhattan Life: Starting quote process')

    try {
      // 1. Obtener estado desde ZIP
      const stateCode = await this.getStateFromZip(formData.zipCode)
      console.log(`📍 State: ${stateCode}`)

      // 2. Obtener productos del agente
      console.log('🔄 Fetching agent products...')
      const products = await this.getAgentProducts()
      console.log(`📦 Products available: ${products.length}`)

      // 3. Obtener jerarquía de todos los productos
      console.log('🔄 Fetching product hierarchy...')
      const productNames = products.map(p => p.productName)
      const hierarchies = await this.getProductHierarchy(productNames, stateCode)
      console.log(`🏗️  Hierarchies loaded: ${hierarchies.length}`)

      // 4. Obtener productIds para brochures
      console.log('🔄 Fetching product IDs...')
      const productIds = await this.getProductIds()
      console.log(`🔗 ProductIds loaded: ${productIds.length}`)
      const productIdMap = new Map(productIds.map(p => [p.productName, p.productId]))

      // 5. Obtener brochures en paralelo
      console.log('🔄 Fetching brochures...')
      const brochurePromises = hierarchies.map(async (hierarchy) => {
        const productId = productIdMap.get(hierarchy.productName)
        if (!productId) return { productName: hierarchy.productName, brochures: [] }
        const brochures = await this.getBrochureLinks(productId, stateCode)
        return { productName: hierarchy.productName, brochures }
      })
      const brochureResults = await Promise.all(brochurePromises)
      const brochureMap = new Map(brochureResults.map(r => [r.productName, r.brochures]))
      console.log(`📄 Brochures loaded for ${brochureResults.length} products`)

      // 6. Mapear a InsurancePlan[]
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

  private async getStateFromZip(zipCode: string): Promise<string> {
    // Mapeo simple de ZIP codes a estados (primeros 3 dígitos)
    // Para una solución más robusta, se puede usar una librería o API externa
    const zipToStateMap: Record<string, string> = {
      // Northeast
      '010': 'MA', '011': 'MA', '012': 'MA', '013': 'MA', '014': 'MA', '015': 'MA', '016': 'MA', '017': 'MA', '018': 'MA', '019': 'MA',
      '020': 'MA', '021': 'MA', '022': 'MA', '023': 'MA', '024': 'MA', '025': 'MA', '026': 'MA', '027': 'MA',
      '028': 'RI', '029': 'RI',
      '030': 'NH', '031': 'NH', '032': 'NH', '033': 'NH', '034': 'NH', '035': 'NH', '036': 'NH', '037': 'NH', '038': 'NH',
      '039': 'ME', '040': 'ME', '041': 'ME', '042': 'ME', '043': 'ME', '044': 'ME', '045': 'ME', '046': 'ME', '047': 'ME', '048': 'ME', '049': 'ME',
      '050': 'VT', '051': 'VT', '052': 'VT', '053': 'VT', '054': 'VT', '055': 'VT', '056': 'VT', '057': 'VT', '058': 'VT', '059': 'VT',
      '060': 'CT', '061': 'CT', '062': 'CT', '063': 'CT', '064': 'CT', '065': 'CT', '066': 'CT', '067': 'CT', '068': 'CT', '069': 'CT',
      '070': 'NJ', '071': 'NJ', '072': 'NJ', '073': 'NJ', '074': 'NJ', '075': 'NJ', '076': 'NJ', '077': 'NJ', '078': 'NJ', '079': 'NJ', '080': 'NJ', '081': 'NJ', '082': 'NJ', '083': 'NJ', '084': 'NJ', '085': 'NJ', '086': 'NJ', '087': 'NJ', '088': 'NJ', '089': 'NJ',
      '100': 'NY', '101': 'NY', '102': 'NY', '103': 'NY', '104': 'NY', '105': 'NY', '106': 'NY', '107': 'NY', '108': 'NY', '109': 'NY',
      '110': 'NY', '111': 'NY', '112': 'NY', '113': 'NY', '114': 'NY', '115': 'NY', '116': 'NY', '117': 'NY', '118': 'NY', '119': 'NY',
      '120': 'NY', '121': 'NY', '122': 'NY', '123': 'NY', '124': 'NY', '125': 'NY', '126': 'NY', '127': 'NY', '128': 'NY', '129': 'NY',
      '130': 'NY', '131': 'NY', '132': 'NY', '133': 'NY', '134': 'NY', '135': 'NY', '136': 'NY', '137': 'NY', '138': 'NY', '139': 'NY',
      '140': 'NY', '141': 'NY', '142': 'NY', '143': 'NY', '144': 'NY', '145': 'NY', '146': 'NY', '147': 'NY', '148': 'NY', '149': 'NY',
      '150': 'PA', '151': 'PA', '152': 'PA', '153': 'PA', '154': 'PA', '155': 'PA', '156': 'PA', '157': 'PA', '158': 'PA', '159': 'PA',
      '160': 'PA', '161': 'PA', '162': 'PA', '163': 'PA', '164': 'PA', '165': 'PA', '166': 'PA', '167': 'PA', '168': 'PA', '169': 'PA',
      '170': 'PA', '171': 'PA', '172': 'PA', '173': 'PA', '174': 'PA', '175': 'PA', '176': 'PA', '177': 'PA', '178': 'PA', '179': 'PA',
      '180': 'PA', '181': 'PA', '182': 'PA', '183': 'PA', '184': 'PA', '185': 'PA', '186': 'PA', '187': 'PA', '188': 'PA', '189': 'PA', '190': 'PA', '191': 'PA', '192': 'PA', '193': 'PA', '194': 'PA', '195': 'PA', '196': 'PA',
      // Texas
      '750': 'TX', '751': 'TX', '752': 'TX', '753': 'TX', '754': 'TX', '755': 'TX', '756': 'TX', '757': 'TX', '758': 'TX', '759': 'TX',
      '760': 'TX', '761': 'TX', '762': 'TX', '763': 'TX', '764': 'TX', '765': 'TX', '766': 'TX', '767': 'TX', '768': 'TX', '769': 'TX',
      '770': 'TX', '771': 'TX', '772': 'TX', '773': 'TX', '774': 'TX', '775': 'TX', '776': 'TX', '777': 'TX', '778': 'TX', '779': 'TX',
      '780': 'TX', '781': 'TX', '782': 'TX', '783': 'TX', '784': 'TX', '785': 'TX', '786': 'TX', '787': 'TX', '788': 'TX', '789': 'TX',
      '790': 'TX', '791': 'TX', '792': 'TX', '793': 'TX', '794': 'TX', '795': 'TX', '796': 'TX', '797': 'TX', '798': 'TX', '799': 'TX',
      '885': 'TX',
    }
    
    try {
      const prefix = zipCode.substring(0, 3)
      const state = zipToStateMap[prefix]
      
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

  private mapResponseToPlans(
    hierarchies: ManhattanLifePlanHierarchy[],
    brochureMap: Map<string, string[]>
  ): ManhattanLifeMappedPlan[] {
    const plans: ManhattanLifeMappedPlan[] = []

    for (const hierarchy of hierarchies) {
      const brochures = brochureMap.get(hierarchy.productName) || []
      const brochureUrl = brochures[0] // Primera URL

      for (const plan of hierarchy.plans) {
        plans.push({
          id: `ml-${plan.planUnitStateCodeId}`,
          name: `${hierarchy.productName} - ${plan.planName}`,
          price: plan.coverageAmount || 0,
          coverage: plan.unitName, // "$5,000" o "PLAN A"
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



