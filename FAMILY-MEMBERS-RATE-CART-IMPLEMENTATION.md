# Sistema de Aplicantes Adicionales con Rate/Cart - Documentación

## Resumen

Se ha implementado un sistema completo que permite a los usuarios:
1. Agregar miembros familiares antes de cotizar planes
2. Calcular precios automáticamente para múltiples aplicantes usando la API Rate/Cart de Allstate
3. Ver precios actualizados en el checkout y enrollment

## Archivos Creados

### 1. Base de Datos
- **`add-family-members-table.sql`**: Migración SQL para crear tabla `family_members` con RLS policies

### 2. API y Lógica de Negocio
- **`lib/api/family-members.ts`**: Funciones CRUD para family members
- **`app/api/allstate/rate-cart/route.ts`**: Endpoint proxy para Rate/Cart API de Allstate
- **`lib/api/carriers/allstate-rate-cart.ts`**: Funciones helper para construir requests y manejar respuestas

### 3. Hooks
- **`hooks/use-family-members.ts`**: Hook personalizado para manejar estado global de family members

### 4. Componentes
- **`components/add-family-member-modal.tsx`**: Modal para agregar/editar family members
- **`components/family-members-manager.tsx`**: Componente principal para gestionar family members

### 5. Tipos Actualizados
- **`lib/types/enrollment.ts`**: Agregados tipos para Rate/Cart y FamilyMember

## Archivos Modificados

### 1. Insurance Options Page
- **`app/insurance-options/page.tsx`**: 
  - Agregado import de `FamilyMembersManager`
  - Integrado componente después de UserInfoSummary

### 2. Insurance Card Component
- **`components/insurance-card.tsx`**:
  - Agregado hook `useFamilyMembers`
  - Implementada lógica para llamar Rate/Cart al agregar al carrito
  - Mostrar loading state mientras calcula precio
  - Agregar metadata del precio actualizado al plan

### 3. Checkout Page
- **`app/checkout/page.tsx`**:
  - Agregado hook `useFamilyMembers`
  - Mostrar badge con número de applicants en cada plan
  - Mostrar total de applicants en el Order Summary
  - Mensaje indicando que precios incluyen cobertura familiar

### 4. Enrollment Page
- **`app/enrollment/page.tsx`**:
  - Agregado import de funciones de family members
  - Pre-cargar family members en Step 4 (Additional Applicants)
  - Convertir family members a formato Applicant automáticamente

## Estructura de la Base de Datos

### Tabla: family_members

```sql
- id (uuid, primary key)
- user_id (uuid, foreign key -> users)
- first_name (varchar)
- middle_initial (varchar)
- last_name (varchar)
- gender (varchar)
- date_of_birth (date)
- ssn (varchar, optional)
- relationship (varchar)
- smoker (boolean)
- date_last_smoked (date, optional)
- weight (integer)
- height_feet (integer)
- height_inches (integer)
- has_prior_coverage (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

## Flujo de Usuario

### 1. Agregar Family Members (insurance-options)
```
Usuario → Insurance Options
  → Clic en "Add Member" (FamilyMembersManager)
  → Completa formulario (AddFamilyMemberModal)
  → Guarda en BD (family_members table)
  → Se muestra en lista de family members
```

### 2. Seleccionar Plan con Precio Actualizado
```
Usuario → Ve planes disponibles
  → Clic en "Select this plan"
  → Sistema verifica si hay family members
  → SI hay members:
    → Construye request para Rate/Cart API
    → Envía: primary applicant + family members + plan
    → Recibe: precio actualizado para todos los applicants
    → Agrega plan al carrito con precio actualizado
  → SI NO hay members:
    → Agrega plan con precio base
```

### 3. Checkout
```
Usuario → Checkout page
  → Ve planes con badge indicando X applicants
  → Ve total de applicants en Order Summary
  → Ve mensaje: "Prices include coverage for X family members"
  → Procede a enrollment
```

### 4. Enrollment
```
Usuario → Enrollment page
  → Sistema carga family members automáticamente
  → Pre-llena Step 4 (Additional Applicants)
  → Usuario puede editar/agregar/eliminar según necesite
  → Completa enrollment normalmente
```

## Rate/Cart API Integration

### Endpoint
```
POST https://ngahservices.ngic.com/QuotingAPI/api/v1/Rate/Cart
```

### Request Format
```json
{
  "agentId": "159208",
  "effectiveDate": "2025-11-15T00:00:00.000Z",
  "zipCode": "07007",
  "state": "NJ",
  "applicants": [
    {
      "birthDate": "2000-10-01T00:00:00Z",
      "gender": "Male",
      "relationshipType": "Primary",
      "isSmoker": false,
      "hasPriorCoverage": false,
      "rateTier": "Standard",
      "memberId": "primary-001"
    }
  ],
  "paymentFrequency": "Monthly",
  "plansToRate": [
    {
      "planKey": "2144",
      "productCode": "21044",
      "paymentFrequency": "Monthly"
    }
  ]
}
```

### Response Format
```json
{
  "success": true,
  "plans": [
    {
      "planKey": "2144",
      "productCode": "21044",
      "monthlyPremium": 125.50
    }
  ]
}
```

## Características Implementadas

### ✅ Gestión de Family Members
- CRUD completo (Create, Read, Update, Delete)
- Persistencia en base de datos
- Validación de campos
- UI intuitiva con cards y modal

### ✅ Integración Rate/Cart
- Proxy endpoint seguro
- Construcción automática de requests
- Manejo de errores graceful
- Cache de resultados (5 min TTL)
- Fallback a precio base si falla API

### ✅ Experiencia de Usuario
- Loading states durante cálculo
- Toasts informativos
- Visualización clara de applicants incluidos
- Pre-carga automática en enrollment
- Precio original tachado cuando se actualiza

### ✅ Metadata en Planes
- `priceUpdatedWithRateCart`: boolean
- `applicantsIncluded`: number
- `originalPrice`: number

## Instrucciones para Probar

### 1. Configurar Base de Datos
```bash
# Ejecutar en Supabase SQL Editor
cat add-family-members-table.sql
# Pegar y ejecutar el contenido
```

### 2. Configurar Variables de Entorno
```env
NEXT_PUBLIC_AGENT_NUMBER=159208
# Agregar credenciales de Allstate si son necesarias
```

### 3. Probar Flujo Completo

#### Paso 1: Agregar Family Member
1. Ir a `/insurance-options`
2. Clic en "Add Member"
3. Completar formulario:
   - Nombre: Jane
   - Apellido: Doe
   - Relación: Spouse
   - Fecha de nacimiento: 1990-05-15
   - Género: Female
   - Smoker: No
4. Guardar

#### Paso 2: Seleccionar Plan
1. Ver planes disponibles
2. Clic en "Select this plan" en un plan de Allstate
3. Observar:
   - Loading spinner: "Calculating price..."
   - Toast: "Price updated for family coverage"
   - Badge: "2 applicants"

#### Paso 3: Checkout
1. Ir a `/checkout`
2. Verificar:
   - Badge en plan: "2 applicants"
   - Box en Summary: "Coverage Applicants: 2 people"
   - Mensaje: "Prices include coverage for 2 family members"

#### Paso 4: Enrollment
1. Clic en "Proceed to Application"
2. En Step 4 (Additional Applicants):
   - Verificar que Jane Doe aparece pre-cargada
   - Puede editar/eliminar según necesite
3. Completar enrollment

## Manejo de Errores

### Si Rate/Cart API Falla
- Se agrega plan con precio base
- Toast warning: "Using base price"
- Descripción: "Could not calculate multi-person pricing"

### Si No Hay insuranceFormData
- Se agrega plan con precio base
- Toast warning: "Missing user information"

### Si Solo Hay 1 Applicant
- No se llama a Rate/Cart
- Se usa precio base directo

### Si Plan No Es de Allstate
- No se llama a Rate/Cart
- Se usa precio base directo

## Notas Técnicas

### Cache
- Implementado cache simple en memoria
- TTL: 5 minutos
- Key: `${planId}-${primaryApplicant.birthDate}-${memberIds}`

### Applicant IDs
- Primary: `"primary-001"`
- Additional: `"additional-001"`, `"additional-002"`, etc.

### RLS Policies
- Usuarios solo ven/editan sus propios family members
- Implementadas políticas para: select, insert, update, delete

### Validaciones
- Campos requeridos: firstName, lastName, gender, dob, relationship
- SSN opcional (9 dígitos si se proporciona)
- Fecha de nacimiento no puede ser futura
- Weight/height opcionales

## Próximos Pasos (Opcionales)

1. **Mejoras de UI**:
   - Animaciones más fluidas
   - Skeleton loaders
   - Confirmación visual mejorada

2. **Optimizaciones**:
   - Batch Rate/Cart calls para múltiples planes
   - Redis para cache distribuido
   - WebSocket para actualizaciones en tiempo real

3. **Features Adicionales**:
   - Comparar precios antes/después de agregar members
   - Sugerencias de planes basadas en family composition
   - Historial de cotizaciones

## Soporte

Para problemas o preguntas:
1. Revisar logs del navegador (Console)
2. Revisar logs de Supabase
3. Verificar que la tabla family_members existe
4. Verificar que el endpoint Rate/Cart está accesible

## Changelog

### v1.0.0 (2025-11-15)
- ✅ Implementación inicial completa
- ✅ Tabla family_members
- ✅ CRUD API
- ✅ Componentes UI
- ✅ Integración Rate/Cart
- ✅ Pre-carga en enrollment
- ✅ Visualización en checkout

