import type { TripleSLoginRequest, TripleSAuthToken } from './types'
import { secureFetch } from './utils'

/**
 * Gestión de autenticación para Triple S API
 * - Token Bearer válido por 24 horas
 * - Auto-renovación cuando expira
 * - Retry automático en caso de 401
 * - Singleton pattern para compartir token entre requests
 */
class TripleSAuth {
  private token: string | null = null
  private tokenExpiresAt: Date | null = null
  private readonly baseURL: string
  private readonly username: string
  private readonly password: string
  private isRefreshing: boolean = false
  private refreshPromise: Promise<string> | null = null

  constructor() {
    this.baseURL = process.env.TRIPLE_S_BASE_URL || ''
    this.username = process.env.TRIPLE_S_USERNAME || ''
    this.password = process.env.TRIPLE_S_PASSWORD || ''

    if (!this.baseURL || !this.username || !this.password) {
      console.warn('⚠️ Triple S credentials not configured')
    }
  }

  /**
   * Verifica si el token actual es válido
   * Considera válido si existe y expira en más de 1 hora
   */
  private isTokenValid(): boolean {
    if (!this.token || !this.tokenExpiresAt) {
      return false
    }

    const now = new Date()
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)

    // Token es válido si expira después de 1 hora desde ahora
    return this.tokenExpiresAt > oneHourFromNow
  }

  /**
   * Obtiene el token actual o lo renueva si es necesario
   */
  async getToken(): Promise<string> {
    // Si el token es válido, retornarlo
    if (this.isTokenValid() && this.token) {
      console.log('✅ Triple S: Using cached token')
      return this.token
    }

    // Si ya hay un refresh en progreso, esperar a que termine
    if (this.isRefreshing && this.refreshPromise) {
      console.log('⏳ Triple S: Waiting for ongoing token refresh')
      return this.refreshPromise
    }

    // Renovar token
    return this.refreshToken()
  }

  /**
   * Renueva el token llamando al endpoint de login
   */
  async refreshToken(): Promise<string> {
    // Evitar múltiples refreshes simultáneos
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true
    this.refreshPromise = this.performRefresh()

    try {
      const token = await this.refreshPromise
      return token
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  /**
   * Ejecuta el refresh del token
   */
  private async performRefresh(): Promise<string> {
    console.log('🔄 Triple S: Refreshing authentication token')

    const loginRequest: TripleSLoginRequest = {
      Username: this.username,
      Password: this.password
    }

    try {
      const url = `${this.baseURL}/TSVAgent/api/Auth/Login`
      console.log('📡 Triple S Auth: Connecting to:', url)

      const response = await secureFetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginRequest)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Triple S: Login failed:', response.status, errorText)
        throw new Error(`Triple S login failed: ${response.status} ${response.statusText}`)
      }

      // La respuesta es el token en texto plano
      const token = await response.text()

      if (!token) {
        throw new Error('Triple S: No token received from login')
      }

      // Guardar token y calcular expiración (24 horas - 1 hora de margen)
      this.token = token
      const now = new Date()
      this.tokenExpiresAt = new Date(now.getTime() + 23 * 60 * 60 * 1000) // 23 horas

      console.log('✅ Triple S: Token refreshed successfully')
      console.log(`📅 Triple S: Token expires at ${this.tokenExpiresAt.toISOString()}`)

      return token
    } catch (error) {
      console.error('❌ Triple S: Error refreshing token:', error)
      // Limpiar token en caso de error
      this.token = null
      this.tokenExpiresAt = null
      throw error
    }
  }

  /**
   * Realiza un request autenticado con Bearer token
   * Auto-retries en caso de 401
   */
  async makeAuthenticatedRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Obtener token válido
    const token = await this.getToken()

    // Agregar Authorization header
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      })

      // Si es 401, el token expiró - renovar y reintentar UNA vez
      if (response.status === 401) {
        console.warn('⚠️ Triple S: 401 received, refreshing token and retrying')

        // Forzar refresh del token
        this.token = null
        this.tokenExpiresAt = null
        const newToken = await this.getToken()

        // Reintentar con nuevo token
        const retryHeaders = {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json'
        }

        const retryResponse = await fetch(url, {
          ...options,
          headers: retryHeaders
        })

        if (!retryResponse.ok) {
          const errorText = await retryResponse.text()
          throw new Error(
            `Triple S API error after retry: ${retryResponse.status} ${retryResponse.statusText} - ${errorText}`
          )
        }

        return retryResponse.json()
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Triple S API error: ${response.status} ${response.statusText} - ${errorText}`
        )
      }

      return response.json()
    } catch (error) {
      console.error('❌ Triple S: Request failed:', error)
      throw error
    }
  }
}

// Singleton instance
export const tripleSAuth = new TripleSAuth()
