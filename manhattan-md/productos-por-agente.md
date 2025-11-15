# 📋 Información General

**Base URL**: `https://api.manhattanlife.com/EnrollmentService.QA`

**Ambiente**: QA/Testing

**Autenticación**: Bearer Token (OAuth 2.0)

---

## 📦 Endpoint: Obtener Productos Disponibles por Agente

### **Request**

```
GET /api/v2/product/agentProducts

```

**URL Completa**:

```
https://api.manhattanlife.com/EnrollmentService.QA/api/v2/product/agentProducts?agentNumber={agentNumber}

```

### **Headers**

| Header | Valor | Requerido |
| --- | --- | --- |
| `Authorization` | `Bearer {access_token}` | ✅ Sí |
| `Content-Type` | `application/json` | ✅ Sí |

### **Query Parameters**

| Parámetro | Tipo | Descripción | Ejemplo | Requerido |
| --- | --- | --- | --- | --- |
| `agentNumber` | string | Número de identificación del agente en Manhattan Life | `99999990000` | ✅ Sí |

---

## 📥 Response

### **Success Response**

**Status Code**: `200 OK`

**Response Body**:

```json
[
  {
    "productName": "Cancer First Occurrence"
  },
  {
    "productName": "Cancer Care Plus"
  },
  {
    "productName": "Critical Protection and Recovery"
  },
  {
    "productName": "24 Hour Accident Insurance"
  },
  {
    "productName": "Accident Insurance"
  },
  {
    "productName": "Dental, Vision and Hearing Insurance"
  },
  {
    "productName": "Out-of-Pocket Protection Plan"
  },
  {
    "productName": "Affordable Choice"
  },
  {
    "productName": "MAC Medicare Supplement"
  },
  {
    "productName": "Home Health Care (SLAC)"
  },
  {
    "productName": "DVH Select"
  },
  {
    "productName": "Home Health Care Select (SLAC)"
  },
  {
    "productName": "Home Health Care Select (MAC)"
  },
  {
    "productName": "CHAS (SLAC)"
  },
  {
    "productName": "VB Accident"
  },
  {
    "productName": "VB Critical Illness"
  },
  {
    "productName": "VB Hospital Indemnity"
  },
  {
    "productName": "First Choice Blue Ribbon Series"
  },
  {
    "productName": "Short Term Care"
  },
  {
    "productName": "Final Expense"
  },
  {
    "productName": "Hospital Indemnity Select (MAC)"
  },
  {
    "productName": "Disability Income"
  },
  {
    "productName": "Disability Income Group"
  }
]

```

### **Response Structure**

**Type**: Array de objetos

Cada objeto contiene:

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `productName` | string | Nombre del producto de seguro disponible para el agente |

---

## 🏷️ Categorías de Productos Identificadas

Basándome en la respuesta, los productos se pueden clasificar en:

### **Seguros de Salud Complementarios**

- Cancer First Occurrence
- Cancer Care Plus
- Critical Protection and Recovery
- Out-of-Pocket Protection Plan
- Affordable Choice

### **Seguros de Accidentes**

- 24 Hour Accident Insurance
- Accident Insurance
- VB Accident

### **Medicare y Cuidado en el Hogar**

- MAC Medicare Supplement
- Home Health Care (SLAC)
- Home Health Care Select (SLAC)
- Home Health Care Select (MAC)
- CHAS (SLAC)
- Short Term Care

### **Seguros Dentales y Visión**

- Dental, Vision and Hearing Insurance
- DVH Select

### **Seguros de Hospitalización**

- VB Hospital Indemnity
- Hospital Indemnity Select (MAC)

### **Seguros de Enfermedades Críticas**

- VB Critical Illness

### **Seguros de Vida y Gastos Finales**

- First Choice Blue Ribbon Series
- Final Expense

### **Seguros de Discapacidad**

- Disability Income
- Disability Income Group

---