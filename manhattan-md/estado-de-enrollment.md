## 📋 Información General

**Base URL**: `https://api.manhattanlife.com/EnrollmentService.QA`

**Ambiente**: QA/Testing

**Autenticación**: Bearer Token (OAuth 2.0)

---

## 🔍 Endpoint: Consultar Estado de Enrollment

### **Request**

```
GET /api/Enrollment/GetStatus

```

**URL Completa**:

```
https://api.manhattanlife.com/EnrollmentService.QA/api/Enrollment/GetStatus?enrollmentId={enrollmentId}

```

### **Descripción**

Este endpoint permite consultar el **estado actual** de una aplicación de seguro previamente enviada mediante el endpoint `/api/v2/enrollment/submit`. Es esencial para:

- Rastrear el progreso de procesamiento de la aplicación
- Verificar si la póliza fue aprobada o rechazada
- Obtener el número de póliza una vez aprobada
- Identificar problemas o excepciones en el procesamiento

### **Headers**

| Header | Valor | Requerido |
| --- | --- | --- |
| `Authorization` | `Bearer {access_token}` | ✅ Sí |
| `Content-Type` | `application/json` | ✅ Sí |

### **Query Parameters**

| Parámetro | Tipo | Descripción | Ejemplo | Requerido |
| --- | --- | --- | --- | --- |
| `enrollmentId` | integer | ID del enrollment retornado por `/api/v2/enrollment/submit` | `987654` | ✅ Sí |

---

## 📥 Response

### **Success Response**

**Status Code**: `200 OK`

**Response Body**:

```json
[
  {
    "enrollmentId": 987654,
    "status": "Approved",
    "policyNumber": "ML-TX-2025-123456",
    "applicantDocumentName": "Application_JohnDoe_987654.pdf",
    "exceptionMessage": null
  }
]

```

**Nota**: La respuesta es un **array** con un solo elemento, incluso cuando consultas un solo enrollmentId.

---

## 📊 Response Structure

**Type**: Array de objetos EnrollmentStatus

Cada objeto contiene:

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `enrollmentId` | integer | ID del enrollment consultado |
| `status` | string | Estado actual de la aplicación |
| `policyNumber` | string/null | Número de póliza (solo si está aprobada) |
| `applicantDocumentName` | string | Nombre del documento PDF de la aplicación |
| `exceptionMessage` | string/null | Mensaje de error/excepción (si hay problemas) |

---

## 🎯 Estados Posibles

### **Estados del Ciclo de Vida**

| Status | Descripción | Acción Requerida | Policy Number |
| --- | --- | --- | --- |
| `"Submitted"` | Aplicación recibida, en cola para procesamiento | ⏳ Esperar | ❌ No |
| `"InReview"` | En proceso de revisión por underwriting | ⏳ Esperar | ❌ No |
| `"PendingInformation"` | Requiere información adicional | ✋ Proveer documentos/datos | ❌ No |
| `"Approved"` | Póliza aprobada e emitida | ✅ Completado | ✅ Sí |
| `"Declined"` | Aplicación rechazada | ❌ Ver exceptionMessage | ❌ No |
| `"Cancelled"` | Aplicación cancelada | ❌ Cerrado | ❌ No |
| `"Withdrawn"` | Retirada por el aplicante | ❌ Cerrado | ❌ No |

### **Estados de Error/Excepción**

| Status | Descripción | exceptionMessage |
| --- | --- | --- |
| `"Error"` | Error en procesamiento | Contiene detalles del error |
| `"Failed"` | Fallo en validación o procesamiento | Razón del fallo |

---

## 📋 Ejemplos de Respuestas

### **Ejemplo 1: Aplicación Aprobada**

```json
[
  {
    "enrollmentId": 987654,
    "status": "Approved",
    "policyNumber": "ML-TX-2025-123456",
    "applicantDocumentName": "Application_JohnDoe_987654.pdf",
    "exceptionMessage": null
  }
]

```

**Interpretación:**

- ✅ Póliza aprobada
- ✅ Policy number asignado
- ✅ Listo para notificar al cliente

---

### **Ejemplo 2: En Revisión**

```json
[
  {
    "enrollmentId": 987654,
    "status": "InReview",
    "policyNumber": null,
    "applicantDocumentName": "Application_JohnDoe_987654.pdf",
    "exceptionMessage": null
  }
]

```

## ⚠️ Consideraciones Importantes

### **1. Frecuencia de Consulta**

**Recomendaciones:**

- ⏰ **Primera verificación**: Inmediatamente después del submit
- ⏰ **Polling regular**: Cada 5-15 minutos si está pendiente
- ⏰ **Máximo de intentos**: ~50 intentos (4-12 horas)
- ⏰ **Después de completado**: No verificar más

**IMPORTANTE**: No consultar con demasiada frecuencia para evitar rate limiting.

###