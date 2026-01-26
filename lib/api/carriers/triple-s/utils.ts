/**
 * Utilidades para Triple S API
 * Maneja requests HTTPS con certificados no confiables en desarrollo
 */

import https from 'https'

/**
 * Crea un agente HTTPS que ignora certificados en desarrollo
 */
export function getHttpsAgent() {
  if (process.env.NODE_ENV === 'development') {
    return new https.Agent({
      rejectUnauthorized: false
    })
  }
  return undefined
}

/**
 * Fetch wrapper que maneja certificados SSL en desarrollo
 */
export async function secureFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // En desarrollo, deshabilitar validación de certificados
  if (process.env.NODE_ENV === 'development') {
    // @ts-ignore - Opción específica de Node.js
    options.agent = getHttpsAgent()
  }

  try {
    const response = await fetch(url, options)
    return response
  } catch (error) {
    console.error('❌ Fetch error:', {
      url,
      error: error instanceof Error ? error.message : error
    })
    throw error
  }
}
