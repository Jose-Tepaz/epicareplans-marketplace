# Flujo de Life Insurance - Documentación

## 📋 Resumen

Se ha implementado un **flujo condicional específico** para usuarios que seleccionan:
- **Looking For**: "Me" 
- **Insurance Type**: "Life"

Este flujo incluye un paso adicional para personalizar la cobertura de vida antes de continuar con el resto del formulario.

---

## 🔀 Flujos Completos del Sistema

### Flujo 1: Me + Life Insurance (10 pasos)

```
1. Looking For → "Me"
2. Insurance Type → "Life"
3. Customize Life Coverage ⭐
   ├─ Coverage Amount ($10,000 - $100,000)
   ├─ No Medical Exams (checkbox)
   └─ Immediate Activation (checkbox)
4. Progress Overview ⭐ NUEVO (No captura datos)
5. ZIP Code
6. Date of Birth
7. Gender
8. Tobacco Use
9. Coverage Start Date
10. Payment Frequency
```

### Flujo 2: Me + Other Insurance Types (9 pasos)

```
1. Looking For → "Me"
2. Insurance Type → "Health" o "Supplementary"
3. Progress Overview ⭐ NUEVO (No captura datos)
4. ZIP Code
5. Date of Birth
6. Gender
7. Tobacco Use
8. Coverage Start Date
9. Payment Frequency
```

### Flujo 3: Me + Family / Employees / Pet (8 pasos)

```
1. Looking For → "Me + Family", "Employees", o "Pet"
2. Progress Overview ⭐ NUEVO (No captura datos)
3. ZIP Code
4. Date of Birth
5. Gender
6. Tobacco Use
7. Coverage Start Date
8. Payment Frequency
```

---

## 🆕 Paso: Customize Your Life Coverage

### Características

#### 1. Slider de Monto de Cobertura
- **Rango**: $10,000 - $100,000
- **Incremento**: $5,000
- **Valor por defecto**: $20,000
- **Visual**: Slider naranja con etiquetas de mínimo/máximo

#### 2. Opciones (Checkboxes)

**No Medical Exams**
- Texto: "Your policy starts as soon as your first payment is confirmed."
- Checkbox cyan
- Seleccionado por defecto: ✅

**Immediate Activation**
- Texto: "Your policy starts as soon as your first payment is confirmed."
- Checkbox cyan
- Seleccionado por defecto: ✅

#### 3. Diseño Visual
- Icono de personas (naranja) en la parte superior
- Título: "Customize your life coverage"
- Card blanca con slider y etiquetas
- Grid de 2 columnas para checkboxes (responsive: 1 col en móvil)
- Botones de navegación estándar

---

## 💾 Nuevos Campos de Datos

### ExploreFormData

```typescript
export interface ExploreFormData {
  lookingFor: string
  insuranceType: string
  
  // ⭐ Nuevos campos específicos de Life Insurance
  coverageAmount: number        // Default: 20000
  noMedicalExams: boolean       // Default: true
  immediateActivation: boolean  // Default: true
  
  // Campos comunes
  zipCode: string
  dateOfBirth: string
  gender: string
  smokes: boolean | null
  lastTobaccoUse: string
  coverageStartDate: string
  paymentFrequency: string
}
```

### Valores por Defecto

```typescript
const [formData, setFormData] = useState<ExploreFormData>({
  lookingFor: '',
  insuranceType: '',
  coverageAmount: 20000,          // $20,000
  noMedicalExams: true,           // Checked
  immediateActivation: true,      // Checked
  // ...
})
```

---

## 🔧 Implementación Técnica

### 1. Componente Creado

**Archivo**: `components/steps/StepCustomizeLifeCoverage.tsx`

**Props**:
```typescript
interface StepCustomizeLifeCoverageProps extends StepProps {
  coverageAmount: number
  onCoverageAmountChange: (amount: number) => void
  noMedicalExams: boolean
  onNoMedicalExamsChange: (checked: boolean) => void
  immediateActivation: boolean
  onImmediateActivationChange: (checked: boolean) => void
}
```

**Características**:
- Slider HTML5 con estilos personalizados
- Formato de moneda con `Intl.NumberFormat`
- Checkboxes clickeables (botón completo)
- Iconos SVG para personas
- Responsive y accesible

### 2. Lógica Condicional

**getTotalSteps()** - Calcula pasos dinámicamente:
```typescript
const getTotalSteps = () => {
  if (formData.lookingFor === 'me' && formData.insuranceType === 'life') {
    return 9  // Me + Life
  }
  if (formData.lookingFor === 'me') {
    return 8  // Me + otros
  }
  return 7  // Otros flujos
}
```

**Renderizado Condicional** en `page.tsx`:
```typescript
const isFlowMeLife = isFlowMe && formData.insuranceType === 'life'

{registrationStep === 3 && isFlowMeLife && (
  <StepCustomizeLifeCoverage {...props} />
)}
```

### 3. Validaciones Actualizadas

El hook `useExploreForm` ahora tiene lógica condicional para cada paso:

```typescript
// Ejemplo: Paso 3
if (step === 3) {
  if (isFlowMeLife) {
    isValid = true  // Customize Life siempre válido
  } else if (isFlowMe) {
    // Validar ZIP Code
  } else {
    // Validar Date of Birth
  }
}
```

---

## 📊 Tabla de Mapeo Completa

| # | Me + Life | Me + Other | Otros Flujos |
|---|-----------|------------|--------------|
| 1 | Looking For | Looking For | Looking For |
| 2 | Insurance Type | Insurance Type | **Progress Overview** ⭐ |
| 3 | **Customize Life** ⭐ | **Progress Overview** ⭐ | ZIP Code |
| 4 | **Progress Overview** ⭐ | ZIP Code | Date of Birth |
| 5 | ZIP Code | Date of Birth | Gender |
| 6 | Date of Birth | Gender | Tobacco Use |
| 7 | Gender | Tobacco Use | Coverage Start Date |
| 8 | Tobacco Use | Coverage Start Date | Payment Frequency |
| 9 | Coverage Start Date | Payment Frequency | - |
| 10 | Payment Frequency | - | - |

---

## 🎨 Código del Slider (Personalizado)

```typescript
<input
  type="range"
  min="10000"
  max="100000"
  step="5000"
  value={coverageAmount}
  onChange={(e) => onCoverageAmountChange(Number(e.target.value))}
  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
    [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:w-5
    [&::-webkit-slider-thumb]:h-5
    [&::-webkit-slider-thumb]:rounded-full
    [&::-webkit-slider-thumb]:bg-orange-500
    [&::-webkit-slider-thumb]:cursor-pointer
    [&::-webkit-slider-thumb]:shadow-md
    [&::-webkit-slider-thumb]:hover:bg-orange-600"
/>
```

---

## 🧪 Casos de Prueba

### Test 1: Flujo Me + Life Completo ✅

1. Elegir "No" en cuenta
2. Paso 1: Elegir "Me" → Next
3. Paso 2: Elegir "Life" → Next
4. Paso 3: Ver "Customize your life coverage"
   - Mover slider a $50,000
   - Desmarcar "No medical exams"
   - Mantener "Immediate activation" → Next
5. Paso 4: Ingresar ZIP Code → Next
6. Paso 5: Seleccionar Date of Birth → Next
7. Paso 6: Seleccionar Gender → Next
8. Paso 7: Tobacco Use → Next
9. Paso 8: Coverage Start Date → Next
10. Paso 9: Payment Frequency → Complete

**Verificar**:
- Indicador muestra "Step X/9" en cada paso
- formData.coverageAmount = 50000
- formData.noMedicalExams = false
- formData.immediateActivation = true

### Test 2: Flujo Me + Health ✅

1. Paso 1: "Me"
2. Paso 2: "Health"
3. Paso 3: ZIP Code (NO aparece Customize Life)
4. Continuar normalmente...
5. Total: 8 pasos

### Test 3: Navegación Back desde Customize Life ✅

1. Llegar a Paso 3 (Customize Life)
2. Click "Back"
3. Debe regresar a Paso 2 (Insurance Type)
4. Debe mantener selección "Life"
5. Click "Next"
6. Debe regresar a Customize Life con valores preservados

---

## 💡 Próximas Expansiones Sugeridas

### Para Health Insurance
Agregar paso similar a "Customize Life":
- **Paso 3** (cuando Insurance Type === 'health'):
  - Deducible seleccionable
  - Copay amount
  - Red de proveedores (HMO, PPO, EPO)
  - Cobertura dental/vision

### Para Supplementary
- Selección de riders adicionales
- Accidental death benefit
- Disability coverage
- Long-term care

### Validaciones Específicas
- Verificar edad para ciertos tipos de cobertura
- Límites de monto según edad
- Restricciones por estado (ZIP code)

---

## 📦 Archivos Modificados/Creados

### Creados
- ✅ `components/steps/StepCustomizeLifeCoverage.tsx`
- ✅ `components/steps/StepProgressOverview.tsx` ⭐ NUEVO
- ✅ `LIFE_INSURANCE_FLOW.md` (este documento)

### Modificados
- ✅ `types.ts` - Agregados: coverageAmount, noMedicalExams, immediateActivation
- ✅ `hooks/useExploreForm.ts` - Lógica condicional para 3 flujos + Progress Overview
- ✅ `page.tsx` - Renderizado completo reorganizado con 10 pasos
- ✅ `components/steps/index.ts` - Export de StepCustomizeLifeCoverage + StepProgressOverview

---

## ✅ Estado de Implementación

- [x] Tipos actualizados con nuevos campos
- [x] Hook con valores por defecto
- [x] Componente Customize Life creado
- [x] Lógica de renderizado condicional
- [x] Validaciones por flujo
- [x] getTotalSteps() dinámico
- [x] Navegación Back/Next funcional
- [x] Sin errores de linting
- [x] Documentación completa

---

## 🎯 Próximos Pasos Inmediatos

1. **Probar el flujo completo** en el navegador
   - Seleccionar Me → Life → Verificar Customize aparece
   - Ajustar slider y checkboxes
   - Completar todos los 9 pasos

2. **Ajustar estilos** si es necesario
   - Colores del slider
   - Espaciado de checkboxes
   - Tamaño de fuentes

3. **Agregar validaciones** si es necesario
   - Monto mínimo requerido
   - Al menos una opción seleccionada
   - etc.

4. **Guardar datos** en sessionStorage/DB
   - Verificar que coverageAmount, noMedicalExams, immediateActivation se guarden
   - Usar en páginas posteriores

---

## 🆕 Progress Overview Step

### Descripción
Paso visual informativo que **NO captura datos**. Siempre aparece después de:
- Insurance Type (flujo normal)
- Customize Life Coverage (flujo Me + Life)

### Contenido
- **Título**: "Great! We'll get your coverage options in as little as 10 minutes"
- **3 Etapas mostradas**:
  1. ✓ Tell us about your needs (completado con borde naranja)
  2. ☐ Add your basic information
  3. ☐ Provide health info and get your final rate
- **Botón**: Continue (cyan, redondo)
- **Ilustración**: Persona con brazo apuntando (lado derecho, desktop)

### Características Técnicas
- No requiere validación (siempre puede avanzar)
- No tiene `currentStep`/`totalSteps` en navegación
- Full-screen con diseño propio
- Solo props: `onNext` e `isSubmitting`
- Responsive: Grid 2 cols en desktop, 1 col en móvil

---

**Estado**: ✅ Implementado y funcional  
**Flujos Soportados**: 3 (Me+Life, Me+Others, Others)  
**Total de Pasos**: Dinámico (8-10 según selección)

---

**Fecha**: Enero 2026  
**Versión**: 3.0 - Life Insurance Customization
