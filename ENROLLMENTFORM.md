📘 Documentación: NGIC Enrollment API

## Descripción General

El endpoint **POST /api/Enrollment** de la API de Enrollment de NGIC permite enviar una solicitud completa de inscripción para uno o más planes de seguro. Este es el endpoint **principal y crítico** del flujo de enrollment, donde se envía toda la información recopilada del usuario para crear la póliza o aplicación.

---

## 🔗 Endpoint

```
POST https://ngahservices.ngic.com/EnrollmentApi/api/Enrollment

```

---

## 🔐 Autenticación

Este endpoint requiere **Basic Authentication**. Las credenciales deben ser proporcionadas en el header `Authorization`:

```
Authorization: Basic {Base64(username:password)}

```

---

## 📥 Request

### Headers Requeridos

| Header | Valor | Descripción |
| --- | --- | --- |
| `Authorization` | `Basic {credentials}` | Credenciales codificadas en Base64 |
| `Content-Type` | `application/json` | Formato del cuerpo de la petición |

### Estructura del Body

El request está compuesto por tres secciones principales:

1. **Demographics** - Información demográfica del aplicante principal
2. **Coverages** - Planes de seguro que se están solicitando
3. **Payment** - Información de pago
4. **Partner** - Información del agente/vendedor
5. **Attestations** (Opcional) - Consentimientos y firmas

---

## 📋 Sección 1: Demographics

Contiene la información personal y demográfica del aplicante principal y sus dependientes.

### Campos Principales

| Campo | Tipo | Requerido | Descripción |
| --- | --- | --- | --- |
| `zipCode` | string | ✅ Sí | Código postal de 5 dígitos |
| `email` | string | ✅ Sí | Email del aplicante principal |
| `address1` | string | ✅ Sí | Dirección línea 1 |
| `address2` | string | No | Dirección línea 2 (Apt, Suite, etc.) |
| `city` | string | ✅ Sí | Ciudad |
| `state` | string | ✅ Sí | Estado (código de 2 letras) |
| `phone` | string | ✅ Sí | Teléfono (10 dígitos, solo números) |
| `alternatePhone` | string | No | Teléfono alternativo |
| `applicants` | array | ✅ Sí | Array de aplicantes (mínimo 1) |
| `isEFulfillment` | boolean | No | true = documentos electrónicos (default: false) |
| `isRewrite` | boolean | No | true = reescritura de cobertura existente |
| `isListBill` | boolean | No | true = facturación contra cuenta List Bill |
| `listBillNumber` | string | Condicional | Requerido si `isListBill` es true |
| `addresses` | array | No | Array de direcciones adicionales |
| `zipCodePlus4` | string | No | Extensión +4 del código postal |
| `legalGuardian` | object | Condicional | Requerido si el aplicante es menor |

### Ejemplo Demographics:

```json
{
  "zipCode": "90210",
  "email": "john.doe@example.com",
  "address1": "123 Main Street",
  "address2": "Apt 4B",
  "city": "Los Angeles",
  "state": "CA",
  "phone": "3105551234",
  "alternatePhone": "3105555678",
  "applicants": [...],
  "isEFulfillment": true,
  "isRewrite": false,
  "isListBill": false
}

```

---

## 👤 Subsección: Applicants (Aplicantes)

Cada applicant representa un individuo cubierto por el seguro.

### Campos del Applicant

| Campo | Tipo | Requerido | Descripción |
| --- | --- | --- | --- |
| `firstName` | string | ✅ Sí | Nombre |
| `lastName` | string | ✅ Sí | Apellido |
| `middleInitial` | string | No | Inicial del segundo nombre |
| `dob` | string (ISO 8601) | ✅ Sí | Fecha de nacimiento |
| `gender` | string | ✅ Sí | "Male", "Female", o "Unknown" |
| `relationship` | string | ✅ Sí | "Primary", "Spouse", o "Dependent" |
| `ssn` | string | Condicional | Número de Seguro Social (recomendado) |
| `smoker` | boolean | ✅ Sí | Indicador de fumador |
| `dateLastSmoked` | string (ISO 8601) | Condicional | Requerido si `smoker` es true |
| `weight` | integer | Condicional | Peso en libras (requerido para algunos planes) |
| `heightFeet` | integer | Condicional | Altura en pies |
| `heightInches` | integer | Condicional | Pulgadas adicionales de altura |
| `hasPriorCoverage` | boolean | No | Indica cobertura previa elegible |
| `applicantId` | string | ✅ Sí | ID único para referenciar en coverages |
| `eligibleRateTier` | string | No | "Standard", "Preferred", "PreferredSelect", "Tobacco" |
| `quotedRateTier` | string | No | Tier usado en la cotización |
| `questionResponses` | array | ✅ Sí | Respuestas a preguntas del ApplicationBundle |
| `phoneNumbers` | array | No | Teléfonos del aplicante |
| `medications` | array | Condicional | Medicamentos (para Medicare Supplement) |
| `medSuppInfo` | object | Condicional | Información de Medicare (para MedSupp) |

### Ejemplo Applicant (Primary):

```json
{
  "firstName": "John",
  "middleInitial": "A",
  "lastName": "Doe",
  "dob": "1960-01-15T00:00:00Z",
  "gender": "Male",
  "relationship": "Primary",
  "ssn": "123456789",
  "smoker": false,
  "dateLastSmoked": null,
  "weight": 180,
  "heightFeet": 5,
  "heightInches": 10,
  "hasPriorCoverage": false,
  "applicantId": "primary-001",
  "eligibleRateTier": "Standard",
  "quotedRateTier": "Standard",
  "questionResponses": [
    {
      "questionId": 101,
      "response": "1"
    },
    {
      "questionId": 102,
      "response": "No"
    }
  ],
  "phoneNumbers": [
    {
      "phoneNumber": "3105551234",
      "phoneType": "Mobile",
      "allowTextMessaging": true,
      "allowServiceCalls": true
    }
  ]
}

```

### Subsección: QuestionResponses

Las respuestas a las preguntas obtenidas del ApplicationBundle.

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `questionId` | integer | ID de la pregunta del ApplicationBundle |
| `response` | string | ID de la respuesta o texto libre |
| `dataKey` | string | Clave opcional para mapeo de datos |

**Importante:** El `response` debe ser:

- Para preguntas Radio/Checkbox: El `id` de la respuesta seleccionada (como string)
- Para preguntas FreeText/Date/TextArea: El valor ingresado por el usuario

---

## 🏥 Subsección: MedSuppInfo (Solo para Medicare Supplement)

| Campo | Tipo | Requerido | Descripción |
| --- | --- | --- | --- |
| `medicarePartAEffectiveDate` | string (ISO 8601) | ⚠️ Sí (MedSupp) | Fecha efectiva de Medicare Part A |
| `medicarePartBEffectiveDate` | string (ISO 8601) | ⚠️ Sí (MedSupp) | Fecha efectiva de Medicare Part B |
| `medicareId` | string | ⚠️ Sí (MedSupp) | Número de Medicare |
| `isPreMACRAEligible` | boolean | No | Elegible antes de 1/1/2020 |

---

## 📋 Sección 2: Coverages

Array de coberturas/planes que se están solicitando. Puede incluir múltiples planes en una sola aplicación.

### Campos del Coverage

| Campo | Tipo | Requerido | Descripción |
| --- | --- | --- | --- |
| `planKey` | string | ✅ Sí | Plan key del Quoting API |
| `effectiveDate` | string (ISO 8601) | ✅ Sí | Fecha de inicio de cobertura |
| `monthlyPremium` | number | ✅ Sí | Premium mensual del Quoting API |
| `paymentFrequency` | string | ✅ Sí | "Monthly", "Quarterly", "SemiAnnual", "Annual" |
| `term` | integer | Condicional | Longitud del término (para STM) |
| `numberOfTerms` | integer | Condicional | Número de términos consecutivos (para STM) |
| `terminationDate` | string (ISO 8601) | Condicional | Último día de cobertura (para STM) |
| `insuranceNetwork` | string | Condicional | Red de seguros (para STM PPO) |
| `agentNumber` | string | No | Número de agente específico para este producto |
| `applicants` | array | ✅ Sí | Referencias a los aplicantes cubiertos |
| `riders` | array | No | Riders opcionales adicionales |
| `deliveryTarget` | string | No | "PrimaryInsured", "Agent", "Owner" |
| `discounts` | array | No | Descuentos aplicados |
| `isListBill` | boolean | No | Facturación List Bill específica del plan |
| `beneficiaries` | array | Condicional | Beneficiarios (para Life Insurance) |
| `medSuppInfo` | object | Condicional | Info de Medicare Supplement |
| `otherCoverage` | object | Condicional | Info de cobertura que se reemplaza |

### Ejemplo Coverage:

```json
{
  "planKey": "Life 25000",
  "effectiveDate": "2025-12-01T00:00:00Z",
  "monthlyPremium": 12.52,
  "paymentFrequency": "Monthly",
  "agentNumber": "159208",
  "applicants": [
    {
      "applicantId": "primary-001",
      "hasPriorCoverage": false,
      "eligibleRateTier": "Standard",
      "quotedRateTier": "Standard",
      "questionResponses": [
        {
          "questionId": 301,
          "response": "2"
        }
      ]
    }
  ],
  "beneficiaries": [
    {
      "beneficiaryId": 1,
      "firstName": "Jane",
      "lastName": "Doe",
      "relationship": "Spouse",
      "allocationPercentage": 100.0,
      "dateOfBirth": "1962-03-20T00:00:00Z"
    }
  ]
}

```

### Subsección: CoverageApplicant

Referencia a un aplicante dentro de un coverage específico.

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `applicantId` | string | Debe coincidir con el `applicantId` en Demographics.applicants |
| `hasPriorCoverage` | boolean | Cobertura previa elegible |
| `eligibleRateTier` | string | Tier de riesgo elegible |
| `quotedRateTier` | string | Tier usado en cotización |
| `questionResponses` | array | Respuestas específicas del coverage |

---

## 💳 Sección 3: Payment

Información del método de pago. **IMPORTANTE: No almacenar esta información en tu base de datos.**

### Campos de Payment

| Campo | Tipo | Requerido | Descripción |
| --- | --- | --- | --- |
| `accountType` | string | ✅ Sí | "ACH", "CreditCard", "DirectBill" |
| `accountHolderFirstName` | string | ✅ Sí | Nombre del titular |
| `accountHolderLastName` | string | ✅ Sí | Apellido del titular |

### Para ACH (Cuenta Bancaria):

| Campo | Tipo | Requerido | Descripción |
| --- | --- | --- | --- |
| `routingNumber` | string | ✅ Sí | Número de ruta ABA (9 dígitos) |
| `accountNumber` | string | ✅ Sí | Número de cuenta bancaria |
| `bankName` | string | ✅ Sí | Nombre del banco |
| `bankDraft` | string | ✅ Sí | "Checking" o "Savings" |

### Para Credit Card:

| Campo | Tipo | Requerido | Descripción |
| --- | --- | --- | --- |
| `creditCardNumber` | string | ✅ Sí | Número completo de tarjeta |
| `expirationMonth` | integer | ✅ Sí | Mes de expiración (1-12) |
| `expirationYear` | integer | ✅ Sí | Año de expiración (4 dígitos) |
| `cvv` | string | ✅ Sí | Código CVV (3-4 dígitos) |
| `cardBrand` | string | No | "Visa", "Mastercard", "Amex", "Discover" |

### Campos Opcionales Comunes:

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `initialDraftDate` | string (ISO 8601) | Fecha del primer cargo |
| `desiredDraftDate` | integer | Día del mes para cargos recurrentes (1-31) |
| `isSubmitWithoutPayment` | boolean | Enviar sin información de pago |

### Ejemplo Payment (Credit Card):

```json
{
  "accountType": "CreditCard",
  "accountHolderFirstName": "John",
  "accountHolderLastName": "Doe",
  "creditCardNumber": "4111111111111111",
  "expirationMonth": 12,
  "expirationYear": 2027,
  "cvv": "123",
  "cardBrand": "Visa",
  "desiredDraftDate": 1
}

```

### Ejemplo Payment (ACH):

```json
{
  "accountType": "ACH",
  "accountHolderFirstName": "John",
  "accountHolderLastName": "Doe",
  "routingNumber": "121000248",
  "accountNumber": "123456789",
  "bankName": "Wells Fargo",
  "bankDraft": "Checking",
  "desiredDraftDate": 15
}

```

---

## 🤝 Sección 4: Partner

Información del agente/vendedor que está sometiendo la aplicación.

| Campo | Tipo | Requerido | Descripción |
| --- | --- | --- | --- |
| `agentNumber` | string | ✅ Sí | Número de agente autorizado por NGIC |
| `clientCaseID` | string | No | ID interno de tu sistema |
| `confirmationURL` | string | No | URL para recibir confirmaciones |
| `clientIPAddress` | string | Recomendado | IP del cliente (usuario final) |

### Ejemplo Partner:

```json
{
  "agentNumber": "159208",
  "clientCaseID": "EPIC-2025-001234",
  "clientIPAddress": "192.168.1.100"
}

```

---

## ✍️ Sección 5: Attestations (Opcional)

Consentimientos y firmas digitales.

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `referenceId` | string | ID del documento firmado |
| `dateCollected` | string (ISO 8601) | Fecha de firma |
| `type` | string | "AgentAttest", "ApplicantEsign", "VoiceSign", etc. |
| `value` | string | Valor de la firma (para Passphrase) |
| `clientIPAddress` | string | IP desde donde se firmó |

### Ejemplo Attestation:

```json
{
  "referenceId": "APP-2025-001234-SIG",
  "dateCollected": "2025-10-15T14:30:00Z",
  "type": "ApplicantEsign",
  "clientIPAddress": "192.168.1.100"
}

```

---

## 📤 Response

### Response Exitoso (201 Created)

La respuesta contiene información sobre el enrollment creado:

```json
{
  "memberId": "MEM-2025-123456",
  "submissionResults": [
    {
      "planType": 21673,
      "submissionReceived": true,
      "submissionErrors": [],
      "policyNo": "POL-2025-001234",
      "applicationId": 12345,
      "effectiveDate": "2025-12-01T00:00:00Z"
    }
  ],
  "validationErrors": [],
  "memberPortalUrl": "https://portal.ngic.com/member?token=abc123...",
  "pendingAttestationCeremonies": [],
  "attestationStatus": "Complete"
}

```

### Campos de la Respuesta

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `memberId` | string | ID único del miembro asignado por NGIC |
| `submissionResults` | array | Resultados por cada coverage enviado |
| `validationErrors` | array | Errores de validación si los hay |
| `memberPortalUrl` | string | URL para que el usuario acceda a su portal |
| `pendingAttestationCeremonies` | array | Ceremonias de firma pendientes |
| `attestationStatus` | string | "Complete", "Pending", etc. |

### Subsección: SubmissionResult

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `planType` | integer | Tipo de plan |
| `submissionReceived` | boolean | true si fue recibido exitosamente |
| `submissionErrors` | array | Errores si `submissionReceived` es false |
| `policyNo` | string | **Número de póliza** (si es instant issue) |
| `applicationId` | integer | **ID de aplicación** (si requiere revisión) |
| `effectiveDate` | string | Fecha efectiva de la cobertura |

---

## 🔄 Tipos de Respuesta según Underwriting

### Instant Issue (Aprobación Instantánea)

Cuando el plan se aprueba inmediatamente:

```json
{
  "memberId": "MEM-2025-123456",
  "submissionResults": [
    {
      "submissionReceived": true,
      "policyNo": "POL-2025-001234",
      "applicationId": null,
      "effectiveDate": "2025-12-01T00:00:00Z"
    }
  ]
}

```

**Acción:** Guardar `policyNo` en Supabase. No requiere polling.

### Pending Review (Revisión Manual)

Cuando requiere underwriting manual:

```json
{
  "memberId": "MEM-2025-123456",
  "submissionResults": [
    {
      "submissionReceived": true,
      "policyNo": null,
      "applicationId": 12345,
      "effectiveDate": "2025-12-01T00:00:00Z"
    }
  ]
}

```

**Acción:** Guardar `applicationId` y hacer polling con `/api/ApplicationStatus/12345`

---

## ⚠️ Responses de Error

### 400 Bad Request

Errores de validación:

```json
[
  {
    "field": "demographics.email",
    "message": "Email is required",
    "errorCode": "REQUIRED_FIELD"
  },
  {
    "field": "payment.creditCardNumber",
    "message": "Invalid credit card number",
    "errorCode": "INVALID_CARD"
  }
]

```

### 401 Unauthorized

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.2",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Invalid credentials"
}

```

### 500 Internal Server Error

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.6.1",
  "title": "Internal Server Error",
  "status": 500,
  "detail": "An unexpected error occurred"
}

```

---

## 📝 Ejemplo Completo de Request

```json
{
  "demographics": {
    "zipCode": "90210",
    "email": "john.doe@example.com",
    "address1": "123 Main Street",
    "address2": "Apt 4B",
    "city": "Los Angeles",
    "state": "CA",
    "phone": "3105551234",
    "alternatePhone": "3105555678",
    "applicants": [
      {
        "firstName": "John",
        "middleInitial": "A",
        "lastName": "Doe",
        "dob": "1960-01-15T00:00:00Z",
        "gender": "Male",
        "relationship": "Primary",
        "ssn": "123456789",
        "smoker": false,
        "weight": 180,
        "heightFeet": 5,
        "heightInches": 10,
        "applicantId": "primary-001",
        "eligibleRateTier": "Standard",
        "quotedRateTier": "Standard",
        "questionResponses": [
          {
            "questionId": 101,
            "response": "1"
          },
          {
            "questionId": 102,
            "response": "2"
          },
          {
            "questionId": 103,
            "response": "Yes"
          }
        ],
        "phoneNumbers": [
          {
            "phoneNumber": "3105551234",
            "phoneType": "Mobile",
            "allowTextMessaging": true,
            "allowServiceCalls": true
          }
        ]
      }
    ],
    "isEFulfillment": true,
    "isRewrite": false,
    "isListBill": false
  },
  "coverages": [
    {
      "planKey": "Life 25000",
      "effectiveDate": "2025-12-01T00:00:00Z",
      "monthlyPremium": 12.52,
      "paymentFrequency": "Monthly",
      "agentNumber": "159208",
      "applicants": [
        {
          "applicantId": "primary-001",
          "hasPriorCoverage": false,
          "eligibleRateTier": "Standard",
          "quotedRateTier": "Standard",
          "questionResponses": []
        }
      ],
      "beneficiaries": [
        {
          "beneficiaryId": 1,
          "firstName": "Jane",
          "lastName": "Doe",
          "relationship": "Spouse",
          "allocationPercentage": 100.0,
          "dateOfBirth": "1962-03-20T00:00:00Z",
          "addresses": [
            {
              "streetAddress": "123 Main Street",
              "city": "Los Angeles",
              "state": "CA",
              "zipCode": "90210",
              "type": "Residential"
            }
          ]
        }
      ]
    }
  ],
  "payment": {
    "accountType": "CreditCard",
    "accountHolderFirstName": "John",
    "accountHolderLastName": "Doe",
    "creditCardNumber": "4111111111111111",
    "expirationMonth": 12,
    "expirationYear": 2027,
    "cvv": "123",
    "cardBrand": "Visa",
    "desiredDraftDate": 1
  },
  "partner": {
    "agentNumber": "159208",
    "clientCaseID": "EPIC-2025-001234",
    "clientIPAddress": "192.168.1.100"
  },
  "attestations": [
    {
      "referenceId": "APP-2025-001234-SIG",
      "dateCollected": "2025-10-15T14:30:00Z",
      "type": "ApplicantEsign",
      "clientIPAddress": "192.168.1.100"
    }
  ]
}

```

---

## 🔒 Consideraciones de Seguridad

### Datos Sensibles

**NUNCA almacenar en tu base de datos:**

- Números completos de tarjeta de crédito
- CVV
- Números de cuenta bancaria completos
- Números de ruta bancaria

**Puedes almacenar:**

- Member ID
- Application ID
- Policy Number
- Últimos 4 dígitos de tarjeta (para referencia)

### PCI Compliance

Si manejas información de tarjetas de crédito:

- Usa HTTPS para todas las comunicaciones
- No almacenes datos de tarjetas
- Considera usar un payment gateway que maneje PCI compliance
- Implementa tokenización si es posible

---

## 📋 Validaciones Pre-Envío

Antes de enviar el enrollment, valida:

1. ✅ **Knockout Answers:** Verificar que ninguna respuesta tiene `isKnockOut: true`
2. ✅ **Campos Requeridos:** Todos los campos obligatorios están completos
3. ✅ **Formatos de Fecha:** Todas las fechas en formato ISO 8601
4. ✅ **SSN:** Formato correcto (9 dígitos, sin guiones)
5. ✅ **Teléfono:** 10 dígitos, solo números
6. ✅ **Email:** Formato válido
7. ✅ **Tarjeta:** Número válido (algoritmo de Luhn)
8. ✅ **ApplicantId:** Todos los `applicantId` en coverages existen en demographics
9. ✅ **QuestionResponses:** Todas las preguntas requeridas tienen respuesta

---

## 🔄 Flujo Post-Enrollment

```
POST /api/Enrollment
        ↓
   Response 201
        ↓
   ┌────┴────┐
   ↓         ↓
policyNo  applicationId
presente   presente
   ↓         ↓
Instant   Polling
Issue     Requerido
   ↓         ↓
Guardar   GET /api/ApplicationStatus/{id}
en DB     cada 30-60 segundos
   ↓         ↓
Enviar    Actualizar
Email     status en DB
Confirm      ↓
           Cuando status
           sea "Approved"
           o "Rejected"
              ↓
           Notificar
           usuario

```

---

## 📊 Estados de Aplicación

Al hacer polling con ApplicationStatus, puedes recibir:

| Estado | Descripción | Acción |
| --- | --- | --- |
| `Submitted` | Recibida, en revisión | Continuar polling |
| `Pending` | Pendiente de información adicional | Notificar usuario |
| `Approved` | Aprobada, póliza emitida | Celebrar 🎉 |
| `Rejected` | Rechazada | Notificar y ofrecer alternativas |
| `Withdrawn` | Retirada por el aplicante | Archivar |

---

## 🎯 Mejores Prácticas

1. **Validación del Lado del Cliente:** Valida todos los campos antes de enviar
2. **Manejo de Errores:** Muestra mensajes claros al usuario
3. **Retry Logic:** Implementa reintentos con backoff exponencial para errores 500
4. **Idempotencia:** Usa `clientCaseID` único para evitar duplicados
5. **Logging:** Registra todos los enrollments (sin datos sensibles)
6. **Notificaciones:** Informa al usuario del progreso en tiempo real
7. **Timeout:** Implementa timeouts razonables (30-60 segundos)

---

## 🔗 Endpoints Relacionados

| Endpoint | Propósito |
| --- | --- |
| `POST /api/ApplicationBundle` | Obtener preguntas antes del enrollment |
| `GET /api/ApplicationStatus/{id}` | Consultar estado de aplicación |
| `POST /api/ApplicationPdf` | Subir PDF firmado (opcional) |
| `GET /api/ESignature/SigningCeremony` | Obtener URL de firma |

---

## 📞 Soporte

Para preguntas sobre este endpoint:

- **Email:** ahit-developers@ngic.com
- **Documentación:** Contactar a tu Account Representative de NGIC

---

**Última actualización:** Octubre 2025

**Versión de API:** v1.0.0