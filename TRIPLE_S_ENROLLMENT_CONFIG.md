# Triple S Enrollment Configuration Guide

## Overview

El archivo `lib/api/carriers/triple-s/enrollment.ts` contiene la implementación básica para enviar aplicaciones a Triple S desde el Admin Dashboard. Sin embargo, **requiere configuración adicional** de campos de negocio antes de ser completamente funcional.

## Estado Actual

✅ **Implementado:**
- Estructura básica del request
- Autenticación con Bearer token
- Manejo de errores y responses
- Integración con `enrollmentCarriers`

⚠️ **Pendiente de Configuración:**
- Campos de negocio (LOB, insuredUWCLS, docTypeId, lifecycle)
- Mapeo completo de applicant data
- Mapeo de coapplicants/dependents
- Mapeo de beneficiaries
- Datos del seller (agent)
- Payment info (captura segura en submit)
- Policy data específico del producto
- Benefits desde quote response

## Campos Críticos que Requieren Definición

### 1. LOB (Line of Business)

**Ubicación:** `policy_data.lob`

**Valores Conocidos:**
- `"001 - VIDA"` - Para productos de vida
- `"002 - RIESGOS ESPECIALES"` - Para productos como Cáncer

**Acción Requerida:**
Definir mapeo completo según tipo de producto:

```typescript
function getLOB(productKey: string, seriesCode: string): string {
  // Mapear según product.key o series.code
  if (seriesCode === 'S1') {
    // Serie Tradicionales
    if (productKey.includes('Cáncer')) return '002 - RIESGOS ESPECIALES'
    if (productKey.includes('Funeral')) return '001 - VIDA'
    // ... más productos
  }
  // ... más series
  return '001 - VIDA' // Default
}
```

### 2. insuredUWCLS (Clasificación UW)

**Ubicación:** `applicant.insuredUWCLS`

**Descripción:** Clasificación de Underwriting del asegurado

**Acción Requerida:**
- Consultar con Marketing/Sales VP
- Definir clasificaciones posibles
- Crear lógica de asignación

**Posibles Valores:** (Pendiente confirmación)
- `"Standard"`
- `"Preferred"`
- `"Substandard"`
- etc.

### 3. docTypeId y lifecycle

**Ubicación:** 
- `policy_data.docTypeId`
- `policy_data.lifecycle`
- `onbasedata.docTypeId`
- `onbasedata.lifecycle`

**Descripción:** Identificadores para el sistema documental OnBase

**Valores del Plan:**
- `docTypeId: "1003"` (valor de ejemplo)
- `lifecycle: "203"` (valor de ejemplo)

**Acción Requerida:**
- Confirmar con IT de Triple S los valores correctos
- Pueden variar según tipo de producto

### 4. Seller (Agent) Fields

**Ubicación:** `seller` object

**Campos Requeridos:**
```typescript
{
  first_name: string
  middle_initial?: string
  last_name: string
  second_last_name?: string
  phone: string
  email: string
  representative_number: string // ⚠️ CRÍTICO
  agent_market_code?: string    // ⚠️ CRÍTICO
  agency_number: string          // ⚠️ CRÍTICO (mismo que tsv_AgencyNum)
}
```

**Acción Requerida:**
- Agregar estos campos a la tabla `agent_profiles` en Supabase
- Actualizar formulario de registro de agentes
- Obtener valores desde el perfil del agente asignado

### 5. Payment Information

**⚠️ SEGURIDAD CRÍTICA**

Los siguientes campos **NUNCA** deben guardarse en la base de datos:
- `routing_number`
- `account_number`
- `card_number`
- `expiration_month` / `expiration_year`
- `cvv`

**Flujo Correcto:**
1. Admin abre modal de "Submit to Carrier"
2. Modal muestra formulario seguro para capturar datos de pago
3. Datos se pasan directamente a `submitTripleSEnrollment`
4. API envía inmediatamente a Triple S
5. Datos se descartan después del envío

**Implementación Requerida:**
```typescript
// En Admin Dashboard
<PaymentCaptureModal
  onSubmit={(paymentData) => {
    // Enviar inmediatamente a Triple S
    submitEnrollmentToCarrier('triple-s', {
      ...enrollmentData,
      paymentData // No persistir
    })
  }}
/>
```

## Mapeo de Datos

### De `applications` table a Triple S Request

```typescript
// Applicant
{
  first_name: application.demographics.applicants[0].firstName,
  last_name: application.demographics.applicants[0].lastName,
  birth_date: application.demographics.applicants[0].dob,
  gender: application.demographics.applicants[0].gender === 'Male' ? 'M' : 'F',
  ssn: decrypt(application.demographics.applicants[0].ssn), // DESENCRIPTAR
  email: application.demographics.email,
  telephone: application.demographics.phone,
  // ... direcciones, peso, altura, etc.
}

// Coapplicants (de dependents)
coapplicants: application.enrollment_data.dependents?.map(dep => ({
  first_name: dep.firstName,
  last_name: dep.lastName,
  birth_date: dep.dateOfBirth,
  relationship: dep.relationship, // "Spouse", "Child", etc.
  gender: dep.gender === 'Male' ? 'M' : 'F',
  ssn: decrypt(dep.ssn)
}))

// Beneficiaries
beneficiaries: application.beneficiaries.map(ben => ({
  first_name: ben.first_name,
  last_name: ben.last_name,
  birth_date: ben.date_of_birth,
  relationship: ben.relationship,
  percentage: ben.allocation_percentage // Debe sumar 100%
}))

// Benefits (del quote response guardado en coverage.metadata)
benefits: application.coverages.map(coverage => ({
  prem: coverage.monthly_premium,
  plan_Code: coverage.metadata.planCode,
  units: 1,
  benefit_amout: coverage.metadata.faceAmount
}))
```

## Próximos Pasos

### 1. Reunión con Negocio
- [ ] Definir LOB mapping con equipo de producto
- [ ] Definir insuredUWCLS con Marketing/Sales VP
- [ ] Confirmar flujo de captura de pagos

### 2. Confirmación con Triple S IT
- [ ] Confirmar docTypeId y lifecycle values
- [ ] Confirmar estructura de OnBase data
- [ ] Solicitar credenciales de producción

### 3. Actualizaciones de Base de Datos
- [ ] Agregar campos de agente (representative_number, etc.) a agent_profiles
- [ ] Crear tabla/estructura para guardar quote responses completos
- [ ] Agregar second_last_name a formularios si es necesario

### 4. Implementación en Admin Dashboard
- [ ] Crear modal seguro de captura de pago
- [ ] Integrar botón "Submit to Triple S"
- [ ] Mostrar status y response de Triple S
- [ ] Manejar errores y reintentos

### 5. Testing
- [ ] Probar con datos de test en ambiente QA
- [ ] Validar todos los campos requeridos
- [ ] Verificar que datos sensibles NO se guarden
- [ ] Probar casos de error (beneficiaries no suman 100%, etc.)

## Recursos

- **Documentación API:** `/context/triple-s-integration.md`
- **Estructura Base:** `lib/api/carriers/triple-s/enrollment.ts`
- **Tipos:** `lib/api/carriers/triple-s/types.ts`
- **Ejemplo Allstate:** `lib/api/carriers/allstate/enrollment.ts`
