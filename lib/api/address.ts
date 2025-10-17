/**
 * Servicio para obtener información de dirección basada en ZIP code
 */

export interface AddressInfo {
  county: string
  city: string
  state: string
  countyFipsCode: string
  stateFipsCode: string | null
  deliverable: boolean
  preferred: boolean
}

export class AddressAPI {
  private baseURL = 'https://qa1-ngahservices.ngic.com/QuotingAPI/api/v1/Address'

  /**
   * Obtiene información de dirección basada en ZIP code
   */
  async getAddressByZipCode(zipCode: string): Promise<AddressInfo[]> {
    try {
      const response = await fetch(`${this.baseURL}/Counties/${zipCode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: AddressInfo[] = await response.json()
      
      console.log('Address API Response:', {
        zipCode,
        results: data.length,
        data
      })

      return data
    } catch (error) {
      console.error('Error fetching address info:', error)
      throw error
    }
  }

  /**
   * Obtiene el estado preferido del ZIP code
   */
  async getStateByZipCode(zipCode: string): Promise<string | null> {
    try {
      const addressInfo = await this.getAddressByZipCode(zipCode)
      
      // Buscar el registro preferido
      const preferred = addressInfo.find(info => info.preferred)
      
      if (preferred) {
        console.log('Estado preferido encontrado:', preferred.state)
        return preferred.state
      }
      
      // Si no hay preferido, usar el primero
      if (addressInfo.length > 0) {
        console.log('Usando primer estado disponible:', addressInfo[0].state)
        return addressInfo[0].state
      }
      
      console.log('No se encontró estado para ZIP code:', zipCode)
      return null
    } catch (error) {
      console.error('Error getting state by ZIP code:', error)
      return null
    }
  }
}

export const addressAPI = new AddressAPI()
