# 📋 Enrollment Validation Checklist

## Pre-Enrollment Validation Checklist

Este documento contiene el checklist completo de validaciones que se realizan antes de enviar el enrollment a la API de NGIC.

### ✅ **Campos Requeridos**

#### **Demographics**
- [ ] `zipCode` - Código postal de 5 dígitos
- [ ] `email` - Email válido
- [ ] `address1` - Dirección principal
- [ ] `city` - Ciudad
- [ ] `state` - Estado (código de 2 letras)
- [ ] `phone` - Teléfono de 10 dígitos
- [ ] `applicants` - Array con al menos un aplicante

#### **Applicants (Primary)**
- [ ] `applicantId` - ID único (ej: "primary-001")
- [ ] `firstName` - Nombre
- [ ] `lastName` - Apellido
- [ ] `gender` - Género
- [ ] `dob` - Fecha de nacimiento en formato ISO 8601
- [ ] `ssn` - Número de Seguro Social (9 dígitos)
- [ ] `relationship` - Relación (Primary, Spouse, Dependent)
- [ ] `phoneNumbers` - Array con al menos un teléfono

#### **Coverages**
- [ ] `planKey` - Clave del plan del Quoting API
- [ ] `effectiveDate` - Fecha efectiva en formato ISO 8601
- [ ] `monthlyPremium` - Premium mensual
- [ ] `paymentFrequency` - Frecuencia de pago
- [ ] `applicants` - Referencias a aplicantes con `applicantId`

#### **Payment Information**
- [ ] `accountHolderFirstName` - Nombre del titular
- [ ] `accountHolderLastName` - Apellido del titular
- [ ] **Credit Card:**
  - [ ] `creditCardNumber` - Número de tarjeta válido
  - [ ] `expirationMonth` - Mes de expiración (1-12)
  - [ ] `expirationYear` - Año de expiración
  - [ ] `cvv` - Código CVV
  - [ ] `cardBrand` - Marca de tarjeta
- [ ] **Bank Account (ACH):**
  - [ ] `routingNumber` - Número de ruta (9 dígitos)
  - [ ] `accountNumber` - Número de cuenta
  - [ ] `bankName` - Nombre del banco
  - [ ] `bankDraft` - Tipo de cuenta (Checking/Savings)

#### **Partner Information**
- [ ] `agentNumber` - Número de agente
- [ ] `clientIPAddress` - IP del cliente (obtenida del servidor)

#### **Attestation Information**
- [ ] `referenceId` - ID único de referencia
- [ ] `dateCollected` - Fecha de recolección en formato ISO 8601
- [ ] `type` - Tipo de attestation (ej: "ApplicantEsign")
- [ ] `value` - Valor de la firma
- [ ] `clientIPAddress` - IP del cliente

### 🔍 **Validaciones de Formato**

#### **Email**
- [ ] Formato válido: `user@domain.com`
- [ ] No espacios en blanco
- [ ] Caracteres permitidos: letras, números, @, ., -, _

#### **Teléfono**
- [ ] Exactamente 10 dígitos
- [ ] Solo números (sin guiones, paréntesis, espacios)
- [ ] Ejemplo válido: `3105551234`

#### **SSN**
- [ ] Exactamente 9 dígitos
- [ ] Solo números (sin guiones)
- [ ] Ejemplo válido: `123456789`

#### **ZIP Code**
- [ ] Exactamente 5 dígitos
- [ ] Solo números
- [ ] Ejemplo válido: `90210`

#### **Credit Card**
- [ ] Número válido usando algoritmo de Luhn
- [ ] Longitud correcta según marca:
  - Visa: 13-16 dígitos
  - Mastercard: 16 dígitos
  - Amex: 15 dígitos
  - Discover: 16 dígitos

#### **Routing Number**
- [ ] Exactamente 9 dígitos
- [ ] Solo números
- [ ] Ejemplo válido: `121000248`

### 📊 **Validaciones de Negocio**

#### **Beneficiaries**
- [ ] Si hay beneficiarios, la suma de `allocationPercentage` debe ser exactamente 100%
- [ ] Cada beneficiario debe tener `beneficiaryId` único
- [ ] Fechas de nacimiento en formato ISO 8601

#### **Applicant IDs**
- [ ] `applicantId` debe ser único en toda la aplicación
- [ ] Formato: "primary-001", "additional-001", "additional-002", etc.
- [ ] Consistente entre `demographics.applicants` y `coverages.applicants`

#### **Question Responses**
- [ ] Todas las preguntas requeridas deben tener respuesta
- [ ] No hay respuestas knockout que descalifiquen al aplicante
- [ ] Respuestas en formato correcto según tipo de pregunta

### 🚫 **Validaciones de Knockout**

#### **Health Questions**
- [ ] Verificar que ninguna respuesta tenga `isKnockOut: true`
- [ ] Si hay knockout, mostrar mensaje de descalificación
- [ ] Permitir al usuario cambiar la respuesta

#### **Age Restrictions**
- [ ] Verificar edad mínima según el plan
- [ ] Verificar edad máxima según el plan

#### **Geographic Restrictions**
- [ ] ZIP code debe estar en área de cobertura
- [ ] Estado debe estar disponible para el plan

### 🔒 **Validaciones de Seguridad**

#### **Datos Sensibles**
- [ ] No almacenar números completos de tarjeta en logs
- [ ] Enmascarar SSN en logs (mostrar solo últimos 4 dígitos)
- [ ] No exponer CVV en logs

#### **IP Address**
- [ ] Obtener IP real del cliente desde headers del servidor
- [ ] Fallback a "0.0.0.0" si no se puede obtener
- [ ] Usar IP en `partnerInformation` y `attestationInformation`

### 📝 **Validaciones de Estructura**

#### **Request Structure**
- [ ] `demographics` - Objeto con información demográfica
- [ ] `coverages` - Array de coberturas
- [ ] `paymentInformation` - Información de pago
- [ ] `partnerInformation` - Información del agente
- [ ] `attestationInformation` - Información de firma

#### **Data Types**
- [ ] Fechas en formato ISO 8601
- [ ] Números como números, no strings
- [ ] Booleanos como true/false, no "true"/"false"

### 🎯 **Validaciones Específicas por Plan**

#### **Life Insurance**
- [ ] Beneficiarios requeridos
- [ ] Allocation percentage = 100%
- [ ] Información de beneficiarios completa

#### **Medicare Supplement**
- [ ] `medSuppInfo` requerido
- [ ] `medicarePartAEffectiveDate` y `medicarePartBEffectiveDate`
- [ ] `medicareId` válido

#### **Short Term Medical (STM)**
- [ ] `term` y `numberOfTerms` si aplica
- [ ] `terminationDate` si aplica
- [ ] `insuranceNetwork` si es PPO

### ⚠️ **Errores Comunes a Evitar**

#### **Estructura Incorrecta**
- [ ] ❌ `payment` en lugar de `paymentInformation`
- [ ] ❌ `partner` en lugar de `partnerInformation`
- [ ] ❌ `attestations` array en lugar de `attestationInformation` objeto
- [ ] ❌ `beneficiary` en nivel raíz en lugar de `coverages.beneficiaries`

#### **IDs Faltantes**
- [ ] ❌ `applicantId` faltante en demographics
- [ ] ❌ `beneficiaryId` faltante en beneficiaries
- [ ] ❌ `referenceId` faltante en attestation

#### **Formatos Incorrectos**
- [ ] ❌ Fechas como strings en lugar de ISO 8601
- [ ] ❌ Números como strings en lugar de numbers
- [ ] ❌ `bankDraft` en lugar de `accountType` para ACH

### 🧪 **Testing Checklist**

#### **Datos de Prueba**
- [ ] Usar datos válidos para testing
- [ ] Probar con diferentes tipos de pago (tarjeta/ACH)
- [ ] Probar con múltiples aplicantes
- [ ] Probar con beneficiarios
- [ ] Probar con diferentes planes

#### **Casos Edge**
- [ ] ZIP codes en diferentes estados
- [ ] Edades límite
- [ ] Respuestas knockout
- [ ] Beneficiarios con allocation != 100%

### 📋 **Pre-Envio Final**

Antes de enviar el enrollment, verificar:

1. [ ] **Validación de datos completada sin errores**
2. [ ] **Estructura del request coincide con schema NGIC**
3. [ ] **Todos los campos requeridos presentes**
4. [ ] **Formatos correctos (fechas, números, strings)**
5. [ ] **IDs únicos y consistentes**
6. [ ] **No hay respuestas knockout**
7. [ ] **IP del cliente obtenida correctamente**
8. [ ] **Datos sensibles no expuestos en logs**

---

**Nota:** Este checklist debe ejecutarse automáticamente antes de cada envío de enrollment para garantizar la integridad de los datos y evitar errores en la API de NGIC.
