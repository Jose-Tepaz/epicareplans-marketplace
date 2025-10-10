# 📋 Documentación API All State - Epicare Marketplace

## 🎯 Resumen

Esta documentación describe la integración completa con la API de All State para obtener cotizaciones de seguros de vida y accidentes en el marketplace Epicare.

## 🔧 Configuración

### Variables de Entorno (.env.local)
```bash
ALLSTATE_API_URL=https://qa1-ngahservices.ngic.com/QuotingAPI/api/v1/Rate/AllPlans
ALLSTATE_AUTH_TOKEN=VGVzdFVzZXI6VGVzdDEyMzQ=
ALLSTATE_AGENT_ID=159208
```

### Endpoint
- **URL**: `https://qa1-ngahservices.ngic.com/QuotingAPI/api/v1/Rate/AllPlans`
- **Método**: `POST`
- **Content-Type**: `application/json`
- **Authorization**: `Basic VGVzdFVzZXI6VGVzdDEyMzQ=`

## 📤 Formato de Request

### Estructura Completa
```json
{
  "PlansToRate": null,
  "ExcludeAvailablePlans": false,
  "agentId": "159208",
  "effectiveDate": "2025-11-25T00:00:00.000Z",
  "zipCode": "07008",
  "applicants": [
    {
      "birthDate": "1994-08-25T00:00:00.000Z",
      "gender": "Male",
      "relationshipType": "Primary",
      "isSmoker": false
    }
  ],
  "paymentFrequency": "Monthly",
  "productTypes": ["NHICSupplemental"]
}
```

### Descripción de Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `PlansToRate` | null | Sí | Siempre null para obtener todos los planes |
| `ExcludeAvailablePlans` | boolean | Sí | false para incluir planes disponibles |
| `agentId` | string | Sí | ID del agente (159208) |
| `effectiveDate` | string | Sí | Fecha de inicio de cobertura (ISO 8601) |
| `zipCode` | string | Sí | Código postal del solicitante |
| `applicants` | array | Sí | Array de solicitantes |
| `paymentFrequency` | string | Sí | Frecuencia de pago (Monthly, Quarterly, etc.) |
| `productTypes` | array | Sí | Tipos de productos (["NHICSupplemental"]) |

### Estructura de Applicant
```json
{
  "birthDate": "1994-08-25T00:00:00.000Z",
  "gender": "Male",
  "relationshipType": "Primary",
  "isSmoker": false
}
```

| Campo | Tipo | Valores | Descripción |
|-------|------|---------|-------------|
| `birthDate` | string | ISO 8601 | Fecha de nacimiento |
| `gender` | string | "Male", "Female" | Género del solicitante |
| `relationshipType` | string | "Primary" | Tipo de relación (siempre Primary) |
| `isSmoker` | boolean | true, false | Si es fumador |

## 📥 Formato de Response

### Estructura de la Respuesta
**IMPORTANTE**: La API devuelve un **ARRAY directamente**, no un objeto con propiedades.

```json
[
  {
    "id": "2144",
    "enrollerId": "159208",
    "productCode": "21673",
    "planType": "NICAFB",
    "productType": "NHICSupplemental",
    "planName": "Accident Fixed-Benefit",
    "activeThruDate": "2999-12-31T00:00:00",
    "applicationType": "Individual",
    "issueType": "Standard",
    "productSubCode": 2144,
    "planKey": "Accident Fixed-Benefit",
    "paymentFrequency": "Monthly",
    "discounts": [],
    "familyComposition": "Member",
    "isAMERider": false,
    "hasDentalDiscountCard": false,
    "coverageEffectiveDate": "2025-10-24T00:00:00Z",
    "coverageTerminationDate": null,
    "coverageEnrolledDate": "0001-01-01T00:00:00",
    "insuranceNetwork": "Undefined",
    "baseProducts": ["AccidentFixedBenefit_I"],
    "baseProductName": null,
    "pathToBrochure": "https://allstatehealth.canto.com/direct/document/...",
    "stmRenewalTerms": null,
    "stmRenewalRateLock": null,
    "insuranceRate": 25.15,
    "standardTierInsuranceRate": 25.15,
    "rate": 0,
    "standardTierRate": 0,
    "totalRate": 0,
    "standardTierTotalRate": 0,
    "rateExcludingMultiProductDiscounts": 0,
    "providerLink": "",
    "benefits": [
      {
        "name": "One Time Enrollment Fee",
        "value": 0,
        "premium": 0,
        "which": "EnrollmentFee",
        "formattedValue": "$0.00"
      },
      {
        "name": "LIFE Association Membership",
        "value": 0,
        "premium": 0,
        "which": "AssociationFee",
        "formattedValue": "$0.00"
      }
    ],
    "benefitDescription": "$25,000/$50,000 Benefit",
    "numberOfDays": 0,
    "additionalCoverages": [],
    "memberRates": [
      {
        "memberId": "1",
        "rate": 25.15,
        "standardTierRate": 25.15
      }
    ],
    "riders": [],
    "isDiscounted": false,
    "productSourceDetail": null,
    "valid": true,
    "enrollmentFeeNumber": 0,
    "productRateComponents": [
      {
        "name": "AccidentFixedBenefit_Primary_Year1",
        "rate": 25.15
      }
    ],
    "applicants": [],
    "waiveFee": false,
    "isSeniorPlan": false,
    "carrierName": null
  }
]
```

### Campos Importantes de la Respuesta

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `id` | ID único del plan | "2144" |
| `planName` | Nombre del plan | "Accident Fixed-Benefit" |
| `insuranceRate` | Precio mensual | 25.15 |
| `benefitDescription` | Descripción de beneficios | "$25,000/$50,000 Benefit" |
| `planType` | Tipo de plan | "NICAFB", "NHICLifeOnly" |
| `pathToBrochure` | URL del brochure | "https://allstatehealth.canto.com/..." |
| `benefits` | Array de beneficios | Ver estructura arriba |

## 🔄 Mapeo de Datos

### Del Formulario a All State
```typescript
// Formulario → All State
const request = {
  PlansToRate: null,
  ExcludeAvailablePlans: false,
  agentId: "159208",
  effectiveDate: new Date(formData.coverageStartDate).toISOString(),
  zipCode: formData.zipCode,
  applicants: [{
    birthDate: new Date(formData.dateOfBirth).toISOString(),
    gender: formData.gender === 'male' ? 'Male' : 'Female',
    relationshipType: 'Primary',
    isSmoker: formData.smokes
  }],
  paymentFrequency: formData.paymentFrequency === 'monthly' ? 'Monthly' : 'Quarterly',
  productTypes: ['NHICSupplemental']
};
```

### De All State al Frontend
```typescript
// All State → Frontend
const mappedPlan = {
  id: plan.id,
  name: plan.planName,
  price: plan.insuranceRate,
  coverage: plan.benefitDescription,
  productType: plan.productType,
  benefits: plan.benefits?.map(b => b.name) || [],
  allState: true,
  planType: plan.planType,
  benefitDescription: plan.benefitDescription,
  brochureUrl: plan.pathToBrochure,
  carrierName: plan.carrierName
};
```

## 🧪 Testing

### Comando cURL
```bash
curl -X POST https://qa1-ngahservices.ngic.com/QuotingAPI/api/v1/Rate/AllPlans \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic VGVzdFVzZXI6VGVzdDEyMzQ=" \
  -d '{
    "PlansToRate": null,
    "ExcludeAvailablePlans": false,
    "agentId": "159208",
    "effectiveDate": "2025-11-25T00:00:00.000Z",
    "zipCode": "07008",
    "applicants": [
      {
        "birthDate": "1994-08-25T00:00:00.000Z",
        "gender": "Male",
        "relationshipType": "Primary",
        "isSmoker": false
      }
    ],
    "paymentFrequency": "Monthly",
    "productTypes": ["NHICSupplemental"]
  }'
```

### Testing Local
```bash
curl -X POST http://localhost:3000/api/insurance/quote \
  -H "Content-Type: application/json" \
  -d '{
    "zipCode": "07008",
    "dateOfBirth": "1994-08-25",
    "gender": "male",
    "smokes": false,
    "coverageStartDate": "2025-11-25",
    "paymentFrequency": "monthly"
  }'
```

## 📊 Tipos de Planes Disponibles

### Seguros de Vida (NHICLifeOnly)
- **Life20000**: $20,000 - $9.05/mes
- **Life25000**: $25,000 - $10.31/mes
- **Life30000**: $30,000 - $11.58/mes
- **Life50000**: $50,000 - $16.63/mes
- **Life75000**: $75,000 - $22.94/mes
- **Life100000**: $100,000 - $29.25/mes
- **Life125000**: $125,000 - $35.56/mes
- **Life150000**: $150,000 - $41.88/mes

### Seguros de Accidentes (NICAFB)
- **Accident Fixed-Benefit**: $25,000/$50,000 - $25.15/mes

## ⚠️ Consideraciones Importantes

### 1. Formato de Respuesta
- **CRÍTICO**: La API devuelve un array directamente, NO un objeto con `availablePlans` o `ratedPlans`
- Usar: `Array.isArray(data) ? data : []`

### 2. Fechas
- Todas las fechas deben estar en formato ISO 8601
- `effectiveDate` debe ser futura
- `birthDate` debe ser pasada

### 3. Parámetros que Funcionan
- **ZIP Code**: 07008 (New Jersey)
- **Género**: Male/Female
- **Fumador**: true/false (afecta precios)
- **Frecuencia**: Monthly, Quarterly, Semi-Annually, Annually

### 4. Tiempo de Respuesta
- Típicamente 1-3 segundos
- Máximo 60 segundos timeout configurado

## 🐛 Troubleshooting

### Problema: Array vacío en respuesta
**Causa**: Parámetros específicos no tienen planes disponibles
**Solución**: Probar con diferentes combinaciones de ZIP, edad, fumador

### Problema: Error 400 - Fecha inválida
**Causa**: `effectiveDate` en el pasado
**Solución**: Usar fecha futura (ej: 1 mes adelante)

### Problema: Timeout
**Causa**: API lenta o problemas de red
**Solución**: Verificar conectividad, aumentar timeout

### Problema: Múltiples instancias Next.js
**Causa**: Varios `npm run dev` corriendo
**Solución**: 
```bash
pkill -f "next dev"
npm run dev
```

## 📁 Archivos Relacionados

- `/app/api/insurance/quote/route.ts` - API Route handler
- `/lib/types/insurance.ts` - TypeScript interfaces
- `/app/explore/page.tsx` - Formulario multipasos
- `/app/insurance-options/page.tsx` - Página de resultados
- `/INTEGRATION_NOTES.md` - Notas de integración

## 🔗 Referencias

- **Ambiente**: QA1 (Desarrollo)
- **Documentación All State**: Pendiente de recibir
- **Soporte**: Contactar equipo All State para QA

---

**Última actualización**: Octubre 2024
**Versión**: 1.0
**Estado**: ✅ Funcionando
