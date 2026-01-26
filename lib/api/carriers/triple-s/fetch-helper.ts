import https from 'https'

/**
 * Helper para hacer requests HTTPS ignorando certificados SSL en desarrollo
 * Necesario porque Triple S usa HTTPS con certificados self-signed
 */
export async function secureFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // En desarrollo, permitir certificados no autorizados
  if (process.env.NODE_ENV === 'development') {
    // Crear un agente HTTPS que ignore certificados
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false
    })

    // Para Node.js 18+, usar el fetch nativo con dispatcher personalizado
    try {
      // @ts-ignore - undici specific
      const { Agent, fetch: undiciFetch } = await import('undici')
      
      const dispatcher = new Agent({
        connect: {
          rejectUnauthorized: false
        }
      })

      return await undiciFetch(url, {
        ...options,
        // @ts-ignore
        dispatcher
      })
    } catch (e) {
      // Fallback: intentar con fetch estándar
      console.warn('⚠️ Triple S: Could not use undici, trying standard fetch')
    }
  }

  // En producción o como fallback, usar fetch estándar
  return fetch(url, options)
}

/**
 * Helper alternativo usando https.request directamente
 */
export function httpsRequest(
  url: string,
  options: {
    method?: string
    headers?: Record<string, string>
    body?: string
  } = {}
): Promise<{ data: any; status: number; statusText: string }> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      rejectUnauthorized: process.env.NODE_ENV !== 'development' // Ignorar SSL en dev
    }

    const req = https.request(requestOptions, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : null
          resolve({
            data: jsonData,
            status: res.statusCode || 500,
            statusText: res.statusMessage || 'Unknown'
          })
        } catch (error) {
          // Si no es JSON, devolver el texto
          resolve({
            data: data,
            status: res.statusCode || 500,
            statusText: res.statusMessage || 'Unknown'
          })
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    if (options.body) {
      req.write(options.body)
    }

    req.end()
  })
}
