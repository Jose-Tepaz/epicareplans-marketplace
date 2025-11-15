## 📋 Información General

**Base URL**: `https://api.manhattanlife.com/EnrollmentService.QA`

**Ambiente**: QA/Testing

**Autenticación**: Bearer Token (OAuth 2.0)

---

## 📤 Endpoint: Enviar/Crear Enrollment (Aplicación de Seguro)

### **Request**

```
POST /api/v2/enrollment/submit

```

**URL Completa**:

```
https://api.manhattanlife.com/EnrollmentService.QA/api/v2/enrollment/submit

```

### **Descripción**

Este es el endpoint **más crítico** de la integración. Envía toda la información recopilada durante el flujo de enrollment para crear oficialmente la aplicación de seguro. Una vez procesado:

- Se genera un **enrollmentId** único
- La aplicación se envía para procesamiento downstream
- Se genera documentación PDF del aplicante
- Se calcula la prima total final

**IMPORTANTE**: Este endpoint marca la **creación oficial** de la póliza. Asegúrate de tener **toda** la información validada antes de llamarlo.

### **Headers**

| Header | Valor | Requerido |
| --- | --- | --- |
| `Authorization` | `Bearer {access_token}` | ✅ Sí |
| `Content-Type` | `application/json` | ✅ Sí |

### **Body Parameters**

**Type**: JSON Object (estructura compleja)

---

## 📊 Request Body Structure (Detallado)

### **Root Level**

| Campo | Tipo | Descripción | Requerido |
| --- | --- | --- | --- |
| `isNew` | boolean | `true` para nueva aplicación, `false` para modificación | ✅ Sí |
| `applicant` | object | Información del aplicante principal | ✅ Sí |
| `dependents` | array[object] | Dependientes (cónyuge, hijos) | ⚠️ Condicional |
| `payment` | object | Información de pago | ✅ Sí |
| `agents` | object | Información de agentes y splits de comisión | ✅ Sí |
| `plan` | object | Detalles del plan seleccionado | ✅ Sí |
| `sourceRefId` | string | ID de referencia externo (tu sistema) | ⚠️ Recomendado |
| `authorization` | object | Información de firma y autorización | ✅ Sí |
| `employment` | object | Información laboral del aplicante | ⚠️ Condicional |
| `addresses` | array[object] | Direcciones (residencial, mailing) | ✅ Sí |
| `mailToPolicy` | object | Preferencias de envío de póliza | ✅ Sí |
| `policyOwner` | object | Dueño de la póliza (si diferente al asegurado) | ⚠️ Condicional |
| `physician` | object | Información del médico principal | ⚠️ Condicional |
| `beneficiaries` | array[object] | Beneficiarios de la póliza | ✅ Sí |
| `qualifyingQuestionAnswers` | array[object] | Respuestas del cuestionario de salud | ⚠️ Condicional |

---

## 🧑 Applicant Object (Información del Aplicante)

```json
{
  "applicant": {
    "firstName": "John",
    "middleName": "Michael",
    "lastName": "Doe",
    "ssn": "123456789",
    "dateOfBirth": "1985-05-15T00:00:00.000Z",
    "gender": "Male",
    "maritalStatus": "Married",
    "height": 70,
    "weight": 180,
    "isTobaccoUser": false,
    "emailConsent": true,
    "primaryEmail": "john.doe@email.com",
    "secondaryEmail": null,
    "phoneNumber": "555-123-4567",
    "secondaryPhoneNumber": null,
    "typeOfBusiness": "Technology",
    "questions": [
      {
        "questionnaireId": 100,
        "answer": "No",
        "questions": []
      }
    ],
    "existingConditions": []
  }
}

```

### **Applicant Fields**

| Campo | Tipo | Descripción | Formato/Valores | Requerido |
| --- | --- | --- | --- | --- |
| `firstName` | string | Nombre | Max 50 chars | ✅ Sí |
| `middleName` | string | Segundo nombre | Max 50 chars | ⚠️ Opcional |
| `lastName` | string | Apellido | Max 50 chars | ✅ Sí |
| `ssn` | string | Social Security Number | 9 dígitos sin guiones | ✅ Sí |
| `dateOfBirth` | string | Fecha de nacimiento | ISO 8601 | ✅ Sí |
| `gender` | string | Género | `"Male"`, `"Female"` | ✅ Sí |
| `maritalStatus` | string | Estado civil | `"Single"`, `"Married"`, `"Divorced"`, `"Widowed"` | ✅ Sí |
| `height` | integer | Altura en pulgadas | 48-96 | ✅ Sí |
| `weight` | integer | Peso en libras | 80-500 | ✅ Sí |
| `isTobaccoUser` | boolean | Usuario de tabaco | `true`/`false` | ✅ Sí |
| `emailConsent` | boolean | Consentimiento para email | `true`/`false` | ✅ Sí |
| `primaryEmail` | string | Email principal | Formato válido | ⚠️ Si emailConsent=true |
| `secondaryEmail` | string | Email secundario | Formato válido | ⚠️ Opcional |
| `phoneNumber` | string | Teléfono principal | Formato: XXX-XXX-XXXX | ✅ Sí |
| `secondaryPhoneNumber` | string | Teléfono secundario | Formato: XXX-XXX-XXXX | ⚠️ Opcional |
| `typeOfBusiness` | string | Tipo de negocio/industria | Max 100 chars | ⚠️ Condicional |
| `questions` | array[object] | Respuestas del cuestionario | Ver estructura abajo | ⚠️ Condicional |
| `existingConditions` | array[object] | Condiciones médicas existentes | Ver estructura abajo | ⚠️ Condicional |

### **Questions Structure**

```json
{
  "questionnaireId": 100,
  "answer": "No",
  "questions": []  // Preguntas anidadas (si hay condicionales)
}

```

### **Existing Conditions Structure**

```json
{
  "questionnaireId": 110,
  "conditionCode": "DIABETES",
  "diagnosis": "Type 2 Diabetes",
  "treatmentResults": "Under control with medication",
  "dates": "2020-01-15",
  "lastName": "Smith",
  "firstName": "Dr. John",
  "phoneNumber": "555-987-6543",
  "address": {
    "address1": "123 Medical Blvd",
    "address2": "Suite 200",
    "city": "Houston",
    "stateCode": "TX",
    "zipCode": "77001",
    "address1And2": "123 Medical Blvd, Suite 200"
  }
}

```

---

## 👨‍👩‍👧‍👦 Dependents Array

```json
{
  "dependents": [
    {
      "index": 0,
      "relationshipType": "Spouse",
      "otherRelationship": null,
      "firstName": "Jane",
      "middleName": null,
      "lastName": "Doe",
      "gender": "Female",
      "ssn": "987654321",
      "birthDate": "1987-08-20T00:00:00.000Z",
      "height": 65,
      "weight": 140,
      "isTobaccoUser": false,
      "status": null,
      "disabledReason": null,
      "questions": []
    }
  ]
}

```

### **Dependent Fields**

| Campo | Tipo | Descripción | Valores | Requerido |
| --- | --- | --- | --- | --- |
| `index` | integer | Índice del dependiente (0, 1, 2...) | 0+ | ✅ Sí |
| `relationshipType` | string | Relación con el aplicante | `"Spouse"`, `"Child"`, `"Other"` | ✅ Sí |
| `otherRelationship` | string | Especificar si es "Other" | Max 50 chars | ⚠️ Si relationshipType="Other" |
| `firstName` | string | Nombre | Max 50 chars | ✅ Sí |
| `middleName` | string | Segundo nombre | Max 50 chars | ⚠️ Opcional |
| `lastName` | string | Apellido | Max 50 chars | ✅ Sí |
| `gender` | string | Género | `"Male"`, `"Female"` | ✅ Sí |
| `ssn` | string | SSN | 9 dígitos | ✅ Sí |
| `birthDate` | string | Fecha de nacimiento | ISO 8601 | ✅ Sí |
| `height` | integer | Altura en pulgadas | 48-96 | ⚠️ Condicional |
| `weight` | integer | Peso en libras | 80-500 | ⚠️ Condicional |
| `isTobaccoUser` | boolean | Usuario de tabaco | `true`/`false` | ⚠️ Condicional |
| `status` | string | Estado (para hijos) | `"FullTimeStudent"`, `"Disabled"` | ⚠️ Si aplica |
| `disabledReason` | string | Razón de discapacidad | Max 200 chars | ⚠️ Si status="Disabled" |
| `questions` | array[object] | Cuestionario del dependiente | Igual que applicant | ⚠️ Condicional |

---

## 💳 Payment Object

```json
{
  "payment": {
    "isPrimary": true,
    "paymentType": "EFT",
    "eftDetails": {
      "billFrequency": "Monthly",
      "bankAccountType": "Checking",
      "bankName": "Chase Bank",
      "bankCustomerName": "John Doe",
      "bankAccountName": "John Doe Checking",
      "bankAccountNumber": "1234567890",
      "bankRoutingNumber": "021000021",
      "bankRoutingChkDigit": 1,
      "bankCity": "Houston",
      "bankStateCode": "TX",
      "bankAddress1": "123 Bank St",
      "bankAddress2": null,
      "bankZipCode": "77001",
      "bankDraftDay": 1,
      "bankFirstDraftDate": "2025-12-01T00:00:00.000Z"
    }
  }
}

```

### **Payment Fields**

| Campo | Tipo | Descripción | Valores | Requerido |
| --- | --- | --- | --- | --- |
| `isPrimary` | boolean | ¿Es método de pago principal? | `true`/`false` | ✅ Sí |
| `paymentType` | string | Tipo de pago | `"EFT"`, `"Payroll"`, `"DirectBill"` | ✅ Sí |
| `eftDetails` | object | Detalles de EFT | Ver abajo | ⚠️ Si paymentType="EFT" |
| `payrollDetails` | object | Detalles de payroll | - | ⚠️ Si paymentType="Payroll" |
| `directBillDetails` | object | Detalles de facturación directa | - | ⚠️ Si paymentType="DirectBill" |

### **EFT Details**

| Campo | Tipo | Descripción | Formato | Requerido |
| --- | --- | --- | --- | --- |
| `billFrequency` | string | Frecuencia de cobro | `"Monthly"`, `"Quarterly"`, `"SemiAnnual"`, `"Annual"` | ✅ Sí |
| `bankAccountType` | string | Tipo de cuenta | `"Checking"`, `"Savings"` | ✅ Sí |
| `bankName` | string | Nombre del banco | Max 100 chars | ✅ Sí |
| `bankCustomerName` | string | Nombre del titular | Max 100 chars | ✅ Sí |
| `bankAccountName` | string | Nombre de la cuenta | Max 100 chars | ✅ Sí |
| `bankAccountNumber` | string | Número de cuenta | 4-17 dígitos | ✅ Sí |
| `bankRoutingNumber` | string | Routing number | 9 dígitos | ✅ Sí |
| `bankRoutingChkDigit` | integer | Dígito de verificación | 0-9 | ⚠️ Opcional |
| `bankCity` | string | Ciudad del banco | Max 50 chars | ✅ Sí |
| `bankStateCode` | string | Estado del banco | 2 letras | ✅ Sí |
| `bankAddress1` | string | Dirección 1 | Max 100 chars | ✅ Sí |
| `bankAddress2` | string | Dirección 2 | Max 100 chars | ⚠️ Opcional |
| `bankZipCode` | string | Código postal | 5 o 9 dígitos | ✅ Sí |
| `bankDraftDay` | integer | Día del mes para débito | 1-28 | ✅ Sí |
| `bankFirstDraftDate` | string | Fecha del primer débito | ISO 8601 | ✅ Sí |

---

## 👔 Agents Object

```json
{
  "agents": {
    "agentSplits": [
      {
        "isSigningAgent": true,
        "agentNumber": "99999990000",
        "splitPercentAmount": 100
      }
    ],
    "questions": []
  }
}

```

### **Agent Fields**

| Campo | Tipo | Descripción | Valores | Requerido |
| --- | --- | --- | --- | --- |
| `agentSplits` | array[object] | Distribución de comisiones entre agentes | Ver abajo | ✅ Sí |
| `questions` | array[object] | Preguntas específicas del agente | Igual formato que applicant | ⚠️ Opcional |

### **Agent Split**

| Campo | Tipo | Descripción | Valores | Requerido |
| --- | --- | --- | --- | --- |
| `isSigningAgent` | boolean | ¿Es el agente que firma? | `true`/`false` | ✅ Sí |
| `agentNumber` | string | Número de agente Manhattan Life | 11 dígitos | ✅ Sí |
| `splitPercentAmount` | integer | Porcentaje de comisión | 0-100 | ✅ Sí |

**IMPORTANTE**:

- La suma de todos los `splitPercentAmount` debe ser **100**
- Al menos un agente debe tener `isSigningAgent: true`

---

## 📋 Plan Object

```json
{
  "plan": {
    "productName": "Cancer Care Plus",
    "planName": "PLAN A",
    "planCode": "CP4000TX04A",
    "planUnitStateCodeId": 22540,
    "coverageCode": "Individual",
    "effectiveDate": "2025-12-01T00:00:00.000Z",
    "premium": 50.00,
    "coverageAmount": null,
    "unit": 1,
    "unitCode": "PLAN_A",
    "situsState": "TX",
    "occupation": null,
    "benefitPeriod": null,
    "eliminationPeriod": null,
    "riders": [
      {
        "riderUnitStateId": 4093,
        "planCode": "CCBR4000",
        "premium": 15.00,
        "coverageAmount": null,
        "unit": 1,
        "unitCode": "CCR"
      }
    ]
  }
}

```

### **Plan Fields**

| Campo | Tipo | Descripción | Requerido |
| --- | --- | --- | --- |
| `productName` | string | Nombre del producto | ✅ Sí |
| `planName` | string | Nombre del plan | ✅ Sí |
| `planCode` | string | Código del plan | ✅ Sí |
| `planUnitStateCodeId` | integer | **ID único del plan** (del endpoint producthierarchy) | ✅ Sí |
| `coverageCode` | string | Tipo de cobertura | ✅ Sí |
| `effectiveDate` | string | Fecha efectiva de la póliza | ✅ Sí |
| `premium` | decimal | Prima mensual del plan base | ✅ Sí |
| `coverageAmount` | decimal/null | Monto de cobertura | ⚠️ Condicional |
| `unit` | integer | Unidades del plan | ✅ Sí |
| `unitCode` | string | Código de unidad | ✅ Sí |
| `situsState` | string | Estado situs (2 letras) | ✅ Sí |
| `occupation` | string | Ocupación (para algunos planes) | ⚠️ Condicional |
| `benefitPeriod` | string | Período de beneficio | ⚠️ Condicional |
| `eliminationPeriod` | string | Período de eliminación | ⚠️ Condicional |
| `riders` | array[object] | Riders seleccionados | ⚠️ Opcional |

### **Coverage Code Values**

| Valor | Descripción |
| --- | --- |
| `"Individual"` | Solo aplicante |
| `"IndividualSpouse"` | Aplicante + cónyuge |
| `"IndividualChildren"` | Aplicante + hijos |
| `"Family"` | Aplicante + cónyuge + hijos |

### **Rider Object**

| Campo | Tipo | Descripción | Requerido |
| --- | --- | --- | --- |
| `riderUnitStateId` | integer | **ID único del rider** (del endpoint producthierarchy) | ✅ Sí |
| `planCode` | string | Código del rider | ✅ Sí |
| `premium` | decimal | Prima adicional del rider | ✅ Sí |
| `coverageAmount` | decimal/null | Monto de cobertura del rider | ⚠️ Opcional |
| `unit` | integer | Unidades | ✅ Sí |
| `unitCode` | string | Código de unidad | ✅ Sí |

---

## ✍️ Authorization Object

```json
{
  "authorization": {
    "signDate": "2025-11-10T14:30:00.000Z",
    "signCity": "Houston",
    "signState": "Texas",
    "signeeMothersMaidenName": null,
    "signeeOtherThanApplicant": null,
    "spouseSignature": "Jane Doe",
    "specialRequest": null
  }
}

```

### **Authorization Fields**

| Campo | Tipo | Descripción | Requerido |
| --- | --- | --- | --- |
| `signDate` | string | Fecha/hora de firma | ✅ Sí |
| `signCity` | string | Ciudad donde se firmó | ✅ Sí |
| `signState` | string | Estado donde se firmó | ✅ Sí |
| `signeeMothersMaidenName` | string | Apellido de soltera de la madre (para verificación) | ⚠️ Condicional |
| `signeeOtherThanApplicant` | string | Nombre si firma alguien más | ⚠️ Condicional |
| `spouseSignature` | string | Firma del cónyuge | ⚠️ Si coverageCode incluye cónyuge |
| `specialRequest` | string | Solicitudes especiales | ⚠️ Opcional |

---

## 🏠 Addresses Array

```json
{
  "addresses": [
    {
      "addressType": "Primary",
      "county": "Harris",
      "address1": "123 Main St",
      "address2": "Apt 4B",
      "city": "Houston",
      "stateCode": "TX",
      "zipCode": "77001",
      "address1And2": "123 Main St, Apt 4B"
    }
  ]
}

```

### **Address Fields**

| Campo | Tipo | Descripción | Valores | Requerido |
| --- | --- | --- | --- | --- |
| `addressType` | string | Tipo de dirección | `"Primary"`, `"Mailing"`, `"Secondary"` | ✅ Sí |
| `county` | string | Condado | Max 50 chars | ⚠️ Opcional |
| `address1` | string | Dirección línea 1 | Max 100 chars | ✅ Sí |
| `address2` | string | Dirección línea 2 | Max 100 chars | ⚠️ Opcional |
| `city` | string | Ciudad | Max 50 chars | ✅ Sí |
| `stateCode` | string | Código de estado | 2 letras | ✅ Sí |
| `zipCode` | string | Código postal | 5 o 9 dígitos | ✅ Sí |
| `address1And2` | string | Dirección completa concatenada | Automático | ⚠️ Opcional |

---

## 👨‍⚕️ Beneficiaries Array

```json
{
  "beneficiaries": [
    {
      "firstName": "Mary",
      "middleName": "Ann",
      "lastName": "Doe",
      "ssn": "111223333",
      "birthDate": "1990-03-10T00:00:00.000Z",
      "beneficiaryType": "Primary",
      "relationshipType": "Child",
      "allocationAmount": 100
    }
  ]
}

```

### **Beneficiary Fields**

| Campo | Tipo | Descripción | Valores | Requerido |
| --- | --- | --- | --- | --- |
| `firstName` | string | Nombre | Max 50 chars | ✅ Sí |
| `middleName` | string | Segundo nombre | Max 50 chars | ⚠️ Opcional |
| `lastName` | string | Apellido | Max 50 chars | ✅ Sí |
| `ssn` | string | SSN | 9 dígitos | ⚠️ Recomendado |
| `birthDate` | string | Fecha de nacimiento | ISO 8601 | ✅ Sí |
| `beneficiaryType` | string | Tipo de beneficiario | `"Primary"`, `"Contingent"` | ✅ Sí |
| `relationshipType` | string | Relación | `"Spouse"`, `"Child"`, `"Parent"`, `"Sibling"`, `"Other"` | ✅ Sí |
| `allocationAmount` | integer | Porcentaje de beneficio | 0-100 | ✅ Sí |

**IMPORTANTE**: La suma de `allocationAmount` para todos los beneficiarios primarios debe ser **100**.

---

## 📥 Response

### **Success Response**

**Status Code**: `200 OK`

```json
{
  "sourceRefId": "APP-2025-001234",
  "planUnitStateCodeId": 22540,
  "enrollmentId": 987654,
  "status": "Submitted",
  "applicantDocumentURL": "https://api.manhattanlife.com/documents/987654/application.pdf",
  "totalPremium": 75.00
}

```

### **Response Fields**

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `sourceRefId` | string | Tu ID de referencia (el que enviaste en el request) |
| `planUnitStateCodeId` | integer | ID del plan procesado |
| `enrollmentId` | integer | **ID único de enrollment en Manhattan Life** (crítico para tracking) |
| `status` | string | Estado de la aplicación |
| `applicantDocumentURL` | string | URL para descargar el PDF de la aplicación |
| `totalPremium` | decimal | Prima mensual total (plan + riders) |

### **Status Values**

| Status | Descripción |
| --- | --- |
| `"Submitted"` | Aplicación enviada exitosamente |
| `"Pending"` | En proceso de revisión |
| `"Approved"` | Aprobada (raro en respuesta inmediata) |
| `"Declined"` | Rechazada |
| `"MoreInfoNeeded"` | Requiere información adicional |

---

---

## 🎯 Campos Opcionales vs Condicionales

### **Siempre Requeridos**

- ✅ `applicant` (firstName, lastName, ssn, dateOfBirth, gender, etc.)
- ✅ `plan` (planUnitStateCodeId, productName, planName, premium, etc.)
- ✅ `payment` (paymentType + detalles específicos)
- ✅ `agents` (al menos un agente con 100% split)
- ✅ `authorization` (signDate, signCity, signState)
- ✅ `addresses` (al menos dirección primaria)
- ✅ `beneficiaries` (al menos un beneficiario primario)

### **Condicionales**

- ⚠️ `dependents` - Solo si coverageCode incluye familia
- ⚠️ `employment` - Solo para ciertos productos
- ⚠️ `physician` - Solo si hay condiciones pre-existentes
- ⚠️ `qualifyingQuestionAnswers` - Solo si hay cuestionario
- ⚠️ `policyOwner` - Solo si el dueño es diferente al asegurado

### **Opcionales**

- ⚪ `sourceRefId` - Recomendado para tracking
- ⚪ `applicant.middleName`
- ⚪ `applicant.secondaryEmail`
- ⚪ `applicant.secondaryPhoneNumber`

---

---

## 📝 Notas Adicionales

- **sourceRefId**: Usa un formato único y rastreable (ej: `APP-{YEAR}-{ID}`)
- **enrollmentId**: Guárdalo inmediatamente - es la única forma de rastrear la aplicación
- **applicantDocumentURL**: El PDF está disponible por tiempo limitado, descárgalo y guárdalo
- **totalPremium**: Debe coincidir con tu cálculo interno (plan.premium + sum(riders.premium))
- **Modo Production**: En producción, este endpoint envía la aplicación para procesamiento real
- **Modo QA**: En QA, puedes hacer testing sin afectar datos reales

---