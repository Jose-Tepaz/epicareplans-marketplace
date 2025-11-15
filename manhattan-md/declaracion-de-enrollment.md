## 📋 Información General

**Base URL**: `https://api.manhattanlife.com/EnrollmentService.QA`

**Ambiente**: QA/Testing

**Autenticación**: Bearer Token (OAuth 2.0)

---

## 📜 Endpoint: Obtener Declaraciones Requeridas para Enrollment

### **Request**

```
GET /api/Enrollment/Statement

```

**URL Completa**:

```
https://api.manhattanlife.com/EnrollmentService.QA/api/Enrollment/Statement?productName={productName}&planName={planName}&stateCode={stateCode}

```

### **Descripción**

Este endpoint retorna las **declaraciones legales y autorizaciones** que el aplicante debe revisar y aceptar durante el proceso de enrollment. Incluye autorizaciones médicas, términos de fraude, consentimientos electrónicos y avisos de reemplazo de pólizas.

### **Headers**

| Header | Valor | Requerido |
| --- | --- | --- |
| `Authorization` | `Bearer {access_token}` | ✅ Sí |
| `Content-Type` | `application/json` | ✅ Sí |

### **Query Parameters**

| Parámetro | Tipo | Descripción | Ejemplo | Requerido |
| --- | --- | --- | --- | --- |
| `productName` | string | Nombre del producto (URL encoded) | `Cancer Care Plus` | ✅ Sí |
| `planName` | string | Nombre del plan | `PLAN A` | ✅ Sí |
| `stateCode` | string | Código del estado (2 letras) | `TX` | ✅ Sí |

**Nota sobre URL Encoding:**

- `Cancer Care Plus` → `Cancer%20Care%20Plus`
- Espacios deben ser codificados como `%20`

---

## 📥 Response

### **Success Response**

**Status Code**: `200 OK`

**Response Body**:

```json
{
  "id": "63a0a0f55163e5be9567b7c0",
  "fileName": "CANAP_0118.pdf",
  "lastUpdatedBy": null,
  "lastUpdatedOn": "2022-12-19T17:35:49.904Z",
  "isActive": true,
  "insuredAuthCertStatement": {
    "authorization": "<h2>Authorization and Certification</h2><p>I hereby authorize any licensed physician, medical practitioner, hospital, clinic, laboratory, pharmacy, pharmacy benefit manager or other medical facility, insurance or reinsurance company, MIB, Inc. (MIB), Division of Motor Vehicles, the Veterans Administration or other medical or medically-related facility, insurance company or other organization, institution or person, that has any records or knowledge of me or my health or having any non-medical information concerning me to give to the ManhattanLife Insurance and Annuity Company (the Company) or its reinsurers, any such information...</p>",
    "certification": null,
    "important": null,
    "others": [
      "<p>THE EFFECTIVE DATE OF THE POLICY WILL BE THE DATE RECORDED BY THE ADMINISTRATIVE OFFICE. IT IS NOT THE DATE THIS APPLICATION IS SIGNED.</p>",
      "<p><strong>WARNING: Any person who knowingly presents a false or fraudulent claim for payment of a loss or benefit or knowingly presents false information in an application for Insurance is guilty of a crime and may be subject to fines and confinement.</strong></p>"
    ]
  },
  "insuredEFTAuthStatement": {
    "authorization": "<p>I (we) hereby authorize ManhattanLife Insurance and Annuity Company, hereinafter called COMPANY, to initiate debit entries to the account and depository, hereinafter called DEPOSITORY, to debit the same to such account. This authority is to remain in full force and effect until COMPANY and DEPOSITORY have received written notification from me (or either of us) of its termination in such time and in such manner as to afford COMPANY and DEPOSITORY a reasonable opportunity to act on it.</p>",
    "others": null
  },
  "insuredEmailConsent": {
    "authorization": "I give my written consent to allow ManhattanLife Insurance and Annuity Company (the Company) to communicate with me by email to the address(es) listed below. I confirm that I have authorization to provide consent for email to the email address(es) that I provide below and further agree to indemnify and hold harmless the Company for any action or loss arising from any incorrect or false email address(es) provided below. I acknowledge that, should I desire to revoke this written authorization, I will inform the Company in writing of such revocation.",
    "decline": "I decline to give consent to the Company to communicate with me by email. (Do not provide email addresses below.)",
    "others": [
      "<strong>Note:</strong> The applicant electing to allow for notices and communications to be sent to the electronic mail address provided by the policyholder should be aware that the insurer rightfully considers this election to be consent by the applicant that all notices may be sent electronically, including notice of non-renewal and notice of cancellation. Therefore, the applicant should be diligent in updating the electronic mail address provided to the insurer in the event that the address should change."
    ]
  },
  "agentCertStatement": null,
  "nadaReplaceStatement": null,
  "appQuestionStatement": [
    {
      "tag": "macreplacement",
      "statement": "<p><h4>NOTICE TO APPLICANT REGARDING REPLACEMENT OF LIMITED BENEFIT INSURANCE</h4></p><p>According to information you have furnished, you intend to lapse or otherwise terminate existing limited benefit insurance and replace it with a policy to be issued by ManhattanLife Insurance and Annuity Company. Your new policy provides thirty days within which you may decide without cost whether you desire to keep the policy...</p>"
    }
  ]
}

```

---

## 📊 Response Structure

### **Root Level**

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `id` | string | ID único del documento de declaraciones |
| `fileName` | string | Nombre del archivo PDF fuente |
| `lastUpdatedBy` | string/null | Usuario que actualizó por última vez |
| `lastUpdatedOn` | string | Fecha de última actualización (ISO 8601) |
| `isActive` | boolean | Indica si las declaraciones están activas |

### **insuredAuthCertStatement** (Autorización y Certificación)

Declaración de autorización médica y certificación del aplicante.

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `authorization` | string (HTML) | Texto completo de la autorización médica HIPAA |
| `certification` | string/null | Certificación adicional (si aplica) |
| `important` | string/null | Información importante adicional |
| `others` | array[string] | Avisos adicionales (fecha efectiva, advertencia de fraude) |

**Contenido Principal:**

- Autorización HIPAA para compartir información médica
- Autorización MIB (Medical Information Bureau)
- Declaración de veracidad de la información
- Advertencia de fraude de seguros
- Fecha efectiva de la póliza

### **insuredEFTAuthStatement** (Autorización EFT)

Autorización para débitos automáticos (Electronic Funds Transfer).

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `authorization` | string (HTML) | Texto de autorización para débitos bancarios |
| `others` | array[string]/null | Avisos adicionales |

**Contenido Principal:**

- Autorización para débitos automáticos
- Derecho a revocar autorización
- Notificación de cambios

### **insuredEmailConsent** (Consentimiento de Email)

Consentimiento para comunicaciones por email.

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `authorization` | string | Texto de consentimiento para comunicaciones por email |
| `decline` | string | Texto si el usuario rechaza el consentimiento |
| `others` | array[string] | Notas adicionales sobre comunicaciones electrónicas |

**Contenido Principal:**

- Consentimiento para recibir emails
- Responsabilidad de mantener email actualizado
- Inclusión de avisos de cancelación/no renovación
- Opción de declinar

### **agentCertStatement** (Certificación del Agente)

| Campo | Tipo | Descripción |
| --- | --- | --- |
| - | null | Certificación del agente (puede ser null si no aplica) |

### **nadaReplaceStatement** (NADA Replacement)

| Campo | Tipo | Descripción |
| --- | --- | --- |
| - | null | Declaración de reemplazo NADA (puede ser null) |

### **appQuestionStatement** (Declaraciones de Aplicación)

Array de declaraciones adicionales basadas en respuestas del cuestionario.

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `tag` | string | Identificador de la declaración |
| `statement` | string (HTML) | Texto completo de la declaración |

**Tags Comunes:**

- `macreplacement`: Aviso de reemplazo de seguro limitado (Massachusetts)
- Otros tags dependen del estado y producto

---

---

## ⚠️ Consideraciones Importantes

### **1. Variabilidad por Estado**

Las declaraciones pueden **variar según el estado**:

- Massachusetts: Incluye "macreplacement" notice
- Otros estados: Pueden tener declaraciones específicas
- Siempre usar el `stateCode` correcto del usuario

### **2. HTML en Declaraciones**

Las declaraciones vienen en **formato HTML**:

- Usar `dangerouslySetInnerHTML` en React (con precaución)
- Sanitizar HTML si viene de entrada de usuario
- Mantener estilos consistentes con tu aplicación

### **3. Registro Legal**

Es **crítico** registrar:

- ✅ Qué declaraciones se mostraron
- ✅ Cuándo fueron aceptadas
- ✅ IP address del usuario
- ✅ User agent (navegador)
- ✅ Versión exacta del documento (fileName, lastUpdatedOn)

### **4. Reemplazo de Pólizas**

El `appQuestionStatement` con tag `macreplacement` aparece cuando:

- El usuario indicó que **reemplazará una póliza existente**
- Esto puede venir de respuestas del cuestionario
- Es un aviso legal requerido en ciertos estados

---

---

## 🔐 Compliance y Seguridad

### **Regulaciones Aplicables**

| Regulación | Aplica A | Requisitos |
| --- | --- | --- |
| **HIPAA** | Authorization médica | Consentimiento explícito para compartir info médica |
| **E-SIGN Act** | Consentimiento electrónico | Divulgación clara de comunicaciones electrónicas |
| **State Insurance Laws** | Fraud warnings | Advertencia de fraude según el estado |
| **NAIC** | Replacement notices | Aviso si se reemplaza póliza existente |

###