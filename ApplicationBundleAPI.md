# 📘 Documentación: NGIC ApplicationBundle API

## Descripción General

El endpoint **POST /api/ApplicationBundle** de la API de Enrollment de NGIC permite obtener el paquete completo de preguntas, autorizaciones y documentación requerida para solicitar un plan de seguro específico. Este endpoint es esencial para construir formularios dinámicos de inscripción basados en los requisitos específicos de cada producto y estado.

---

🔗 Endpoint

```
POST https://ngahservices.ngic.com/EnrollmentApi/api/ApplicationBundle

```

---

## 🔐 Autenticación

Este endpoint requiere **Basic Authentication**. Las credenciales deben ser proporcionadas en el header `Authorization`:

```
Authorization: Basic {Base64(username:password)}

```

Credenciales:

UserName: TestUser
Password: Test1234
AgentID: 159208

---

## 📥 Request

### Headers Requeridos

| Header | Valor | Descripción |
| --- | --- | --- |
| `Authorization` | `Basic {credentials}` | Credenciales codificadas en Base64 |
| `Content-Type` | `application/json` | Formato del cuerpo de la petición |

### Body Parameters

| Parámetro | Tipo | Requerido | Descripción |
| --- | --- | --- | --- |
| `state` | string | ✅ Sí | Código de estado de dos letras (ej: "CA", "TX", "FL") |
| `planIds` | string[] | ✅ Sí | Array con el `productCode` del plan obtenido del Quoting API |
| `planKeys` | string[] | ✅ Sí | Array con el `planKey` del plan obtenido del Quoting API |
| `effectiveDate` | string | ⚠️ Recomendado | Fecha de inicio de cobertura en formato ISO 8601 |
| `dateOfBirth` | string | ⚠️ Recomendado | Fecha de nacimiento del aplicante en formato ISO 8601 |
| `agentNumber` | string | No | Número de agente autorizado |
| `isEFulfillment` | boolean | No | Indica si la entrega de documentos será electrónica (default: false) |

### Ejemplo de Request

```json
{
  "state": "CA",
  "planIds": ["21673"],
  "planKeys": ["Life 25000"],
  "effectiveDate": "2025-11-25T00:00:00Z",
  "dateOfBirth": "1960-01-01T00:00:00Z",
  "agentNumber": "159208",
  "isEFulfillment": true
}

```

---

## 🔄 Mapeo entre Quoting API y Enrollment API

Para usar correctamente este endpoint, primero debes obtener planes del **Quoting API** y luego mapear los campos apropiados:

### Campos del Quoting API Response

```json
{
  "id": "Life25000",
  "planKey": "Life 25000",
  "productCode": "21673",
  "productSubCode": 723,
  "planName": "Life Only - Individual",
  "insuranceRate": 12.52
}

```

### Mapeo a ApplicationBundle Request

| Campo Quoting API | Campo ApplicationBundle | Ejemplo |
| --- | --- | --- |
| `productCode` | `planIds` | `["21673"]` |
| `planKey` | `planKeys` | `["Life 25000"]` |

### Patrón de Mapeo

```
productCode: "21673"      → planIds: ["21673"]
planKey: "Life 25000"     → planKeys: ["Life 25000"]

```

**Nota importante:** Ambos campos (`planIds` y `planKeys`) son requeridos. El campo `planKeys` debe incluir espacios si el plan original los tiene (ej: "Life 25000" no "Life25000").

---

## 📤 Response

### Response Exitoso (200 OK)

La respuesta contiene un objeto `ApplicationBundle` con toda la información necesaria para construir el formulario de inscripción:

```json
{
  "applications": [
    {
      "productId": "21673",
      "stateId": "CA",
      "product": "TermLife",
      "applicationType": "Individual",

      "eligibilityTitle": "Eligibility Questions",
      "eligibilityQuestionHeader": "Please answer the following questions:",
      "eligibilityQuestions": [
        {
          "questionId": 101,
          "questionText": "Are you a U.S. citizen or permanent resident?",
          "questionType": "Eligibility",
          "sequenceNo": 1.0,
          "possibleAnswers": [
            {
              "id": 1,
              "questionId": 101,
              "answerText": "Yes",
              "answerType": "Radio",
              "isKnockOut": false
            },
            {
              "id": 2,
              "questionId": 101,
              "answerText": "No",
              "answerType": "Radio",
              "isKnockOut": true,
              "errorMessage": "You must be a U.S. citizen to qualify"
            }
          ]
        }
      ],

      "authorizationTitle": "Authorizations",
      "authorizations": [
        {
          "questionId": 201,
          "questionText": "I authorize NGIC to verify my information...",
          "questionType": "Authorization",
          "possibleAnswers": [
            {
              "id": 3,
              "answerText": "I Agree",
              "answerType": "Checkbox"
            }
          ]
        }
      ],

      "generalQuestions": [],
      "questionSections": [],

      "formVersion": "v2.1",
      "formNumber": "NGIC-CA-LIFE-2024",
      "carrierName": "National General"
    }
  ],
  "authorizationText": "By submitting this application...",
  "validationErrors": []
}

```

### Estructura de la Respuesta

### Applications Array

Contiene uno o más objetos de aplicación, cada uno representa un producto solicitado.

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `productId` | string | Identificador del producto |
| `stateId` | string | Estado para el cual es válida la aplicación |
| `product` | string | Tipo de producto base |
| `applicationType` | string | Tipo de aplicación: "Individual" o "Association" |

### Eligibility Questions

Preguntas que determinan si el aplicante califica para el plan.

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `questionId` | number | ID único de la pregunta |
| `questionText` | string | Texto de la pregunta a mostrar |
| `questionType` | string | Tipo: "Eligibility", "Authorization", "PreEx", etc. |
| `sequenceNo` | number | Orden de aparición |
| `possibleAnswers` | array | Opciones de respuesta disponibles |

### Possible Answers

Cada pregunta tiene una o más respuestas posibles:

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `id` | number | ID único de la respuesta |
| `answerText` | string | Texto de la respuesta |
| `answerType` | string | Tipo de input: "Radio", "Checkbox", "FreeText", "Date", etc. |
| `isKnockOut` | boolean | Si es `true`, esta respuesta descalifica al aplicante |
| `errorMessage` | string | Mensaje a mostrar si es knockout |

### Authorization Questions

Consentimientos y autorizaciones que el aplicante debe aceptar.

### Question Sections

Secciones organizadas de preguntas (historial médico, información personal, etc.).

---

## ⚠️ Responses de Error

### 400 Bad Request

Errores de validación en los parámetros enviados:

```json
[
  {
    "errorCode": "PlanIdEmpty",
    "errorDetail": "PlanId not be empty"
  },
  {
    "errorCode": "StateIdEmpty",
    "errorDetail": "State not be empty"
  }
]

```

### 404 Not Found

El plan especificado no existe o no está disponible:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.5",
  "title": "Not Found",
  "status": 404,
  "detail": "No product applications were found for the given products.",
  "traceId": "00-xxxx-xxxx-00"
}

```

**Causas comunes:**

- El `productCode` no existe en el catálogo
- El plan no está disponible para el estado especificado
- Mapeo incorrecto entre Quoting API y Enrollment API
- El producto no está soportado en ApplicationBundle

### 401 Unauthorized

Credenciales de autenticación inválidas o ausentes:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.2",
  "title": "Unauthorized",
  "status": 401
}

```

---

## 📋 Tipos de Preguntas (QuestionType)

| Tipo | Descripción | Uso |
| --- | --- | --- |
| `Eligibility` | Determina si el aplicante califica | Edad, ciudadanía, Medicare |
| `Authorization` | Consentimientos legales | Verificación de información, HIPAA |
| `PreEx` | Condiciones preexistentes | Historial médico |
| `HRF` | Factores de riesgo de salud | Fumador, peso, altura |
| `GeneralQuestion` | Preguntas generales | Otro seguro, información laboral |
| `PriorInsurance` | Seguro anterior | Cobertura previa |
| `Creditable` | Cobertura acreditable | Medicare creditable coverage |
| `Hidden` | No se muestra al usuario | Datos internos |

---

## 🎨 Tipos de Respuesta (AnswerType)

| Tipo | Descripción | HTML Equivalente |
| --- | --- | --- |
| `Radio` | Selección única | `<input type="radio">` |
| `Checkbox` | Selección múltiple | `<input type="checkbox">` |
| `FreeText` | Texto libre corto | `<input type="text">` |
| `Date` | Fecha completa | `<input type="date">` |
| `MonthYearDate` | Solo mes y año | `<select>` mes + año |
| `TextArea` | Texto libre largo | `<textarea>` |

---

## ⚡ Knockout Answers

Las respuestas con `isKnockOut: true` **descalifican automáticamente** al aplicante para ese plan.

### Ejemplo

```json
{
  "questionText": "Are you enrolled in Medicare Part B?",
  "possibleAnswers": [
    {
      "answerText": "Yes",
      "isKnockOut": false  // ✅ Puede continuar
    },
    {
      "answerText": "No",
      "isKnockOut": true,  // ❌ Descalificado
      "errorMessage": "Medicare Part B enrollment is required for this plan"
    }
  ]
}

```

**Comportamiento esperado:** Si el usuario selecciona una respuesta knockout, debe:

1. Mostrar el `errorMessage` al usuario
2. Prevenir el envío del formulario
3. Sugerir planes alternativos si están disponibles

---

## 🔄 Flujo de Uso Recomendado

```
1. Usuario selecciona plan en el Marketplace
   ↓
2. Obtener plan completo del Quoting API
   ↓
3. Extraer productCode y planKey
   ↓
4. Llamar POST /api/ApplicationBundle
   ↓
5. Construir formulario dinámico con las preguntas
   ↓
6. Usuario completa el formulario
   ↓
7. Validar respuestas (knockout answers)
   ↓
8. Enviar a POST /api/Enrollment

```

---

## 📝 Notas Importantes

### Sobre los IDs de Plan

- **NUNCA uses el campo `id` del Quoting API** en ApplicationBundle
- **SIEMPRE usa `productCode` → `planIds`** y **`planKey` → `planKeys`**
- Los espacios en `planKey` son significativos y deben preservarse

### Sobre el Caching

- Las preguntas pueden variar por estado y fecha efectiva
- Se recomienda cachear las respuestas por 24-48 horas
- Clave de cache sugerida: `{state}-{productCode}-{effectiveDate}`

### Sobre Productos No Soportados

No todos los productos del Quoting API están disponibles en ApplicationBundle. Si recibes un 404:

1. Verifica que el producto esté soportado
2. Confirma que el estado tenga ese producto disponible
3. Contacta a NGIC para confirmar disponibilidad

### Múltiples Planes

Puedes solicitar preguntas para múltiples planes en una sola llamada:

```json
{
  "state": "CA",
  "planIds": ["21673", "21044"],
  "planKeys": ["Life 25000", "2144"],
  "effectiveDate": "2025-11-25T00:00:00Z"
}

```

La respuesta incluirá un objeto en `applications[]` por cada plan.

---

## 🔗 Endpoints Relacionados

| Endpoint | Propósito |
| --- | --- |
| `POST /QuotingAPI/api/v1/Rate/AllPlans` | Obtener planes disponibles y precios |
| `POST /EnrollmentApi/api/Enrollment` | Enviar inscripción completa |
| `GET /EnrollmentApi/api/ApplicationStatus/{id}` | Consultar estado de aplicación |

---

## 📞 Soporte

Para preguntas sobre este endpoint:

- **Email:** ahit-developers@ngic.com
- **Documentación adicional:** Contactar a tu Account Representative de NGIC

---

## 📚 Ejemplos Completos

### Ejemplo 1: Life Insurance

**Request:**

```json
{
  "state": "CA",
  "planIds": ["21673"],
  "planKeys": ["Life 50000"],
  "effectiveDate": "2025-12-01T00:00:00Z",
  "dateOfBirth": "1960-01-01T00:00:00Z",
  "agentNumber": "159208"
}

```

### Ejemplo 2: Accident Fixed-Benefit

**Request:**

```json
{
  "state": "CA",
  "planIds": ["21044"],
  "planKeys": ["2144"],
  "effectiveDate": "2025-12-01T00:00:00Z",
  "agentNumber": "159208"
}

```

### Ejemplo 3: Múltiples Planes

**Request:**

```json
{
  "state": "TX",
  "planIds": ["21673", "21044"],
  "planKeys": ["Life 100000", "2144"],
  "effectiveDate": "2025-12-01T00:00:00Z",
  "dateOfBirth": "1965-03-15T00:00:00Z"
}

```

---

**Última actualización:** Octubre 2025

**Versión de API:** v1.0.0