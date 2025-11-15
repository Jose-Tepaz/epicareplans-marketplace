## 📋 Información General

**Base URL**: `https://api.manhattanlife.com/EnrollmentService.QA`

**Ambiente**: QA/Testing

**Autenticación**: Bearer Token (OAuth 2.0)

---

## 🏗️ Endpoint: Obtener Jerarquía de Productos

### **Request**

```
POST /api/v2/product/producthierarchy

```

**URL Completa**:

```
https://api.manhattanlife.com/EnrollmentService.QA/api/v2/product/producthierarchy

```

### **Headers**

| Header | Valor | Requerido |
| --- | --- | --- |
| `Authorization` | `Bearer {access_token}` | ✅ Sí |
| `Content-Type` | `application/json` | ✅ Sí |

### **Body Parameters**

**Type**: JSON Object

| Parámetro | Tipo | Descripción | Ejemplo | Requerido |
| --- | --- | --- | --- | --- |
| `stateCode` | string | Código del estado (2 letras) | `"TX"` | ✅ Sí |
| `productNames` | array[string] | Lista de nombres de productos a consultar | `["Cancer Care Plus"]` | ✅ Sí |

### **Request Body Example**

```json
{
  "stateCode": "TX",
  "productNames": [
    "Cancer Care Plus",
    "Critical Protection and Recovery"
  ]
}

```

---

## 📥 Response

### **Success Response**

**Status Code**: `200 OK`

**Response Body**:

```json
[
  {
    "productName": "Critical Protection and Recovery",
    "stateCode": "TX",
    "plans": [
      {
        "planUnitStateCodeId": 21795,
        "planName": "Critical Illness",
        "unitName": "$5,000",
        "coverageAmount": 5000.00,
        "planCode": "CIATX",
        "riders": []
      },
      {
        "planUnitStateCodeId": 21902,
        "planName": "Critical Illness",
        "unitName": "$7,500",
        "coverageAmount": 7500.00,
        "planCode": "CIATX",
        "riders": []
      },
      {
        "planUnitStateCodeId": 21907,
        "planName": "Critical Illness",
        "unitName": "$10,000",
        "coverageAmount": 10000.00,
        "planCode": "CIATX",
        "riders": []
      },
      {
        "planUnitStateCodeId": 21913,
        "planName": "Critical Illness - With Cancer",
        "unitName": "$10,000",
        "coverageAmount": 10000.00,
        "planCode": "CIBTX",
        "riders": []
      },
      {
        "planUnitStateCodeId": 21919,
        "planName": "Critical Illness - With Cancer",
        "unitName": "$5,000",
        "coverageAmount": 5000.00,
        "planCode": "CIBTX",
        "riders": []
      },
      {
        "planUnitStateCodeId": 21926,
        "planName": "Critical Illness - With Cancer",
        "unitName": "$7,500",
        "coverageAmount": 7500.00,
        "planCode": "CIBTX",
        "riders": []
      },
      {
        "planUnitStateCodeId": 22192,
        "planName": "Critical Illness",
        "unitName": "$20,000",
        "coverageAmount": 20000.00,
        "planCode": "CIATX",
        "riders": []
      },
      {
        "planUnitStateCodeId": 22260,
        "planName": "Critical Illness - With Cancer",
        "unitName": "$20,000",
        "coverageAmount": 20000.00,
        "planCode": "CIBTX",
        "riders": []
      }
    ]
  },
  {
    "productName": "Cancer Care Plus",
    "stateCode": "TX",
    "plans": [
      {
        "planUnitStateCodeId": 22540,
        "planName": "PLAN A",
        "unitName": "PLAN A",
        "coverageAmount": null,
        "planCode": "CP4000TX04A",
        "riders": [
          {
            "riderUnitStateId": 4093,
            "riderName": "Critical Care Rider",
            "unitName": "Critical Care Rider",
            "coverageAmount": null,
            "riderCode": "CCBR4000"
          },
          {
            "riderUnitStateId": 4683,
            "riderName": "Intensive Care Rider",
            "unitName": "Intensive Care Rider",
            "coverageAmount": null,
            "riderCode": "ICUR4000"
          }
        ]
      },
      {
        "planUnitStateCodeId": 22471,
        "planName": "PLAN B",
        "unitName": "PLAN B",
        "coverageAmount": null,
        "planCode": "CP4000TX04B",
        "riders": [
          {
            "riderUnitStateId": 4093,
            "riderName": "Critical Care Rider",
            "unitName": "Critical Care Rider",
            "coverageAmount": null,
            "riderCode": "CCBR4000"
          },
          {
            "riderUnitStateId": 4683,
            "riderName": "Intensive Care Rider",
            "unitName": "Intensive Care Rider",
            "coverageAmount": null,
            "riderCode": "ICUR4000"
          }
        ]
      },
      {
        "planUnitStateCodeId": 22563,
        "planName": "PLAN C",
        "unitName": "PLAN C",
        "coverageAmount": null,
        "planCode": "CP4000TX05C",
        "riders": [
          {
            "riderUnitStateId": 4093,
            "riderName": "Critical Care Rider",
            "unitName": "Critical Care Rider",
            "coverageAmount": null,
            "riderCode": "CCBR4000"
          },
          {
            "riderUnitStateId": 4683,
            "riderName": "Intensive Care Rider",
            "unitName": "Intensive Care Rider",
            "coverageAmount": null,
            "riderCode": "ICUR4000"
          }
        ]
      },
      {
        "planUnitStateCodeId": 22678,
        "planName": "PLAN D",
        "unitName": "PLAN D",
        "coverageAmount": null,
        "planCode": "CP4000TX05D",
        "riders": [
          {
            "riderUnitStateId": 4093,
            "riderName": "Critical Care Rider",
            "unitName": "Critical Care Rider",
            "coverageAmount": null,
            "riderCode": "CCBR4000"
          },
          {
            "riderUnitStateId": 4683,
            "riderName": "Intensive Care Rider",
            "unitName": "Intensive Care Rider",
            "coverageAmount": null,
            "riderCode": "ICUR4000"
          }
        ]
      },
      {
        "planUnitStateCodeId": 22694,
        "planName": "PLAN B100",
        "unitName": "PLAN B100",
        "coverageAmount": null,
        "planCode": "CP4000TX04B100",
        "riders": [
          {
            "riderUnitStateId": 4093,
            "riderName": "Critical Care Rider",
            "unitName": "Critical Care Rider",
            "coverageAmount": null,
            "riderCode": "CCBR4000"
          },
          {
            "riderUnitStateId": 4683,
            "riderName": "Intensive Care Rider",
            "unitName": "Intensive Care Rider",
            "coverageAmount": null,
            "riderCode": "ICUR4000"
          }
        ]
      },
      {
        "planUnitStateCodeId": 36769,
        "planName": "PLAN F",
        "unitName": "PLAN F",
        "coverageAmount": null,
        "planCode": "CP4000TX04F",
        "riders": [
          {
            "riderUnitStateId": 4093,
            "riderName": "Critical Care Rider",
            "unitName": "Critical Care Rider",
            "coverageAmount": null,
            "riderCode": "CCBR4000"
          },
          {
            "riderUnitStateId": 4683,
            "riderName": "Intensive Care Rider",
            "unitName": "Intensive Care Rider",
            "coverageAmount": null,
            "riderCode": "ICUR4000"
          }
        ]
      },
      {
        "planUnitStateCodeId": 36770,
        "planName": "PLAN F",
        "unitName": "PLAN F65",
        "coverageAmount": null,
        "planCode": "CP4000TX04FF",
        "riders": [
          {
            "riderUnitStateId": 4093,
            "riderName": "Critical Care Rider",
            "unitName": "Critical Care Rider",
            "coverageAmount": null,
            "riderCode": "CCBR4000"
          },
          {
            "riderUnitStateId": 4683,
            "riderName": "Intensive Care Rider",
            "unitName": "Intensive Care Rider",
            "coverageAmount": null,
            "riderCode": "ICUR4000"
          }
        ]
      }
    ]
  }
]

```

---

## 📊 Response Structure

### **Root Level**

**Type**: Array de objetos Product

Cada objeto Product contiene:

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `productName` | string | Nombre del producto solicitado |
| `stateCode` | string | Código del estado (2 letras) |
| `plans` | array[Plan] | Array de planes disponibles para este producto en el estado |

### **Plan Object**

| Campo | Tipo | Descripción | Ejemplo |
| --- | --- | --- | --- |
| `planUnitStateCodeId` | integer | ID único del plan para ese estado | `21795` |
| `planName` | string | Nombre del plan | `"Critical Illness"` |
| `unitName` | string | Nombre de la unidad/nivel de cobertura | `"$5,000"` |
| `coverageAmount` | decimal/null | Monto de cobertura en dólares | `5000.00` |
| `planCode` | string | Código único del plan (usado en enrollment) | `"CIATX"` |
| `riders` | array[Rider] | Array de riders opcionales disponibles | `[]` |

### **Rider Object**

| Campo | Tipo | Descripción | Ejemplo |
| --- | --- | --- | --- |
| `riderUnitStateId` | integer | ID único del rider | `4093` |
| `riderName` | string | Nombre del rider | `"Critical Care Rider"` |
| `unitName` | string | Nombre de la unidad del rider | `"Critical Care Rider"` |
| `coverageAmount` | decimal/null | Monto de cobertura del rider | `null` |
| `riderCode` | string | Código único del rider | `"CCBR4000"` |

---

## 🔑 Campos Críticos para Identificación

### **IDs Únicos**

| Campo | Uso | Importancia |
| --- | --- | --- |
| `planUnitStateCodeId` | Identificador único del plan en el estado | 🔴 CRÍTICO - Usar en enrollment |
| `planCode` | Código del plan | 🟡 Importante - Backup para identificación |
| `riderUnitStateId` | Identificador único del rider | 🔴 CRÍTICO - Si se selecciona rider |
| `riderCode` | Código del rider | 🟡 Importante - Backup para identificación |

**IMPORTANTE**: Al hacer enrollment, usa **`planUnitStateCodeId`** y **`riderUnitStateId`** como identificadores principales.

---

---

## ⚠️ Consideraciones Importantes

### **1. Variabilidad por Estado**

- Los planes disponibles **varían según el estado**
- Siempre consulta con el `stateCode` correcto del usuario
- Un mismo producto puede tener diferentes planes en diferentes estados

### **2. Riders Opcionales**

- No todos los planes tienen riders
- Los riders son **opcionales** y pueden aumentar el costo
- Algunos productos tienen array de riders vacío `[]`

### **3. Coverage Amount**

- Puede ser `null` para algunos planes
- En esos casos, usa `unitName` como referencia
- Critical Illness tiene montos explícitos ($5,000, $10,000, etc.)
- Cancer Care Plus usa nombres de plan (PLAN A, PLAN B, etc.)

### **4. IDs Únicos**

- `planUnitStateCodeId` es **CRÍTICO** para enrollment
- Almacena este ID cuando el usuario selecciona un plan
- NO uses solo `planCode`, ya que puede repetirse entre estados

---