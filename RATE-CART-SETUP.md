# Configuración del Endpoint Rate/Cart

## ⚠️ Error 401 Unauthorized - Solución

El endpoint Rate/Cart requiere autenticación Basic Auth de Allstate.

## 🔧 Configurar Variables de Entorno

Agrega o actualiza estas variables en tu archivo `.env.local`:

```bash
# Allstate Rate/Cart API
ALLSTATE_API_URL_RATE_CART=https://qa1-ngahservices.ngic.com/QuotingAPI/api/v1/Rate/Cart

# Allstate Authentication Token (Basic Auth)
# Token por defecto para QA: TestUser:Test1234 (base64 encoded)
ALLSTATE_AUTH_TOKEN=VGVzdFVzZXI6VGVzdDEyMzQ=

# Agent ID
NEXT_PUBLIC_AGENT_NUMBER=159208
```

## 🚀 Pasos para Resolver

### 1. Crear/Actualizar .env.local

```bash
cd /Users/josetepaz/Documents/jose-tepaz-projects/epicare/epicareplans-marketplace

# Si no existe, créalo:
touch .env.local

# Edítalo y agrega las variables:
nano .env.local
```

### 2. Agregar las Variables

Copia y pega en `.env.local`:

```bash
# Allstate API Configuration
ALLSTATE_API_URL=https://qa1-ngahservices.ngic.com/QuotingAPI/api/v1/Rate/AllPlans
ALLSTATE_API_URL_RATE_CART=https://qa1-ngahservices.ngic.com/QuotingAPI/api/v1/Rate/Cart
ALLSTATE_AUTH_TOKEN=VGVzdFVzZXI6VGVzdDEyMzQ=
ALLSTATE_AGENT_ID=159208
NEXT_PUBLIC_AGENT_NUMBER=159208
```

### 3. Reiniciar el Servidor de Desarrollo

```bash
# Detén el servidor (Ctrl + C)
# Luego reinicia:
npm run dev
```

## 🔐 Sobre el Token de Autenticación

### Token de QA (Actual)
```
Username: TestUser
Password: Test1234
Token Base64: VGVzdFVzZXI6VGVzdDEyMzQ=
```

### Token de Producción (Futuro)
Cuando vayas a producción, necesitarás solicitar credenciales reales a Allstate y actualizar:
```bash
ALLSTATE_AUTH_TOKEN=tu_token_de_produccion_base64
ALLSTATE_API_URL_RATE_CART=https://ngahservices.ngic.com/QuotingAPI/api/v1/Rate/Cart
```

## ✅ Verificar que Funciona

Después de configurar:

1. Ve a `/insurance-options`
2. Agrega un family member (si no tienes uno)
3. Haz clic en "Select this plan" en un plan de Allstate
4. Deberías ver:
   - Loading: "Calculating price..."
   - Toast: "Price updated for family coverage"
   - Sin errores 401

## 🐛 Troubleshooting

### Error persiste después de configurar
```bash
# Limpia la caché de Next.js
rm -rf .next
npm run dev
```

### Verificar que las variables se cargaron
En tu código, puedes hacer un console.log temporal:
```typescript
console.log('Auth token:', process.env.ALLSTATE_AUTH_TOKEN)
```

### Error "Cannot read environment variable"
- Asegúrate de que el archivo se llama `.env.local` (con punto al inicio)
- Asegúrate de reiniciar el servidor después de crear/editar
- Variables del servidor no necesitan `NEXT_PUBLIC_` (solo las del cliente)

## 📋 Referencia

El endpoint completo ahora incluye:

```typescript
// Headers enviados a Allstate
{
  'Content-Type': 'application/json',
  'Authorization': 'Basic VGVzdFVzZXI6VGVzdDEyMzQ='
}
```

## 🔄 Endpoints de Allstate

| Endpoint | Uso | URL QA |
|----------|-----|--------|
| Rate/AllPlans | Obtener lista de planes | https://qa1-ngahservices.ngic.com/QuotingAPI/api/v1/Rate/AllPlans |
| Rate/Cart | Calcular precio con múltiples applicants | https://qa1-ngahservices.ngic.com/QuotingAPI/api/v1/Rate/Cart |

Ambos requieren el mismo token de autenticación.

