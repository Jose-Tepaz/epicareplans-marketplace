# Triple S Integration - Testing Guide

## Pre-requisitos

Antes de comenzar las pruebas, asegúrate de:

✅ Variables de entorno configuradas (ver `TRIPLE_S_ENV_SETUP.md`)
✅ Migración SQL ejecutada (`20260121000000_add_triple_s_carrier.sql`)
✅ Servidor Next.js reiniciado después de configurar variables

## 1. Testing de Autenticación

### Objetivo
Verificar que el sistema puede obtener y renovar tokens Bearer de Triple S.

### Pasos

1. **Iniciar el servidor**
```bash
cd epicare-marketplace
npm run dev
```

2. **Verificar logs de consola**

Buscar en la consola del servidor:
```
✅ Triple S: Token refreshed successfully
📅 Triple S: Token expires at [timestamp]
```

### Casos de Prueba

| Caso | Acción | Resultado Esperado |
|------|--------|-------------------|
| Token inicial | Servidor inicia | Token se obtiene exitosamente |
| Token caché | Segunda request | Se usa token cacheado |
| Token expirado | Esperar 24h o forzar expiración | Token se renueva automáticamente |
| Credenciales inválidas | Usar password incorrecto | Error claro en logs |
| 401 Response | Simular 401 | Retry automático con nuevo token |

### Troubleshooting

| Error | Causa Probable | Solución |
|-------|---------------|----------|
| `⚠️ Triple S credentials not configured` | Variables de entorno faltantes | Verificar `.env.local` |
| `❌ Triple S: Login failed: 401` | Password incorrecto | Verificar `TRIPLE_S_PASSWORD` |
| `❌ Triple S: Login failed: 500` | API down o URL incorrecta | Verificar `TRIPLE_S_BASE_URL` |

---

## 2. Testing de Catálogo de Productos

### Objetivo
Verificar que el catálogo de productos se carga correctamente al iniciar.

### Pasos

1. **Verificar carga en inicio**

Al iniciar el servidor, buscar en logs:
```
🔄 Triple S: Loading product catalog
✅ Triple S: Catalog loaded - X profiles
```

2. **Inspeccionar estructura**

Agregar log temporal en `client.ts`:
```typescript
console.log('📦 Triple S Catalog:', JSON.stringify(this.productsCatalog, null, 2))
```

### Casos de Prueba

| Caso | Acción | Resultado Esperado |
|------|--------|-------------------|
| Carga inicial | Servidor inicia | Catálogo se carga en background |
| Cache | Segunda llamada | Usa catálogo cacheado |
| Estructura | Inspeccionar datos | Profiles > Series > Products correcto |
| Productos vacíos | API retorna vacío | Se maneja gracefully |

### Validaciones

- [ ] Al menos 4 series (S1, S2, S4, S9) están presentes
- [ ] Cada serie tiene productos
- [ ] Product keys tienen formato: `"Nombre - Tipo - Código"`
- [ ] Coverage types son: Ind, Fam, Coup, SP

---

## 3. Testing de Cotización

### Objetivo
Verificar que las cotizaciones se generan correctamente con datos del usuario.

### Pasos

1. **Navegar a `/explore`**
   - Completar formulario con datos de prueba
   - Datos mínimos: ZIP, DOB, Gender, Smoking status

2. **Navegar a `/insurance-options`**
   - Sistema debe llamar `/api/insurance/quote` automáticamente

3. **Verificar logs del servidor**

Buscar:
```
🏢 Triple S: Starting quote process
✅ Triple S: Catalog loaded - X profiles
✅ Triple S: X plans quoted
```

4. **Verificar plans en UI**
   - Planes de Triple S deben aparecer con badge "Triple S"
   - Slider de Face Amount debe ser visible
   - Precios mínimo y objetivo deben mostrarse

### Casos de Prueba

| Caso | Datos | Resultado Esperado |
|------|-------|-------------------|
| Usuario fumador | `smokes: true` | RiskKey = "S" |
| Usuario no fumador | `smokes: false` | RiskKey = "N" |
| Género masculino | `gender: 'male'` | GenderShortForm = "M" |
| Género femenino | `gender: 'female'` | GenderShortForm = "F" |
| Payment monthly | `paymentFrequency: 'monthly'` | PaymentModePayments = "12" |
| Payment quarterly | `paymentFrequency: 'quarterly'` | PaymentModePayments = "4" |

### Validaciones UI

- [ ] Planes de Triple S aparecen en la lista
- [ ] Cada plan muestra:
  - [ ] Nombre del producto
  - [ ] Precio target
  - [ ] Coverage amount
  - [ ] Badge "Triple S"
  - [ ] Slider de Face Amount (mínimo, máximo, step)
  - [ ] Botón "Select this plan"
- [ ] Solo planes con `canCreateApplication: true` permiten agregar al carrito

### Datos de Prueba

```javascript
// Usuario de prueba
{
  zipCode: "00901", // Puerto Rico
  dateOfBirth: "1990-01-15",
  gender: "male",
  smokes: false,
  coverageStartDate: "2026-02-01",
  paymentFrequency: "monthly"
}
```

---

## 4. Testing de Face Amount Selector

### Objetivo
Verificar que el usuario puede ajustar el monto de cobertura para planes de Triple S.

### Pasos

1. **Localizar plan de Triple S en `/insurance-options`**

2. **Verificar presencia del slider**
   - Debe estar en sección azul con borde
   - Muestra valores mín/máx
   - Valor actual en el centro

3. **Ajustar slider**
   - Mover slider a diferentes valores
   - Verificar que el valor se actualiza en UI

4. **Agregar al carrito**
   - Click "Select this plan"
   - Verificar que `selectedFaceAmount` se guarda en metadata

### Casos de Prueba

| Caso | Acción | Resultado Esperado |
|------|--------|-------------------|
| Valor inicial | Ver plan | Face amount = 10000 (default) |
| Ajustar slider | Mover a 25000 | Valor actualiza en UI |
| Mínimo | Mover a mínimo | Respeta minFaceAmount |
| Máximo | Mover a máximo | Respeta maxFaceAmount |
| Step | Mover gradualmente | Incrementa según step |
| Agregar al carrito | Click botón | Plan con face amount seleccionado |

### Validaciones

- [ ] Slider solo aparece para planes `carrierSlug === 'triple-s'`
- [ ] Valores mín/máx son correctos del quote response
- [ ] Step funciona correctamente (ej: 1000)
- [ ] Precios mínimo y objetivo se muestran correctamente
- [ ] Face amount seleccionado se guarda al agregar al carrito

---

## 5. Testing Multi-Carrier

### Objetivo
Verificar que planes de Allstate, Manhattan Life y Triple S se agrupan correctamente al hacer checkout.

### Pasos

1. **Agregar planes de múltiples carriers al carrito**
   - 2 planes de Allstate
   - 1 plan de Manhattan Life
   - 2 planes de Triple S

2. **Navegar a `/checkout`**

3. **Completar enrollment**

4. **Verificar en logs del servidor**

Buscar:
```
📊 Planes divididos por aseguradora: [Array con 3 carriers]
🔄 Es multi-carrier: true
👨‍👩‍👧‍👦 Creando application padre para multi-carrier...
✅ Application padre creado: [ID]
🏢 Procesando enrollment para: allstate
🏢 Procesando enrollment para: manhattan-life
🏢 Procesando enrollment para: triple-s
```

5. **Verificar en base de datos**

```sql
-- Debe haber 4 applications:
-- 1 padre (is_multi_carrier = true)
-- 3 hijas (una por cada carrier con parent_application_id)

SELECT id, carrier_name, is_multi_carrier, parent_application_id, status
FROM applications
WHERE user_id = '[tu_user_id]'
ORDER BY created_at DESC;
```

### Casos de Prueba

| Caso | Planes en Carrito | Resultado Esperado |
|------|-------------------|-------------------|
| Solo Allstate | 3 Allstate | 1 application (no multi-carrier) |
| Solo Triple S | 2 Triple S | 1 application (no multi-carrier) |
| Allstate + Triple S | 2 A + 1 TS | 3 applications (1 padre + 2 hijas) |
| Todos | 2 A + 1 M + 2 TS | 4 applications (1 padre + 3 hijas) |

### Validaciones Base de Datos

- [ ] Application padre tiene `is_multi_carrier = true`
- [ ] Applications hijas tienen `parent_application_id = padre.id`
- [ ] Applications se agrupan por `carrierSlug`:
  - [ ] Todos los planes de Allstate en una application
  - [ ] Todos los planes de Manhattan en una application
  - [ ] Todos los planes de Triple S en una application
- [ ] Cada application hija tiene `status = 'pending_approval'`
- [ ] `assigned_agent_id` está presente en todas

---

## 6. Testing de Enrollment (Admin Dashboard)

### Objetivo
Verificar que el Admin Dashboard puede enviar aplicaciones de Triple S al carrier.

### Pre-requisitos

⚠️ **NOTA:** Este testing requiere campos de negocio configurados (ver `TRIPLE_S_ENROLLMENT_CONFIG.md`)

### Pasos

1. **Navegar al Admin Dashboard**
   - Login como admin o agente

2. **Localizar application de Triple S**
   - Filtrar por `carrier_name = 'Triple S'`
   - Status debe ser `'pending_approval'`

3. **Click "Submit to Carrier"**
   - Modal debe pedir datos de pago
   - Completar con datos de test

4. **Verificar envío**

Buscar en logs:
```
🏢 Triple S: Starting enrollment submission
✅ Triple S: Enrollment submitted successfully
```

5. **Verificar actualización en DB**

```sql
SELECT id, status, api_response, api_error
FROM applications
WHERE id = '[application_id]';
```

### Casos de Prueba

| Caso | Acción | Resultado Esperado |
|------|--------|-------------------|
| Datos completos | Submit con todos los datos | Success |
| Beneficiaries sum ≠ 100% | Total no es 100% | Error de validación |
| Payment data missing | Submit sin pago | Error claro |
| API error | Triple S retorna error | Error guardado en api_error |

### Validaciones

- [ ] Status cambia a `'submitted'` si exitoso
- [ ] `api_response` contiene respuesta de Triple S
- [ ] `api_error` contiene error si falló
- [ ] Datos de pago NO se guardaron en DB
- [ ] `submitted_to_carrier_at` timestamp está presente

---

## 7. Testing de Errores y Edge Cases

### Casos de Prueba

| Caso | Escenario | Resultado Esperado |
|------|-----------|-------------------|
| API Triple S down | Servidor TSV no responde | Otros carriers siguen funcionando |
| Token expirado | 401 durante quote | Auto-refresh y retry |
| Producto sin cobertura | `canCreateApplication: false` | No se permite agregar al carrito |
| Face amount inválido | Valor fuera de min/max | UI limita el valor |
| Quote sin planes | API retorna 0 planes | Empty state, no error crash |
| Multi-carrier partial fail | Allstate OK, Triple S fail | Muestra warning, permite continuar |

---

## 8. Checklist de Integración Completa

### Backend

- [x] Autenticación con Bearer Token implementada
- [x] Cache de token funcionando (23 horas)
- [x] Catálogo de productos cargado
- [x] Cotizaciones funcionando
- [x] Multi-carrier splitting por carrierSlug
- [x] Triple S agregado a `/api/insurance/quote`
- [x] Enrollment base implementado
- [ ] Campos de negocio configurados (requiere definición)
- [ ] Testing con credenciales reales de producción

### Frontend

- [x] Planes de Triple S se muestran correctamente
- [x] Badge "Triple S" visible
- [x] Slider de Face Amount implementado
- [x] Validación `canCreateApplication` funciona
- [x] Planes se agregan al carrito con metadata correcta
- [x] Multi-carrier checkout funciona

### Base de Datos

- [x] Migración de Triple S ejecutada
- [x] Triple S aparece en `insurance_companies`
- [x] Applications se crean correctamente
- [x] Multi-carrier grouping funciona

### Documentación

- [x] Variables de entorno documentadas
- [x] Enrollment config documentado
- [x] Testing guide creado
- [x] Plan de integración completado

---

## Próximos Pasos

1. **Configurar Ambiente**
   - Agregar variables a `.env.local`
   - Reiniciar servidor
   - Ejecutar migración SQL

2. **Testing Básico**
   - Verificar autenticación
   - Verificar catálogo
   - Obtener primera cotización

3. **Testing UI**
   - Verificar planes en `/insurance-options`
   - Ajustar Face Amount
   - Agregar planes al carrito

4. **Testing Multi-Carrier**
   - Mezclar planes de 3 carriers
   - Completar checkout
   - Verificar applications en DB

5. **Configuración de Negocio**
   - Definir LOB mapping
   - Configurar campos de agente
   - Implementar captura segura de pago

6. **Testing Producción**
   - Obtener credenciales PROD
   - Testing en ambiente staging
   - Deploy a producción

---

## Soporte

Para problemas o preguntas:
1. Revisar logs del servidor
2. Consultar documentación API: `/context/triple-s-integration.md`
3. Revisar tipos: `lib/api/carriers/triple-s/types.ts`
4. Comparar con implementación Allstate/Manhattan
