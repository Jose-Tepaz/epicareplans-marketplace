import type { InsuranceFormData, InsurancePlan } from '@/lib/types/insurance'
import type {
  TripleSProfile,
  TripleSSeries,
  TripleSProduct,
  TripleSQuoteRequest,
  TripleSQuoteResponse,
  TripleSMappedPlan
} from './types'
import { tripleSAuth } from './auth'
import { secureFetch } from './utils'

/**
 * Cliente principal para interactuar con la API de Triple S
 * Maneja catálogo de productos y cotizaciones
 */
class TripleSAPI {
  private readonly baseURL: string
  private readonly username: string
  private readonly password: string
  private productsCatalog: TripleSProfile[] | null = null
  private catalogLoadPromise: Promise<void> | null = null

  constructor() {
    this.baseURL = process.env.TRIPLE_S_BASE_URL || ''
    this.username = process.env.TRIPLE_S_USERNAME || ''
    this.password = process.env.TRIPLE_S_PASSWORD || ''

    if (!this.baseURL || !this.username || !this.password) {
      console.warn('⚠️ Triple S API credentials not configured')
    }
  }

  /**
   * Carga el catálogo de productos desde la API
   * Se ejecuta en background al inicializar
   */
  async loadProductsCatalog(): Promise<void> {
    // Si ya hay una carga en progreso, esperar a que termine
    if (this.catalogLoadPromise) {
      return this.catalogLoadPromise
    }

    // Si el catálogo ya está cargado, no hacer nada
    if (this.productsCatalog && this.productsCatalog.length > 0) {
      console.log('✅ Triple S: Using cached product catalog')
      return
    }

    this.catalogLoadPromise = this.performCatalogLoad()
    
    try {
      await this.catalogLoadPromise
    } finally {
      this.catalogLoadPromise = null
    }
  }

  /**
   * Ejecuta la carga del catálogo
   */
  private async performCatalogLoad(): Promise<void> {
    console.log('🔄 Triple S: Loading product catalog')

    try {
      const url = `${this.baseURL}/quote/API/QuoteUserSeriesProducts`
      const requestBody = {
        Username: this.username,
        Password: this.password
      }

      console.log('📡 Triple S: Fetching catalog from:', url)

      // El endpoint requiere Bearer token en el header
      const data = await tripleSAuth.makeAuthenticatedRequest<{ profiles: TripleSProfile[] }>(
        url,
        {
          method: 'POST',
          body: JSON.stringify(requestBody)
        }
      )

      // Procesar respuesta
      if (data && Array.isArray(data.profiles)) {
        this.productsCatalog = data.profiles
        console.log(`✅ Triple S: Catalog loaded - ${this.productsCatalog.length} profiles`)
        
        // Log summary de productos
        const totalProducts = data.profiles.reduce((sum, profile) => {
          return sum + profile.series.reduce((seriesSum, series) => {
            return seriesSum + series.products.length
          }, 0)
        }, 0)
        console.log(`📊 Triple S: Total products available: ${totalProducts}`)
      } else {
        console.warn('⚠️ Triple S: Invalid catalog response structure', data)
        this.productsCatalog = []
      }
    } catch (error) {
      console.error('❌ Triple S: Error loading product catalog:', error)
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          cause: (error as any).cause
        })
      }
      this.productsCatalog = []
      // No throw - permitir que la app continúe sin Triple S
      // throw error
    }
  }

  /**
   * Obtiene todos los productos disponibles (flat list)
   */
  getAvailableProducts(): TripleSProduct[] {
    if (!this.productsCatalog || this.productsCatalog.length === 0) {
      return []
    }

    const products: TripleSProduct[] = []

    for (const profile of this.productsCatalog) {
      for (const series of profile.series) {
        products.push(...series.products)
      }
    }

    return products
  }

  /**
   * Obtiene cotizaciones de seguros basadas en los datos del usuario
   */
  async getInsuranceQuotes(
    formData: InsuranceFormData & { dependents?: any[] },
    faceAmount: number = 10000
  ): Promise<InsurancePlan[]> {
    console.log(`🏢 Triple S: Starting quote process with face amount: $${faceAmount.toLocaleString()}`)

    try {
      // 1. Asegurar que el catálogo esté cargado
      await this.loadProductsCatalog()

      if (!this.productsCatalog || this.productsCatalog.length === 0) {
        console.warn('⚠️ Triple S: No products available in catalog')
        return []
      }

      const allPlans: TripleSMappedPlan[] = []

      // 2. Iterar por todos los productos y obtener cotizaciones
      for (const profile of this.productsCatalog) {
        for (const series of profile.series) {
          for (const product of series.products) {
            try {
              const quotes = await this.getQuoteForProduct(formData, product, series, faceAmount)
              allPlans.push(...quotes)
            } catch (error) {
              console.error(`❌ Triple S: Error quoting ${product.name}:`, error)
              // Continuar con el siguiente producto
            }
          }
        }
      }

      console.log(`✅ Triple S: ${allPlans.length} plans quoted`)
      return allPlans
    } catch (error) {
      console.error('❌ Triple S: Error in getInsuranceQuotes:', error)
      throw error
    }
  }

  /**
   * Obtiene cotización para un producto específico
   */
  private async getQuoteForProduct(
    formData: InsuranceFormData & { dependents?: any[] },
    product: TripleSProduct,
    series: TripleSSeries,
    faceAmount: number = 10000
  ): Promise<TripleSMappedPlan[]> {
    // Construir request con el face amount especificado
    const quoteRequest = this.buildQuoteRequest(formData, product, series, faceAmount)

    // Llamar a la API
    const url = `${this.baseURL}/quote/API/QuoteUserRates`
    
    console.log(`📊 Triple S: Quoting ${product.name} (${series.name})`)
    console.log('📄 Request:', JSON.stringify(quoteRequest, null, 2))
    
    const response = await tripleSAuth.makeAuthenticatedRequest<TripleSQuoteResponse>(
      url,
      {
        method: 'POST',
        body: JSON.stringify(quoteRequest)
      }
    )
    
    console.log(`✅ Triple S: Quote successful for ${product.name}`)

    // Mapear respuesta a planes
    return this.mapResponseToPlans(response, product, series)
  }

  /**
   * Construye el request de cotización desde los datos del formulario
   */
  private buildQuoteRequest(
    formData: InsuranceFormData & { dependents?: any[] },
    product: TripleSProduct,
    series: TripleSSeries,
    faceAmount: number = 10000
  ): any {
    // Mapear payment frequency (como número)
    const paymentModePayments = parseInt(this.mapPaymentFrequency(formData.paymentFrequency))

    return {
      Username: this.username,
      Password: this.password,
      ProductInfo: {
        ProductKey: product.key,
        PaymentMethodKey: 'E', // E = EFT/ACH según ejemplo
        PaymentModePayments: paymentModePayments, // Número, no string
        FetchDetails: true,
        RiderCategories: [
          {
            CategoryName: 'Plan Básico',
            IsActive: true,
            FaceAmountText: faceAmount.toString() // Usar el face amount del filtro
            // SelectedSpecDescription se agregará si es necesario
          }
        ]
      },
      FamilyInfo: {
        SeriesAccessCode: series.code,
        EffectiveDateOverride: null, // null por defecto, usa fecha del sistema
        Primary: {
          IsEnabled: true,
          IsSelected: true,
          GenderShortForm: formData.gender === 'male' ? 'M' : 'F',
          RiskKey: formData.smokes ? 'S' : 'N',
          DateOfBirth: formData.dateOfBirth
          // NO incluir Rating object si no es necesario
        },
        ClientReEntry: false
        // NO incluir Spouse, Child, AdditionalInsured si son null
      }
    }
  }

  /**
   * Mapea payment frequency de nuestro formato al de Triple S
   */
  private mapPaymentFrequency(frequency: string): string {
    switch (frequency) {
      case 'monthly':
        return '12'
      case 'quarterly':
        return '4'
      case 'semi-annually':
        return '2'
      case 'annually':
        return '1'
      default:
        return '12' // Default mensual
    }
  }

  /**
   * Extrae el tipo de cobertura del product key
   * Ejemplos: "Cáncer - Individual - Ind" -> "Ind"
   */
  private extractCoverageType(productKey: string): string {
    const parts = productKey.split(' - ')
    if (parts.length >= 3) {
      return parts[2].trim()
    }
    return 'Ind' // Default
  }

  /**
   * Categoriza el producto según su serie y nombre
   */
  private categorizeProduct(product: TripleSProduct, series: TripleSSeries): {
    insuranceType: 'Vida' | 'Salud' | 'Retiro'
    seriesCategory: string
  } {
    const seriesCode = series.code
    const productName = product.name.toLowerCase()

    // Categorizar por tipo de seguro
    let insuranceType: 'Vida' | 'Salud' | 'Retiro' = 'Vida'
    
    if (productName.includes('cáncer') || productName.includes('cancer') || 
        productName.includes('accidente') || productName.includes('hospital')) {
      insuranceType = 'Salud'
    } else if (productName.includes('anualidad') || productName.includes('ira') || 
               productName.includes('retiro')) {
      insuranceType = 'Retiro'
    } else {
      insuranceType = 'Vida'
    }

    // Categorizar por serie
    let seriesCategory = series.name
    switch (seriesCode) {
      case 'S1':
        seriesCategory = 'Tradicionales'
        break
      case 'S2':
        seriesCategory = 'Freedom'
        break
      case 'S4':
        seriesCategory = 'Freedom UL'
        break
      case 'S9':
        seriesCategory = 'IRAs y Anualidades'
        break
      default:
        seriesCategory = series.name
    }

    return { insuranceType, seriesCategory }
  }

  /**
   * Mapea la respuesta de la API a InsurancePlan[]
   */
  private mapResponseToPlans(
    response: TripleSQuoteResponse,
    product: TripleSProduct,
    series: TripleSSeries
  ): TripleSMappedPlan[] {
    // Validar que se pueda crear aplicación
    if (!response.canCreateApplication) {
      console.warn(`⚠️ Triple S: Product ${product.name} cannot create application`)
      return []
    }

    // Validar que haya información de rider categories
    if (!response.requiredRiderCategoriesInfo || response.requiredRiderCategoriesInfo.length === 0) {
      console.warn(`⚠️ Triple S: No rider info for ${product.name}`)
      return []
    }

    const riderInfo = response.requiredRiderCategoriesInfo[0]

    // Validar que sea válido
    if (!riderInfo.isValid || riderInfo.errors.length > 0) {
      console.warn(`⚠️ Triple S: Invalid rider info for ${product.name}:`, riderInfo.errors)
      return []
    }

    // Parsear precios
    const minimumPremium = parseFloat(response.minimumPremium.replace(/[^0-9.]/g, ''))
    const targetPremium = parseFloat(response.targetPremium.replace(/[^0-9.]/g, ''))

    // Extraer specs disponibles
    const availableSpecs = riderInfo.hasMultipleSpecs && riderInfo.availableSpecs
      ? riderInfo.availableSpecs.map(spec => spec.description)
      : []

    // Categorizar producto
    const { insuranceType, seriesCategory } = this.categorizeProduct(product, series)

    // Crear plan mapeado
    const plan: TripleSMappedPlan = {
      id: `ts-${product.key.replace(/\s/g, '-')}`,
      name: `${product.name} - ${series.name}`,
      price: targetPremium,
      coverage: `$${riderInfo.faceAmount.toLocaleString()} Benefit`,
      productType: series.name,
      benefits: availableSpecs, // Usar specs como beneficios si están disponibles
      tripleS: true,
      carrierName: 'Triple S',
      carrierSlug: 'triple-s',
      seriesCode: series.code,
      productKey: product.key,
      minimumPremium,
      targetPremium,
      faceAmount: riderInfo.faceAmount,
      minFaceAmount: riderInfo.minFaceAmount_Slider,
      maxFaceAmount: riderInfo.maxFaceAmount_Slider,
      faceAmountStep: riderInfo.faceAmountSliderStep,
      planType: product.coverageType || 'Individual',
      benefitDescription: `Coverage: ${riderInfo.faceAmountText}`,
      availableSpecs,
      metadata: {
        canCreateApplication: response.canCreateApplication,
        availableSpecs: riderInfo.availableSpecs,
        quoteResponse: response,
        hasMultipleSpecs: riderInfo.hasMultipleSpecs,
        categoryName: riderInfo.categoryName,
        minFaceAmountText: riderInfo.minFaceAmountText,
        maxFaceAmountText: riderInfo.maxFaceAmountText,
        insuranceType, // Vida, Salud, Retiro
        seriesCategory, // Tradicionales, Freedom, etc.
        seriesCode: series.code
      }
    }

    return [plan]
  }
}

export const tripleSAPI = new TripleSAPI()
