## 📋 Información General

**Base URL**: `https://api.manhattanlife.com/EnrollmentService.QA`

**Ambiente**: QA/Testing

**Autenticación**: Bearer Token (OAuth 2.0)

---

## 🗂️ Endpoint: Obtener Jerarquía Activa de Productos/Planes/Riders

### **Request**

```
GET /api/Enrollment/GetActiveProductPlanRiderHierarchy

```

**URL Completa**:

```
https://api.manhattanlife.com/EnrollmentService.QA/api/Enrollment/GetActiveProductPlanRiderHierarchy

```

### **Descripción**

Este endpoint retorna la **jerarquía completa** de todos los productos, planes y riders activos en el sistema de Manhattan Life. Es útil para:

- Obtener **productId** necesario para el endpoint de brochures
- Listar todos los productos disponibles en el sistema
- Ver la estructura completa de planes y riders
- Mapear IDs internos para referencias cruzadas

**IMPORTANTE**: Este endpoint NO filtra por agente. Retorna TODOS los productos activos del sistema, aunque el agente no tenga acceso a venderlos.

### **Headers**

| Header | Valor | Requerido |
| --- | --- | --- |
| `Authorization` | `Bearer {access_token}` | ✅ Sí |
| `Content-Type` | `application/json` | ✅ Sí |

### **Query Parameters**

Ninguno - este endpoint no requiere parámetros.

---

## 📥 Response

### **Success Response**

**Status Code**: `200 OK`

**Response Body**:

```json
[
  {
    "productId": 1001,
    "productName": "Cancer Care Plus",
    "plans": [
      {
        "planId": 5001,
        "planName": "PLAN A",
        "planUnitId": 22540,
        "unit": 1,
        "unitName": "PLAN A",
        "planUnitFlag": true,
        "riders": [
          {
            "riderId": 3001,
            "riderName": "Critical Care Rider",
            "riderUnitId": 4093,
            "unit": 1,
            "unitName": "Critical Care Rider",
            "riderType": "Optional",
            "riderUnitFlag": true,
            "fromAge": 18,
            "toAge": 64,
            "insuree": "Applicant"
          },
          {
            "riderId": 3002,
            "riderName": "Intensive Care Rider",
            "riderUnitId": 4683,
            "unit": 1,
            "unitName": "Intensive Care Rider",
            "riderType": "Optional",
            "riderUnitFlag": true,
            "fromAge": 18,
            "toAge": 64,
            "insuree": "Applicant"
          }
        ]
      },
      {
        "planId": 5002,
        "planName": "PLAN B",
        "planUnitId": 22471,
        "unit": 1,
        "unitName": "PLAN B",
        "planUnitFlag": true,
        "riders": [
          {
            "riderId": 3001,
            "riderName": "Critical Care Rider",
            "riderUnitId": 4093,
            "unit": 1,
            "unitName": "Critical Care Rider",
            "riderType": "Optional",
            "riderUnitFlag": true,
            "fromAge": 18,
            "toAge": 64,
            "insuree": "Applicant"
          }
        ]
      }
    ]
  },
  {
    "productId": 1002,
    "productName": "Critical Protection and Recovery",
    "plans": [
      {
        "planId": 5010,
        "planName": "Critical Illness",
        "planUnitId": 21795,
        "unit": 5000,
        "unitName": "$5,000",
        "planUnitFlag": true,
        "riders": []
      },
      {
        "planId": 5011,
        "planName": "Critical Illness",
        "planUnitId": 21902,
        "unit": 7500,
        "unitName": "$7,500",
        "planUnitFlag": true,
        "riders": []
      }
    ]
  }
]

```

---

## 📊 Response Structure

### **Root Level**

**Type**: Array de objetos Product

### **Product Object**

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `productId` | integer | **ID único del producto** (usar para brochure endpoint) |
| `productName` | string | Nombre del producto |
| `plans` | array[Plan] | Array de planes disponibles para este producto |

### **Plan Object**

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `planId` | integer | ID único del plan |
| `planName` | string | Nombre del plan |
| `planUnitId` | integer | **ID de la unidad del plan** (mismo que `planUnitStateCodeId` de otros endpoints) |
| `unit` | integer | Valor numérico de la unidad (monto de cobertura o nivel) |
| `unitName` | string | Nombre descriptivo de la unidad |
| `planUnitFlag` | boolean | Indica si la unidad está activa |
| `riders` | array[Rider] | Array de riders disponibles para este plan |

### **Rider Object**

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `riderId` | integer | ID único del rider |
| `riderName` | string | Nombre del rider |
| `riderUnitId` | integer | **ID de la unidad del rider** (mismo que `riderUnitStateId` de otros endpoints) |
| `unit` | integer | Valor numérico de la unidad del rider |
| `unitName` | string | Nombre descriptivo de la unidad |
| `riderType` | string | Tipo de rider (`"Optional"`, `"Mandatory"`, etc.) |
| `riderUnitFlag` | boolean | Indica si la unidad del rider está activa |
| `fromAge` | integer | Edad mínima para elegibilidad |
| `toAge` | integer | Edad máxima para elegibilidad |
| `insuree` | string | A quién aplica el rider |

### **Insuree Values**

| Valor | Descripción |
| --- | --- |
| `"Applicant"` | Solo aplicante principal |
| `"Spouse"` | Solo cónyuge |
| `"Dependent"` | Dependientes |
| `"All"` | Todos los asegurados |

---

## 🔑 IDs Críticos y Mapeo

### **Relación con Otros Endpoints**

| Campo en este Endpoint | Equivalente en otros Endpoints | Uso |
| --- | --- | --- |
| `productId` | - | Para endpoint de brochures |
| `planUnitId` | `planUnitStateCodeId` | Para enrollment, questionnaire, statements |
| `riderUnitId` | `riderUnitStateId` | Para enrollment (riders seleccionados) |

### **Tabla de Referencia Cruzada**

```tsx
// Este endpoint retorna:
{
  productId: 1001,        // ← NUEVO: Solo disponible aquí
  productName: "Cancer Care Plus",
  plans: [{
    planUnitId: 22540     // ← MISMO que planUnitStateCodeId
  }]
}

// Endpoint producthierarchy retorna:
{
  productName: "Cancer Care Plus",
  plans: [{
    planUnitStateCodeId: 22540  // ← MISMO que planUnitId
  }]
}

// Para enrollment necesitas:
plan: {
  planUnitStateCodeId: 22540,  // ← Usar planUnitId de aquí
  riders: [{
    riderUnitStateId: 4093     // ← Usar riderUnitId de aquí
  }]
}

```

---

## 🔧 Ejemplos de Implementación

### **cURL**

```bash
curl -X GET "https://api.manhattanlife.com/EnrollmentService.QA/api/Enrollment/GetActiveProductPlanRiderHierarchy" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"

```

### **JavaScript (Fetch)**

```jsx
const token = 'YOUR_ACCESS_TOKEN';

const response = await fetch(
  'https://api.manhattanlife.com/EnrollmentService.QA/api/Enrollment/GetActiveProductPlanRiderHierarchy',
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }
);

const hierarchy = await response.json();
console.log(`Found ${hierarchy.length} active products`);

```

### **Next.js API Route**

```tsx
// app/api/manhattanlife/active-hierarchy/route.ts

import { getManhattanLifeToken } from '@/lib/manhattanlife/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const token = await getManhattanLifeToken();

    const response = await fetch(
      `${process.env.MANHATTAN_LIFE_API_URL}/api/Enrollment/GetActiveProductPlanRiderHierarchy`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const hierarchy = await response.json();

    return NextResponse.json({
      success: true,
      totalProducts: hierarchy.length,
      data: hierarchy,
    });
  } catch (error: any) {
    console.error('Error fetching active hierarchy:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

```

### **Helper Function con TypeScript**

```tsx
// lib/manhattanlife/active-hierarchy.ts

import { getManhattanLifeToken } from './auth';

export interface Rider {
  riderId: number;
  riderName: string;
  riderUnitId: number;
  unit: number;
  unitName: string;
  riderType: string;
  riderUnitFlag: boolean;
  fromAge: number;
  toAge: number;
  insuree: 'Applicant' | 'Spouse' | 'Dependent' | 'All';
}

export interface Plan {
  planId: number;
  planName: string;
  planUnitId: number;
  unit: number;
  unitName: string;
  planUnitFlag: boolean;
  riders: Rider[];
}

export interface Product {
  productId: number;
  productName: string;
  plans: Plan[];
}

export async function getActiveProductHierarchy(): Promise<Product[]> {
  const token = await getManhattanLifeToken();

  const response = await fetch(
    `${process.env.MANHATTAN_LIFE_API_URL}/api/Enrollment/GetActiveProductPlanRiderHierarchy`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch active hierarchy: ${response.statusText}`);
  }

  return await response.json();
}

// Helper: Buscar productId por nombre
export function findProductIdByName(
  hierarchy: Product[],
  productName: string
): number | null {
  const product = hierarchy.find(
    p => p.productName.toLowerCase() === productName.toLowerCase()
  );
  return product?.productId || null;
}

// Helper: Buscar plan por planUnitId
export function findPlanByUnitId(
  hierarchy: Product[],
  planUnitId: number
): { product: Product; plan: Plan } | null {
  for (const product of hierarchy) {
    const plan = product.plans.find(p => p.planUnitId === planUnitId);
    if (plan) {
      return { product, plan };
    }
  }
  return null;
}

// Helper: Verificar elegibilidad de rider por edad
export function isRiderEligibleForAge(
  rider: Rider,
  age: number
): boolean {
  return age >= rider.fromAge && age <= rider.toAge;
}

// Helper: Obtener todos los riders disponibles para un plan
export function getAvailableRidersForPlan(
  hierarchy: Product[],
  planUnitId: number,
  applicantAge: number
): Rider[] {
  const result = findPlanByUnitId(hierarchy, planUnitId);
  if (!result) return [];

  return result.plan.riders.filter(
    rider => rider.riderUnitFlag && isRiderEligibleForAge(rider, applicantAge)
  );
}

// Helper: Crear mapa de productId -> productName
export function createProductIdMap(
  hierarchy: Product[]
): Map<number, string> {
  const map = new Map<number, string>();
  hierarchy.forEach(product => {
    map.set(product.productId, product.productName);
  });
  return map;
}

```

---

## 💾 Almacenamiento y Caché

### **Estrategia de Caché**

```tsx
// lib/manhattanlife/hierarchy-cache.ts

interface HierarchyCache {
  data: Product[];
  cachedAt: number;
}

let hierarchyCache: HierarchyCache | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

export async function getActiveProductHierarchyCached(): Promise<Product[]> {
  const now = Date.now();

  // Verificar si tenemos caché válido
  if (hierarchyCache && (now - hierarchyCache.cachedAt) < CACHE_DURATION) {
    console.log('✅ Returning cached product hierarchy');
    return hierarchyCache.data;
  }

  // Obtener nuevos datos
  console.log('🔄 Fetching fresh product hierarchy...');
  const data = await getActiveProductHierarchy();

  // Actualizar caché
  hierarchyCache = {
    data,
    cachedAt: now,
  };

  return data;
}

// Función para invalidar caché manualmente
export function invalidateHierarchyCache(): void {
  hierarchyCache = null;
  console.log('🗑️ Hierarchy cache invalidated');
}

```

### **Almacenar en Supabase (Opcional)**

```sql
-- Tabla para almacenar jerarquía de productos
CREATE TABLE product_hierarchy_cache (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL UNIQUE,
  product_name VARCHAR(255) NOT NULL,
  hierarchy_data JSONB NOT NULL, -- Almacenar plans y riders
  is_active BOOLEAN DEFAULT true,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_product_hierarchy_product_id ON product_hierarchy_cache(product_id);
CREATE INDEX idx_product_hierarchy_product_name ON product_hierarchy_cache(product_name);

```

```tsx
// Sincronizar jerarquía con Supabase
export async function syncHierarchyToDatabase() {
  const hierarchy = await getActiveProductHierarchy();

  for (const product of hierarchy) {
    await supabase
      .from('product_hierarchy_cache')
      .upsert({
        product_id: product.productId,
        product_name: product.productName,
        hierarchy_data: {
          plans: product.plans,
        },
        cached_at: new Date().toISOString(),
      });
  }

  console.log(`✅ Synced ${hierarchy.length} products to database`);
}

```

---

## 🎯 Casos de Uso

### **1. Obtener productId para Brochures**

```tsx
// Necesitas el productId para el endpoint de brochures
const hierarchy = await getActiveProductHierarchy();

// Buscar productId por nombre
const productId = findProductIdByName(hierarchy, 'Cancer Care Plus');

if (productId) {
  // Usar para obtener brochure
  const brochureUrl = await getBrochureLink(productId);
  console.log(`Brochure URL: ${brochureUrl}`);
}

```

### **2. Validar Plan y Riders Antes de Enrollment**

```tsx
// Antes de enviar enrollment, verificar que los IDs son válidos
const hierarchy = await getActiveProductHierarchy();

const planExists = findPlanByUnitId(hierarchy, 22540);
if (!planExists) {
  throw new Error('Invalid plan ID');
}

// Verificar que los riders seleccionados existen y son elegibles
const selectedRiderIds = [4093, 4683];
const availableRiders = planExists.plan.riders;

for (const riderId of selectedRiderIds) {
  const rider = availableRiders.find(r => r.riderUnitId === riderId);
  if (!rider) {
    throw new Error(`Rider ${riderId} not available for this plan`);
  }

  // Verificar elegibilidad por edad
  const applicantAge = 35;
  if (!isRiderEligibleForAge(rider, applicantAge)) {
    throw new Error(`Rider ${rider.riderName} not eligible for age ${applicantAge}`);
  }
}

```

### **3. Crear Lista de Productos para UI**

```tsx
// Mostrar todos los productos activos en marketplace
const hierarchy = await getActiveProductHierarchy();

const productList = hierarchy.map(product => ({
  id: product.productId,
  name: product.productName,
  totalPlans: product.plans.length,
  hasRiders: product.plans.some(plan => plan.riders.length > 0),
}));

// Renderizar en UI
productList.forEach(product => {
  console.log(`${product.name} (${product.totalPlans} plans)`);
});

```

### **4. Filtrar Riders por Edad del Aplicante**

```tsx
// Usuario tiene 45 años
const applicantAge = 45;
const hierarchy = await getActiveProductHierarchy();

// Obtener plan seleccionado
const planData = findPlanByUnitId(hierarchy, 22540);

if (planData) {
  // Filtrar riders elegibles por edad
  const eligibleRiders = planData.plan.riders.filter(
    rider => isRiderEligibleForAge(rider, applicantAge)
  );

  // Mostrar solo riders elegibles en UI
  console.log(`${eligibleRiders.length} riders available for age ${applicantAge}`);
}

```

### **5. Crear Mapa de Referencia para Lookups Rápidos**

```tsx
// Crear índices para lookups O(1)
const hierarchy = await getActiveProductHierarchy();

// Mapa de productId -> Product
const productMap = new Map<number, Product>();
hierarchy.forEach(p => productMap.set(p.productId, p));

// Mapa de planUnitId -> Plan
const planMap = new Map<number, Plan>();
hierarchy.forEach(product => {
  product.plans.forEach(plan => {
    planMap.set(plan.planUnitId, plan);
  });
});

// Uso rápido
const plan = planMap.get(22540);
console.log(plan?.planName); // "PLAN A"

```

---

## 📊 Diferencias con Otros Endpoints

### **vs. `/api/v2/product/agentProducts`**

| Aspecto | GetActiveHierarchy | agentProducts |
| --- | --- | --- |
| **Filtrado** | Todos los productos del sistema | Solo productos del agente |
| **Información** | Jerarquía completa (plans + riders) | Solo nombres de productos |
| **productId** | ✅ Incluye | ❌ No incluye |
| **Estado-específico** | ❌ No | ✅ Sí (requiere stateCode) |

**Cuándo usar:**

- `GetActiveHierarchy`: Para obtener productId o explorar todos los productos
- `agentProducts`: Para filtrar qué puede vender un agente específico

### **vs. `/api/v2/product/producthierarchy`**

| Aspecto | GetActiveHierarchy | producthierarchy |
| --- | --- | --- |
| **Filtrado** | Todos los productos | Productos específicos solicitados |
| **Estado** | No requiere stateCode | Requiere stateCode |
| **productId** | ✅ Incluye | ❌ No incluye |
| **Riders detallados** | ✅ Con fromAge/toAge | ✅ Completo |

**Cuándo usar:**

- `GetActiveHierarchy`: Para obtener catálogo completo y productId
- `producthierarchy`: Para obtener planes específicos de un estado

---

## ⚠️ Consideraciones Importantes

### **1. Este Endpoint NO Filtra por Agente**

```tsx
// ❌ INCORRECTO: Asumir que todos los productos están disponibles
const hierarchy = await getActiveProductHierarchy();
// Mostrar todos en marketplace

// ✅ CORRECTO: Filtrar por productos del agente
const agentProducts = await getAgentProducts('99999990000');
const hierarchy = await getActiveProductHierarchy();

// Solo mostrar productos que el agente puede vender
const availableProducts = hierarchy.filter(product =>
  agentProducts.some(ap => ap.productName === product.productName)
);

```

### **2. productId es Clave para Brochures**

El `productId` de este endpoint es el **único lugar** donde puedes obtenerlo:

```tsx
// Este ID se usa en el endpoint de brochures
GET /api/Enrollment/BrochureLink?productId=1001

```

### **3. Riders con Elegibilidad por Edad**

```tsx
// Verificar elegibilidad antes de mostrar
const rider = {
  riderName: "Critical Care Rider",
  fromAge: 18,
  toAge: 64
};

const applicantAge = 70;
if (applicantAge < rider.fromAge || applicantAge > rider.toAge) {
  console.log('❌ Rider not eligible for this age');
}

```

### **4. Caché Recomendado**

```tsx
// Esta jerarquía NO cambia frecuentemente
// Cachear por 24 horas es seguro
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

```

### **5. planUnitFlag y riderUnitFlag**

```tsx
// Solo mostrar items activos
const activePlans = product.plans.filter(p => p.planUnitFlag);
const activeRiders = plan.riders.filter(r => r.riderUnitFlag);

```

---

## 📋 Estructura Completa de la Jerarquía

```
Manhattan Life System
└── Products (todos los activos)
    ├── Product 1 (productId: 1001)
    │   ├── Plan A (planUnitId: 22540)
    │   │   ├── Rider 1 (riderUnitId: 4093, ages: 18-64)
    │   │   └── Rider 2 (riderUnitId: 4683, ages: 18-64)
    │   └── Plan B (planUnitId: 22471)
    │       └── Rider 1 (riderUnitId: 4093, ages: 18-64)
    └── Product 2 (productId: 1002)
        ├── Plan C (planUnitId: 21795)
        └── Plan D (planUnitId: 21902)

```

---

## 📊 Códigos de Error Comunes

| Status Code | Descripción | Causa Probable | Solución |
| --- | --- | --- | --- |
| `200` | Success | Jerarquía obtenida exitosamente | - |
| `401` | Unauthorized | Token expirado o inválido | Renovar token |
| `500` | Internal Server Error | Error en servidor | Reintentar más tarde |

---

## ✅ Checklist de Implementación

- [ ]  Endpoint probado en Insomnia/Postman
- [ ]  Helper function creada con tipos TypeScript
- [ ]  Sistema de caché implementado (24 horas)
- [ ]  Función de búsqueda de productId por nombre
- [ ]  Función de validación de elegibilidad de riders
- [ ]  Filtrado de productos por agente implementado
- [ ]  Mapa de referencia para lookups rápidos
- [ ]  Integración con endpoint de brochures
- [ ]  Validación de planUnitFlag y riderUnitFlag
- [ ]  Testing con diferentes productos

---

## 🔗 Endpoints Relacionados

- `POST /api/token` - Autenticación
- `GET /api/v2/product/agentProducts` - Productos del agente (usar para filtrar)
- `POST /api/v2/product/producthierarchy` - Jerarquía estado-específica
- `GET /api/Enrollment/GetActiveProductPlanRiderHierarchy` - **Este endpoint**
- `GET /api/Enrollment/BrochureLink` - Obtener brochure (requiere productId de aquí)

---

## 📝 Notas Adicionales

- **Propósito Principal**: Obtener `productId` para el endpoint de brochures
- **Caché Recomendado**: 24 horas (la jerarquía no cambia frecuentemente)
- **No Requiere Parámetros**: Endpoint simple sin query params ni body
- **Respuesta Completa**: Incluye TODOS los productos activos del sistema
- **Filtrar por Agente**: Combinar con `/api/v2/product/agentProducts`
- **Elegibilidad de Riders**: Verificar `fromAge` y `toAge` antes de mostrar

---

## 🔍 Comparación de IDs

Para clarificar la relación entre diferentes endpoints:

```tsx
// GetActiveProductPlanRiderHierarchy
{
  productId: 1001,           // ← ÚNICO de este endpoint
  productName: "Cancer Care Plus",
  plans: [{
    planId: 5001,
    planUnitId: 22540        // ← MISMO que planUnitStateCodeId
  }]
}

// producthierarchy
{
  productName: "Cancer Care Plus",
  plans: [{
    planUnitStateCodeId: 22540  // ← MISMO que planUnitId
  }]
}

// Para brochures necesitas:
GET /api/Enrollment/BrochureLink?productId=1001  // ← De este endpoint

```

---

**Última actualización**: 2025-11-08
**Versión**: 1.0
**Estado**: ✅ Validado en ambiente QA
**Uso Principal**: Obtener productId para endpoint de brochures