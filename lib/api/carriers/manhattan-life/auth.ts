import type { ManhattanLifeAuthToken } from './types'
import https from 'https'

// Agente HTTPS que acepta certificados autofirmados (solo para desarrollo/QA)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Solo para QA - NO usar en producción
})

class ManhattanLifeAuth {
  private token: string | null = null
  private tokenExpiry: number = 0
  private readonly baseURL: string
  private readonly username: string
  private readonly password: string

  constructor() {
    this.baseURL = process.env.MANHATTAN_LIFE_API_URL || ''
    this.username = process.env.MANHATTAN_LIFE_USERNAME || ''
    this.password = process.env.MANHATTAN_LIFE_PASSWORD || ''
  }

  async getToken(): Promise<string> {
    // Validar que las variables de entorno estén configuradas
    if (!this.baseURL || !this.username || !this.password) {
      throw new Error('Manhattan Life API credentials not configured. Please set MANHATTAN_LIFE_API_URL, MANHATTAN_LIFE_USERNAME, and MANHATTAN_LIFE_PASSWORD in .env.local')
    }

    // Si token válido y no expira en 5 min, retornar cached
    const now = Date.now()
    if (this.token && this.tokenExpiry > now + 5 * 60 * 1000) {
      return this.token
    }

    // Obtener nuevo token
    const params = new URLSearchParams({
      grant_type: 'password',
      username: this.username,
      password: this.password
    })

    console.log('🔐 Requesting token from Manhattan Life...')
    const response = await fetch(`${this.baseURL}/api/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
      // @ts-ignore - Node.js specific options para manejar SSL
      agent: httpsAgent,
    })
    console.log(`🔐 Token response status: ${response.status}`)

    if (!response.ok) {
      throw new Error(`Manhattan Life auth failed: ${response.status}`)
    }

    const data: ManhattanLifeAuthToken = await response.json()
    this.token = data.access_token
    this.tokenExpiry = now + data.expires_in * 1000

    return this.token
  }

  async makeAuthenticatedRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getToken()
    
    // Solo agregar Content-Type para requests con body (POST, PUT, etc.)
    const headers: Record<string, string> = {
      ...options.headers as Record<string, string>,
      'Authorization': `Bearer ${token}`,
    }
    
    // Solo agregar Content-Type si hay body o es POST/PUT/PATCH
    const method = options.method?.toUpperCase() || 'GET'
    if (options.body || ['POST', 'PUT', 'PATCH'].includes(method)) {
      headers['Content-Type'] = 'application/json'
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
      // @ts-ignore - Node.js specific options para manejar SSL
      agent: httpsAgent,
    })

    if (response.status === 401) {
      // Token expirado, invalidar y retry una vez
      this.token = null
      const newToken = await this.getToken()
      
      const retryHeaders: Record<string, string> = {
        ...options.headers as Record<string, string>,
        'Authorization': `Bearer ${newToken}`,
      }
      
      if (options.body || ['POST', 'PUT', 'PATCH'].includes(method)) {
        retryHeaders['Content-Type'] = 'application/json'
      }
      
      const retryResponse = await fetch(url, {
        ...options,
        headers: retryHeaders,
        // @ts-ignore - Node.js specific options para manejar SSL
        agent: httpsAgent,
      })
      
      if (!retryResponse.ok) {
        throw new Error(`Manhattan Life request failed: ${retryResponse.status}`)
      }
      return retryResponse.json()
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details')
      console.error(`❌ Manhattan Life API Error:`)
      console.error(`   Status: ${response.status} ${response.statusText}`)
      console.error(`   URL: ${url}`)
      console.error(`   Method: ${method}`)
      console.error(`   Response: ${errorText}`)
      throw new Error(`Manhattan Life request failed: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }
}

export const manhattanLifeAuth = new ManhattanLifeAuth()

