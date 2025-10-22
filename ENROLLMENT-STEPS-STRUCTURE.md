# 📋 Estructura de Pasos del Enrollment - Componentes Individuales

## ✅ **Orden Correcto de los Pasos:**

### **Paso 1: ApplicationBundle Questions** 
- **Componente:** `Step1DynamicQuestions`
- **Archivo:** `components/enrollment-step1-dynamic-questions.tsx`
- **Función:** Carga preguntas dinámicas del ApplicationBundle API
- **Datos:** Se guardan en `formData.questionResponses`

### **Paso 2: Personal Information**
- **Componente:** `Step2PersonalInfo` 
- **Archivo:** `components/enrollment-step2-personal-info.tsx`
- **Función:** Información personal básica (nombre, fecha nacimiento, etc.)
- **Datos:** firstName, lastName, dateOfBirth, gender, ssn, email, phone

### **Paso 3: Health Information**
- **Componente:** `Step3HealthInfo`
- **Archivo:** `components/enrollment-step3-health-info.tsx`
- **Función:** Información de salud (peso, altura, fumador, etc.)
- **Datos:** weight, heightFeet, heightInches, smoker, hasPriorCoverage, hasMedicare

### **Paso 4: Address**
- **Componente:** `Step4Address`
- **Archivo:** `components/enrollment-step4-address.tsx`
- **Función:** Dirección de residencia
- **Datos:** address1, address2, city, state, zipCode

### **Paso 5: Additional Applicants**
- **Componente:** `Step5AdditionalApplicants`
- **Archivo:** `components/enrollment-step5-additional-applicants.tsx`
- **Función:** Aplicantes adicionales (cónyuge, dependientes)
- **Datos:** additionalApplicants[]

### **Paso 6: Coverage Selection**
- **Componente:** `Step6Coverage`
- **Archivo:** `components/enrollment-step6-coverage.tsx`
- **Función:** Selección de planes y fechas efectivas
- **Datos:** selectedPlans, effectiveDate, paymentFrequency

### **Paso 7: Beneficiaries**
- **Componente:** `Step7Beneficiaries`
- **Archivo:** `components/enrollment-step7-beneficiaries.tsx`
- **Función:** Información de beneficiarios
- **Datos:** beneficiaries[]

### **Paso 8: Payment Information**
- **Componente:** `Step8Payment`
- **Archivo:** `components/enrollment-step8-payment.tsx`
- **Función:** Información de pago (tarjeta o ACH)
- **Datos:** paymentMethod, creditCardNumber, routingNumber, etc.

### **Paso 9: Review & Confirmation**
- **Componente:** `Step9Review`
- **Archivo:** `components/enrollment-step9-review.tsx`
- **Función:** Revisión final y confirmación
- **Datos:** Resumen de toda la información

## 🔄 **Flujo de Datos:**

```
1. ApplicationBundle Questions → formData.questionResponses
2. Personal Information → formData.firstName, lastName, etc.
3. Health Information → formData.weight, heightFeet, etc.
4. Address → formData.address1, city, state, etc.
5. Additional Applicants → formData.additionalApplicants
6. Coverage Selection → formData.selectedPlans, effectiveDate
7. Beneficiaries → formData.beneficiaries
8. Payment Information → formData.paymentMethod, creditCardNumber
9. Review & Confirmation → Envío final del enrollment
```

## 📊 **Enrollment Request Final:**

```typescript
{
  demographics: { /* Paso 2 + 3 + 4 */ },
  coverages: [{
    applicants: [{
      questionResponses: formData.questionResponses  // ← Paso 1
    }]
  }],
  paymentInformation: { /* Paso 8 */ },
  // ... otros campos
}
```

## ✅ **Beneficios de los Componentes Individuales:**

1. **Nombres consistentes** - Los componentes coinciden con el número del paso
2. **Flujo lógico** - ApplicationBundle primero, luego información personal
3. **Fácil mantenimiento** - Cada paso tiene su propio archivo
4. **Mejor organización** - Código más limpio y fácil de debuggear
5. **Reutilización** - Componentes pueden ser reutilizados independientemente
6. **Mejor UX** - Usuario ve preguntas dinámicas antes de llenar formulario largo
7. **Testing individual** - Cada componente puede ser probado por separado
8. **Desarrollo paralelo** - Múltiples desarrolladores pueden trabajar en diferentes pasos
