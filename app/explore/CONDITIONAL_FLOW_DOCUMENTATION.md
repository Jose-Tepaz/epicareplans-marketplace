# Documentación del Flujo Condicional - Explore

## 📋 Resumen

El módulo Explore ahora implementa un **flujo condicional** basado en la selección del usuario en el primer paso ("Looking For"). Dependiendo de si el usuario selecciona **"Me"** u otra opción, el formulario mostrará pasos diferentes.

---

## 🔀 Flujos Disponibles

### Flujo 1: "Me" (Individual Coverage) - 8 Pasos

```
Paso 1: Looking For → Selecciona "Me"
   ↓
Paso 2: Insurance Type ⭐ NUEVO
   ↓
Paso 3: ZIP Code
   ↓
Paso 4: Date of Birth
   ↓
Paso 5: Gender
   ↓
Paso 6: Tobacco Use
   ↓
Paso 7: Coverage Start Date
   ↓
Paso 8: Payment Frequency
```

### Flujo 2: Otros (Me + Family, Employees, Pet) - 7 Pasos

```
Paso 1: Looking For → Selecciona otra opción
   ↓
Paso 2: ZIP Code
   ↓
Paso 3: Date of Birth
   ↓
Paso 4: Gender
   ↓
Paso 5: Tobacco Use
   ↓
Paso 6: Coverage Start Date
   ↓
Paso 7: Payment Frequency
```

---

## 🆕 Nuevo Paso: Insurance Type

### Cuándo Aparece
**Solo** cuando el usuario selecciona **"Me"** en el paso "Looking For"

### Diseño
- Título: "Insurance Type?"
- 3 opciones en grid horizontal:
  1. **Life** - Life Protection
  2. **Health** - Medical Coverage  
  3. **Supplementary** - Extra Benefits

### Características Visuales
- Tarjetas con borde naranja al seleccionar
- Checkbox cyan en esquina superior izquierda
- Iconos SVG en esquina inferior derecha:
  - Life: Icono de persona
  - Health: Icono de corazón
  - Supplementary: Icono de más (+)
- Efectos hover: escala y sombra
- Grid responsivo: 1 col (móvil) → 3 col (desktop)

---

## 🔧 Implementación Técnica

### 1. Nuevo Campo en Tipos

```typescript
// types.ts
export interface ExploreFormData {
  lookingFor: string
  insuranceType: string  // ⭐ NUEVO
  zipCode: string
  // ... otros campos
}

export interface ValidationStates {
  lookingFor: { isValid: boolean; error: string }
  insuranceType: { isValid: boolean; error: string }  // ⭐ NUEVO
  // ... otros estados
}
```

### 2. Constantes Actualizadas

```typescript
// constants.ts
export const TOTAL_STEPS = 8  // Actualizado de 7

export const INSURANCE_TYPE_OPTIONS = [
  {
    value: 'life',
    label: 'Life',
    subtitle: 'Life Protection',
    icon: '👤'
  },
  {
    value: 'health',
    label: 'Health',
    subtitle: 'Medical Coverage',
    icon: '🏥'
  },
  {
    value: 'supplementary',
    label: 'Supplementary',
    subtitle: 'Extra Benefits',
    icon: '➕'
  },
]
```

### 3. Lógica Condicional en el Hook

```typescript
// useExploreForm.ts

// Estado inicial incluye insuranceType
const [formData, setFormData] = useState({
  lookingFor: '',
  insuranceType: '',  // ⭐ NUEVO
  // ...
})

// Validación condicional
const validateStep = useCallback(async (step: number) => {
  switch (step) {
    case 2: {
      // Si es "Me", validar Insurance Type
      if (formData.lookingFor === 'me') {
        isValid = formData.insuranceType.trim().length > 0
      } else {
        // Si no, validar ZIP Code
        const result = await validateZipCode(formData.zipCode)
        // ...
      }
      break
    }
    // ... más casos
  }
}, [formData])
```

### 4. Renderizado Condicional en page.tsx

```typescript
// page.tsx

// Función para calcular total de pasos dinámicamente
const getTotalSteps = () => {
  return formData.lookingFor === 'me' ? 8 : 7
}

// Variable para determinar el flujo
const isFlowMe = formData.lookingFor === 'me'

// Renderizado condicional
{registrationStep === 2 && isFlowMe && (
  <StepInsuranceType {...props} />
)}

{registrationStep === 2 && !isFlowMe && (
  <StepZipCode {...props} />
)}
```

---

## 📊 Tabla de Mapeo de Pasos

| # Paso | Flujo "Me" | Otros Flujos |
|--------|------------|--------------|
| 1 | Looking For | Looking For |
| 2 | **Insurance Type** ⭐ | ZIP Code |
| 3 | ZIP Code | Date of Birth |
| 4 | Date of Birth | Gender |
| 5 | Gender | Tobacco Use |
| 6 | Tobacco Use | Coverage Start Date |
| 7 | Coverage Start Date | Payment Frequency |
| 8 | Payment Frequency | - |

---

## 🎯 Validaciones por Flujo

### Flujo "Me"

| Paso | Campo | Validación |
|------|-------|------------|
| 1 | lookingFor | Requerido |
| 2 | insuranceType | Requerido |
| 3 | zipCode | Formato + API |
| 4 | dateOfBirth | Edad mínima 18 |
| 5 | gender | Requerido |
| 6 | smokes + lastTobaccoUse | Condicional |
| 7 | coverageStartDate | Fecha futura |
| 8 | paymentFrequency | Requerido |

### Otros Flujos

| Paso | Campo | Validación |
|------|-------|------------|
| 1 | lookingFor | Requerido |
| 2 | zipCode | Formato + API |
| 3 | dateOfBirth | Edad mínima 18 |
| 4 | gender | Requerido |
| 5 | smokes + lastTobaccoUse | Condicional |
| 6 | coverageStartDate | Fecha futura |
| 7 | paymentFrequency | Requerido |

---

## 🔄 Función `isStepValid()` Condicional

```typescript
const isStepValid = useCallback((step: number): boolean => {
  switch (step) {
    case 2:
      // Si es "Me", validar insurance type
      // Si no, validar ZIP code
      return formData.lookingFor === 'me' 
        ? formData.insuranceType.trim().length > 0
        : formData.zipCode.trim().length > 0
    
    case 3:
      // Si es "Me", validar ZIP code
      // Si no, validar fecha de nacimiento
      return formData.lookingFor === 'me'
        ? formData.zipCode.trim().length > 0
        : formData.dateOfBirth.trim().length > 0
    
    // ... más casos condicionales
  }
}, [formData])
```

---

## 💡 Consideraciones de Diseño

### 1. Número de Pasos Dinámico

El indicador "Step X/Y" se calcula dinámicamente:
- **"Me"**: Muestra "Step X/8"
- **Otros**: Muestra "Step X/7"

```typescript
const getTotalSteps = () => {
  return formData.lookingFor === 'me' ? 8 : 7
}
```

### 2. Navegación entre Pasos

La función `handleRegistrationNext()` y `handleRegistrationBack()` funcionan igual para ambos flujos. La lógica condicional está en el hook `useExploreForm`.

### 3. Botón Back

El botón Back funciona correctamente en ambos flujos:
- Desde paso 2 del flujo "Me" → regresa a "Looking For"
- Los demás pasos regresan al paso anterior según el flujo

---

## 📦 Archivos Modificados/Creados

### Creados
- `components/steps/StepInsuranceType.tsx` - Nuevo componente

### Modificados
- `types.ts` - Agregado `insuranceType`
- `constants.ts` - Agregado `INSURANCE_TYPE_OPTIONS`, actualizado `TOTAL_STEPS`
- `hooks/useExploreForm.ts` - Lógica condicional completa
- `page.tsx` - Renderizado condicional de pasos
- `components/steps/index.ts` - Export del nuevo componente
- Todos los `Step*.tsx` - Actualizados colores (`text-foreground`)

---

## 🧪 Casos de Prueba

### Flujo "Me"
1. ✅ Seleccionar "Me" en paso 1
2. ✅ Aparecer paso "Insurance Type" 
3. ✅ Seleccionar tipo de seguro (Life/Health/Supplementary)
4. ✅ Continuar con ZIP Code (paso 3)
5. ✅ Completar todos los 8 pasos
6. ✅ Verificar que se guarden ambos campos: `lookingFor` e `insuranceType`

### Otros Flujos
1. ✅ Seleccionar "Me + Family" / "Employees" / "Pet" en paso 1
2. ✅ NO aparecer paso "Insurance Type"
3. ✅ Ir directamente a ZIP Code (paso 2)
4. ✅ Completar todos los 7 pasos
5. ✅ Verificar que `insuranceType` quede vacío

### Navegación
1. ✅ Botón Back funciona correctamente
2. ✅ Indicador "Step X/Y" correcto según flujo
3. ✅ No se puede avanzar sin completar el paso actual
4. ✅ Validaciones funcionan según el flujo

---

## 🎨 Estilos Actualizados

Todos los componentes de paso ahora usan:
- `text-foreground` en lugar de `text-white` para títulos
- Fondo: `bg-white` con `shadow-sm`
- Layout general: `bg-tertiary`

Esto permite que el contenido sea legible en el fondo claro.

---

## 🚀 Extensibilidad

### Para Agregar Más Flujos Condicionales

1. **Identificar el punto de bifurcación**
   - ¿En qué paso cambia el flujo?
   - ¿Qué condición lo activa?

2. **Actualizar el hook**
   ```typescript
   // En validateStep()
   case X: {
     if (condición) {
       // Validación flujo A
     } else {
       // Validación flujo B
     }
     break
   }
   ```

3. **Actualizar page.tsx**
   ```typescript
   {registrationStep === X && condición && (
     <StepFlujoA {...props} />
   )}
   
   {registrationStep === X && !condición && (
     <StepFlujoB {...props} />
   )}
   ```

4. **Actualizar getTotalSteps()**
   ```typescript
   const getTotalSteps = () => {
     if (condición1) return 8
     if (condición2) return 9
     return 7 // default
   }
   ```

---

## 📝 Notas Importantes

### 1. Sin Conexión a DB (Por Ahora)
Como indicaste, nos enfocamos en el flujo UI. Los datos se guardan en:
- Estado local del formulario
- sessionStorage (formato actual)
- NO se guarda en base de datos todavía

### 2. Datos Guardados

Al completar el formulario, se guardan:
```typescript
{
  lookingFor: 'me',
  insuranceType: 'life',  // Solo si lookingFor === 'me'
  zipCode: '12345',
  // ... demás campos
}
```

### 3. Futuras Expansiones

El sistema está preparado para:
- Agregar más tipos de seguro
- Más flujos condicionales basados en `insuranceType`
- Pasos adicionales específicos por tipo
- Lógica de negocio compleja

---

## 🔍 Debugging

### Para Verificar el Flujo

```javascript
// En el navegador (Console)
console.log('Looking For:', formData.lookingFor)
console.log('Insurance Type:', formData.insuranceType)
console.log('Current Step:', registrationStep)
console.log('Total Steps:', getTotalSteps())
console.log('Is Flow Me:', formData.lookingFor === 'me')
```

### Logs Implementados

El código incluye logs estratégicos con prefijos:
- 🔍 - Debug info
- ✅ - Success
- ❌ - Error
- 💾 - Save operation

---

## ✅ Checklist de Integración

- [x] Crear tipos para `insuranceType`
- [x] Agregar constantes `INSURANCE_TYPE_OPTIONS`
- [x] Actualizar hook con lógica condicional
- [x] Crear componente `StepInsuranceType`
- [x] Integrar en `page.tsx` con renderizado condicional
- [x] Actualizar función `getTotalSteps()`
- [x] Actualizar todos los componentes con colores correctos
- [x] Verificar validaciones condicionales
- [x] Verificar navegación Back/Next
- [x] Testing sin errores de linting

---

**Estado**: ✅ Completado  
**Flujo Activo**: "Me" con Insurance Type  
**Listo para**: Expansión a más flujos condicionales basados en `insuranceType`

---

## 🎯 Próximos Pasos Sugeridos

1. Agregar flujos específicos por tipo de seguro:
   - Life → Preguntas específicas de vida
   - Health → Preguntas de salud
   - Supplementary → Opciones adicionales

2. Implementar validaciones específicas por tipo

3. Personalizar mensajes según el flujo

4. Agregar analytics para trackear qué flujos son más populares

5. Implementar guardado en base de datos cuando esté listo

---

**Fecha**: Enero 2026  
**Versión**: 2.0 - Flujos Condicionales
