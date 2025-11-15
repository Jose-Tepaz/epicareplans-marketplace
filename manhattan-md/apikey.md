# Manhattan Life API - Endpoint de Autenticación

## 📋 Información General

**Base URL**: `https://api.manhattanlife.com/EnrollmentService.QA`

**Ambiente**: QA/Testing

**Tipo de Autenticación**: OAuth 2.0 - Password Grant Type

---

## 🔐 Endpoint: Obtener Token de Acceso

### **Request**

```
POST /api/token

```

**URL Completa**:

```
https://api.manhattanlife.com/EnrollmentService.QA/api/token

```

### **Headers**

| Header | Valor | Requerido |
| --- | --- | --- |
| `Content-Type` | `application/x-www-form-urlencoded` | ✅ Sí |

### **Body Parameters**

**Tipo**: Form URL Encoded

| Parámetro | Tipo | Valor | Descripción | Requerido |
| --- | --- | --- | --- | --- |
| `grant_type` | string | `password` | Tipo de grant OAuth2 (valor fijo) | ✅ Sí |
| `username` | string | - | Credenciales proporcionadas por Manhattan Life | ✅ Sí |
| `password` | string | - | Credenciales proporcionadas por Manhattan Life | ✅ Sí |

---

### **Response**

**Status Code**: `200 OK`

**Response Body**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}

```

### **Response Fields**

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `access_token` | string | Token JWT para autenticar requests subsecuentes |
| `token_type` | string | Tipo de token (siempre "bearer") |
| `expires_in` | integer | Tiempo de expiración del token en segundos |

---

## 🔑 Uso del Token en Requests Subsecuentes

Una vez obtenido el `access_token`, debe incluirse en el header `Authorization` de todas las peticiones a la API:

```
Authorization: Bearer {access_token}

```

**Ejemplo**:

```bash
curl -X GET "https://api.manhattanlife.com/EnrollmentService.QA/api/plans" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

```

---

## ⚙️ Variables de Entorno Requeridas

```
# .env.local
MANHATTAN_LIFE_API_URL=https://api.manhattanlife.com/EnrollmentService.QA
MANHATTAN_LIFE_USERNAME=your_username_here
MANHATTAN_LIFE_PASSWORD=your_password_here

```

---

## ⚠️ Consideraciones de Seguridad

1. **NUNCA exponer credenciales en el frontend**
2. **Almacenar credenciales únicamente en variables de entorno**
3. **El token debe manejarse exclusivamente en server-side**
4. **Implementar renovación automática antes de la expiración**
5. **No almacenar tokens en localStorage o cookies del cliente**

---

## 🔄 Estrategia de Renovación de Token

### **Renovación Proactiva (Recomendada)**

- El token se renueva automáticamente **5 minutos antes** de expirar
- Evita errores 401 Unauthorized durante operaciones
- Se mantiene un caché en memoria del servidor

### **Manejo de Errores 401**

Si un request falla con `401 Unauthorized`:

1. Invalidar token en caché
2. Obtener nuevo token
3. Reintentar el request original una vez
4. Si falla nuevamente, propagar el error

---

## 📊 Códigos de Error Comunes

| Status Code | Error | Causa | Solución |
| --- | --- | --- | --- |
| `400` | `unsupported_grant_type` | Content-Type incorrecto o grant_type inválido | Usar `application/x-www-form-urlencoded` y `grant_type=password` |
| `400` | `invalid_grant` | Credenciales incorrectas | Verificar username y password |
| `401` | Unauthorized | Token expirado o inválido | Renovar token |
| `500` | Internal Server Error | Error en servidor de Manhattan Life | Reintentar después de un delay |

---

##