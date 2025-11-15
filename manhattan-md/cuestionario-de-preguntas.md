## 📋 Información General

**Base URL**: `https://api.manhattanlife.com/EnrollmentService.QA`

**Ambiente**: QA/Testing

**Autenticación**: Bearer Token (OAuth 2.0)

---

## 📝 Endpoint: Obtener Cuestionario de Preguntas Requeridas

### **Request**

```
GET /api/v2/question/getQuestionnaireReference

```

**URL Completa**:

```
https://api.manhattanlife.com/EnrollmentService.QA/api/v2/question/getQuestionnaireReference?planUnitStateCodeId={id1}&planUnitStateCodeId={id2}

```

### **Descripción**

Este endpoint retorna las **preguntas requeridas** (cuestionario médico/de suscripción) que deben ser respondidas por el aplicante durante el proceso de enrollment para uno o más planes específicos.

### **Headers**

| Header | Valor | Requerido |
| --- | --- | --- |
| `Authorization` | `Bearer {access_token}` | ✅ Sí |
| `Content-Type` | `application/json` | ✅ Sí |

### **Query Parameters**

| Parámetro | Tipo | Descripción | Ejemplo | Requerido |
| --- | --- | --- | --- | --- |
| `planUnitStateCodeId` | integer | ID del plan (puede repetirse para múltiples planes) | `22540` | ✅ Sí (al menos 1) |

**Nota**: Puedes pasar **múltiples** `planUnitStateCodeId` para obtener las preguntas de varios planes en una sola llamada.

---

## 📥 Response

### **Success Response**

**Status Code**: `200 OK`

**Response Body**:

```json
[
  {
    "parentQuestionId": 0,
    "parentQuestion": "string",
    "parentAnswerId": 0,
    "parentAnswer": "string",
    "dataTypeId": 0,
    "dataType": "string",
    "questionId": 0,
    "question": "string",
    "answerId": 0,
    "answer": "string",
    "audience": "string"
  }
]

```

---

## 📊 Response Structure

**Type**: Array de objetos Question

Cada objeto Question contiene:

| Campo | Tipo | Descripción | Ejemplo |
| --- | --- | --- | --- |
| `parentQuestionId` | integer | ID de la pregunta padre (0 si no tiene padre) | `0` o `123` |
| `parentQuestion` | string | Texto de la pregunta padre | `"Do you smoke?"` |
| `parentAnswerId` | integer | ID de la respuesta padre que activa esta pregunta | `0` o `456` |
| `parentAnswer` | string | Texto de la respuesta padre | `"Yes"` |
| `dataTypeId` | integer | ID del tipo de dato esperado | `1`, `2`, `3` |
| `dataType` | string | Tipo de dato de la respuesta | `"Boolean"`, `"Text"`, `"Date"`, `"Number"` |
| `questionId` | integer | **ID único de la pregunta** (CRÍTICO para enrollment) | `789` |
| `question` | string | Texto de la pregunta a mostrar al usuario | `"Have you been diagnosed with cancer?"` |
| `answerId` | integer | ID de respuesta predefinida (si aplica) | `0` o `101` |
| `answer` | string | Texto de respuesta predefinida (si aplica) | `"Yes"`, `"No"` |
| `audience` | string | A quién va dirigida la pregunta | `"Applicant"`, `"Spouse"`, `"Dependent"` |

---

## 🔍 Tipos de Preguntas

### **1. Preguntas Independientes**

Preguntas que siempre se muestran, sin condiciones.

```json
{
  "parentQuestionId": 0,           // ← Sin padre
  "parentQuestion": null,
  "parentAnswerId": 0,
  "parentAnswer": null,
  "dataTypeId": 1,
  "dataType": "Boolean",
  "questionId": 100,
  "question": "Are you currently a tobacco user?",
  "answerId": 0,
  "answer": null,
  "audience": "Applicant"
}

```

### **2. Preguntas Condicionales (con Padre)**

Preguntas que **solo se muestran** si se respondió específicamente a una pregunta anterior.

```json
{
  "parentQuestionId": 100,         // ← Depende de pregunta 100
  "parentQuestion": "Are you currently a tobacco user?",
  "parentAnswerId": 201,           // ← Solo si respondió "Yes"
  "parentAnswer": "Yes",
  "dataTypeId": 2,
  "dataType": "Text",
  "questionId": 105,
  "question": "What type of tobacco products do you use?",
  "answerId": 0,
  "answer": null,
  "audience": "Applicant"
}

```

**Lógica Condicional:**

```
IF usuario responde "Yes" (answerId: 201) a pregunta 100
  THEN mostrar pregunta 105
ELSE
  NO mostrar pregunta 105

```

---

## 📋 Tipos de Datos (dataType)

| dataType | dataTypeId | Descripción | Input HTML | Validación |
| --- | --- | --- | --- | --- |
| `Boolean` | 1 | Sí/No | Radio buttons o Checkbox | Requerido seleccionar |
| `Text` | 2 | Texto libre | Input text o Textarea | Longitud mínima/máxima |
| `Date` | 3 | Fecha | Date picker | Formato MM/DD/YYYY |
| `Number` | 4 | Número | Input number | Rango permitido |
| `Select` | 5 | Opción múltiple | Dropdown | Seleccionar una opción |

---

## 🎭 Audiencias (audience)

| Audience | Descripción | Cuándo Aplicar |
| --- | --- | --- |
| `Applicant` | Preguntas para el solicitante principal | Siempre |
| `Spouse` | Preguntas para el cónyuge | Solo si el plan cubre cónyuge |
| `Dependent` | Preguntas para dependientes | Solo si se agregan dependientes |
| `All` | Preguntas para todos los asegurados | Todos los cubiertos |

---

---

---

## ⚠️ Consideraciones Importantes

### **1. Diferentes Planes = Diferentes Preguntas**

Cada producto puede tener cuestionarios distintos:

- Cancer insurance: Preguntas sobre historial de cáncer
- Critical Illness: Preguntas sobre condiciones cardíacas
- Accident: Preguntas sobre actividades de alto riesgo

### **2. Lógica Condicional**

Las preguntas pueden tener **dependencias complejas**:

```
Pregunta 1: ¿Ha sido diagnosticado con diabetes?
  → Si = "Yes"
    ├─ Pregunta 2: ¿Qué tipo de diabetes?
    └─ Pregunta 3: ¿Cuándo fue el diagnóstico?
  → Si = "No"
    └─ Preguntas 2 y 3 NO se muestran

```

### **3. Múltiples Audiencias**

Si un plan cubre **cónyuge y dependientes**, debes mostrar el cuestionario para cada uno:

```tsx
// Aplicante principal
const applicantQuestions = getQuestionsByAudience(questions, 'Applicant');

// Cónyuge (si aplica)
const spouseQuestions = getQuestionsByAudience(questions, 'Spouse');

// Dependientes (si aplica)
const dependentQuestions = getQuestionsByAudience(questions, 'Dependent');

```

### **4. Validación de Respuestas**

Antes de enviar a enrollment:

- ✅ Todas las preguntas visibles deben tener respuesta
- ✅ Formato de datos debe coincidir con `dataType`
- ✅ Preguntas condicionales solo se validan si el padre las activó

---