# Triple S SSL Certificate Troubleshooting

## Problema: `fetch failed` / `TypeError: fetch failed`

Este error ocurre cuando el servidor de Triple S usa un certificado SSL que Node.js no confía.

## Soluciones

### Opción 1: Variable de Entorno (Más Simple) ⭐ RECOMENDADA

Agregar a `.env.local`:

```env
NODE_TLS_REJECT_UNAUTHORIZED=0
```

**Pros:**
- Fácil de implementar
- No requiere cambios de código

**Contras:**
- Afecta TODAS las conexiones HTTPS de la aplicación
- ⚠️ SOLO para desarrollo

**Reiniciar el servidor después de agregar:**
```bash
# Detener servidor (Ctrl+C)
# Iniciar nuevamente
npm run dev
```

---

### Opción 2: Configuración Específica por Endpoint

Ya está implementado en `lib/api/carriers/triple-s/utils.ts`:

```typescript
import { secureFetch } from './utils'

// Usar en lugar de fetch()
const response = await secureFetch(url, options)
```

Esto aplica la configuración SSL **solo** a requests de Triple S.

---

### Opción 3: Certificado Confiable (Producción)

Para producción, obtener el certificado correcto de Triple S IT:

1. Solicitar certificado CA a Triple S
2. Instalar en el sistema
3. Configurar Node.js para confiar en ese CA específico

```javascript
import https from 'https'

const agent = new https.Agent({
  ca: fs.readFileSync('./triple-s-ca.pem')
})
```

---

## Verificación

Después de aplicar la solución, verificar en logs:

✅ **Exitoso:**
```
📡 Triple S: Fetching catalog from: https://www.tsvapi.com:9443/quote/API/QuoteUserSeriesProducts
✅ Triple S: Catalog loaded - X profiles
```

❌ **Aún con error:**
```
❌ Triple S error: TypeError: fetch failed
```

---

## Troubleshooting Adicional

### Error persiste después de configurar variable

1. **Verificar que el servidor se reinició:**
   ```bash
   # Detener completamente (Ctrl+C)
   # Verificar que ningún proceso está corriendo
   lsof -ti:3000 | xargs kill -9  # Si es necesario
   # Iniciar de nuevo
   npm run dev
   ```

2. **Verificar que la variable se cargó:**
   ```typescript
   // Agregar log temporal en client.ts
   console.log('NODE_TLS_REJECT_UNAUTHORIZED:', process.env.NODE_TLS_REJECT_UNAUTHORIZED)
   ```

3. **Verificar conectividad:**
   ```bash
   # Probar curl directo
   curl -k https://www.tsvapi.com:9443/quote/API/QuoteUserSeriesProducts \
     -H "Content-Type: application/json" \
     -d '{"Username":"tsv_test_agt@live.com","Password":"Cambio01*"}'
   ```

### Error de red/timeout

Si el error menciona timeout o ECONNREFUSED:

1. Verificar firewall/VPN
2. Verificar que el puerto 9443 no esté bloqueado
3. Contactar IT de Triple S para confirmar disponibilidad del servidor

### Error 401/403

Si la conexión funciona pero retorna error de autenticación:

1. Verificar username/password en `.env.local`
2. Confirmar que las credenciales de test siguen activas
3. Solicitar nuevas credenciales a Triple S

---

## Ambiente de Producción

⚠️ **IMPORTANTE:** Antes de pasar a producción:

1. **Remover** `NODE_TLS_REJECT_UNAUTHORIZED=0` de `.env.local`
2. Obtener certificado confiable de Triple S
3. Configurar credenciales de producción
4. Cambiar `TRIPLE_S_PROCESS_ID=3`
5. Probar en staging primero

```env
# Producción
TRIPLE_S_BASE_URL=https://www.tsvapi.com:9443
TRIPLE_S_USERNAME=[PROD_USERNAME]
TRIPLE_S_PASSWORD=[PROD_PASSWORD]
TRIPLE_S_PROCESS_ID=3
# NODE_TLS_REJECT_UNAUTHORIZED=0  ← COMENTAR O ELIMINAR
```

---

## Referencias

- **Documentación Node.js TLS:** https://nodejs.org/api/tls.html
- **Next.js Environment Variables:** https://nextjs.org/docs/basic-features/environment-variables
- **Documentación Triple S:** `/context/triple-s-integration.md`
