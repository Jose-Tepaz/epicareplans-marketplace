## 📋 Información General

**Base URL**: `https://api.manhattanlife.com/EnrollmentService.QA`

**Ambiente**: QA/Testing

**Autenticación**: Bearer Token (OAuth 2.0)

---

## 📄 Endpoint: Obtener Enlaces de Brochures de Productos

### **Request**

```
GET /api/Enrollment/BrochureLink

```

**URL Completa**:

```
https://api.manhattanlife.com/EnrollmentService.QA/api/Enrollment/BrochureLink?productId={productId}&stateCode={stateCode}

```

### **Descripción**

Este endpoint retorna los **enlaces directos a los PDFs de brochures** (folletos informativos) de un producto específico para un estado determinado. Los brochures contienen:

- Descripción detallada del producto
- Coberturas incluidas
- Exclusiones y limitaciones
- Tabla de precios (rates)
- Términos y condiciones
- Información regulatoria del estado

**IMPORTANTE**: El `productId` debe obtenerse del endpoint `/api/Enrollment/GetActiveProductPlanRiderHierarchy`.

### **Headers**

| Header | Valor | Requerido |
| --- | --- | --- |
| `Authorization` | `Bearer {access_token}` | ✅ Sí |
| `Content-Type` | `application/json` | ✅ Sí |

### **Query Parameters**

| Parámetro | Tipo | Descripción | Ejemplo | Requerido |
| --- | --- | --- | --- | --- |
| `productId` | integer | ID del producto (del endpoint GetActiveProductPlanRiderHierarchy) | `401` | ✅ Sí |
| `stateCode` | string | Código del estado (2 letras) | `TX` | ✅ Sí |

---

## 📥 Response

### **Success Response**

**Status Code**: `200 OK`

**Response Body**:

```json
[
  "https://direct.manhattanlife.com/Brochures/CHAS-BR_0525.PDF",
  "https://direct.manhattanlife.com/Brochures/CHAS-BRSP_0525.PDF"
]

```

### **Response Structure**

**Type**: Array de strings

Cada string es una URL directa a un archivo PDF de brochure.

### **Múltiples Brochures**

Un producto puede tener **múltiples brochures**:

1. **Brochure principal** - Información general del producto
2. **Brochure en español** - Versión traducida (sufijo `SP`)
3. **Brochure específico del estado** - Variaciones regulatorias
4. **Brochures de riders** - Información de coberturas adicionales

### **Nomenclatura de Archivos**

Patrón típico: `{PRODUCT_CODE}-{TYPE}_{VERSION}.PDF`

**Ejemplos:**

- `CHAS-BR_0525.PDF` - Brochure (inglés), versión Mayo 2025
- `CHAS-BRSP_0525.PDF` - Brochure Spanish (español), versión Mayo 2025
- `CP4000-BR_0124.PDF` - Cancer Care Plus, Enero 2024

### **Sufijos Comunes**

| Sufijo | Descripción |
| --- | --- |
| `-BR` | Brochure (inglés) |
| `-BRSP` | Brochure Spanish (español) |
| `-OC` | Outline of Coverage |
| `-APP` | Application form |

---

## ⚠️ Consideraciones Importantes

### **1. productId vs. Nombre del Producto**

```tsx
// ❌ INCORRECTO: No puedes usar el nombre del producto
GET /api/Enrollment/BrochureLink?productName=Cancer Care Plus&stateCode=TX

// ✅ CORRECTO: Debes usar el productId
// Primero obtener productId:
const hierarchy = await getActiveProductHierarchy();
const productId = hierarchy.find(p => p.productName === 'Cancer Care Plus')?.productId;

// Luego obtener brochures:
GET /api/Enrollment/BrochureLink?productId=401&stateCode=TX

```

### **2. Array Puede Estar Vacío**

```tsx
const brochures = await getBrochureLinks(productId, stateCode);

if (brochures.length === 0) {
  console.log('⚠️ No brochures available for this product/state');
  // Mostrar mensaje al usuario
  // O usar brochure genérico
}

```

### **3. URLs son Directas (No Requieren Auth)**

```tsx
// Las URLs retornadas son públicas
const url = "https://direct.manhattanlife.com/Brochures/CHAS-BR_0525.PDF";

// Puedes:
// 1. Abrir en nueva pestaña
window.open(url, '_blank');

// 2. Mostrar en iframe
<iframe src={url} />

// 3. Descargar directamente
fetch(url).then(r => r.blob());

```

###