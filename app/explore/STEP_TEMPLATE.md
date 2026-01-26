# Plantilla para Crear Nuevos Pasos

Esta plantilla te guía paso a paso para agregar un nuevo paso al formulario de exploración.

## 📝 Checklist de Implementación

- [ ] 1. Actualizar tipos en `types.ts`
- [ ] 2. Crear función de validación (si aplica) en `utils/validations.ts`
- [ ] 3. Actualizar hook `useExploreForm.ts`
- [ ] 4. Crear componente del paso en `components/steps/`
- [ ] 5. Exportar componente en `components/steps/index.ts`
- [ ] 6. Agregar al flujo en `page.tsx`
- [ ] 7. Actualizar constantes en `constants.ts` (si aplica)
- [ ] 8. Probar el nuevo paso

---

## 1️⃣ Actualizar Tipos

**Archivo**: `types.ts`

```typescript
export interface ExploreFormData {
  // ... campos existentes
  
  // ✨ NUEVO CAMPO
  myNewField: string  // Cambia el tipo según necesites: string, boolean, number, etc.
}

// Si necesita validación, agregar a ValidationStates:
export interface ValidationStates {
  // ... validaciones existentes
  
  // ✨ NUEVO ESTADO DE VALIDACIÓN
  myNewField: {
    isValid: boolean
    error: string
  }
}
```

---

## 2️⃣ Crear Función de Validación

**Archivo**: `utils/validations.ts`

```typescript
/**
 * Valida [descripción de lo que valida]
 * @param value - Valor a validar
 * @returns Resultado de validación
 */
export const validateMyNewField = (value: string): {
  isValid: boolean
  error: string
} => {
  // Validación básica: campo requerido
  if (!value) {
    return {
      isValid: false,
      error: "Este campo es requerido"
    }
  }

  // ✨ AGREGA TUS VALIDACIONES PERSONALIZADAS AQUÍ
  // Ejemplos:
  
  // Longitud mínima
  // if (value.length < 3) {
  //   return {
  //     isValid: false,
  //     error: "Debe tener al menos 3 caracteres"
  //   }
  // }
  
  // Formato específico (email, teléfono, etc.)
  // if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
  //   return {
  //     isValid: false,
  //     error: "Email inválido"
  //   }
  // }
  
  // Rango numérico
  // const num = Number(value)
  // if (isNaN(num) || num < 0 || num > 100) {
  //   return {
  //     isValid: false,
  //     error: "Debe ser un número entre 0 y 100"
  //   }
  // }

  // ✅ Validación exitosa
  return {
    isValid: true,
    error: ""
  }
}

// Si necesitas validación asíncrona (ej: llamada a API):
export const validateMyNewFieldAsync = async (value: string): Promise<{
  isValid: boolean
  error: string
}> => {
  if (!value) {
    return {
      isValid: false,
      error: "Este campo es requerido"
    }
  }

  try {
    // ✨ AGREGA TU LLAMADA A API AQUÍ
    const response = await fetch(`/api/validate-my-field/${value}`)
    const data = await response.json()
    
    if (data.success) {
      return {
        isValid: true,
        error: ""
      }
    } else {
      return {
        isValid: false,
        error: "Valor no válido"
      }
    }
  } catch (error) {
    return {
      isValid: false,
      error: "Error validando el campo. Intenta nuevamente."
    }
  }
}
```

---

## 3️⃣ Actualizar Hook

**Archivo**: `hooks/useExploreForm.ts`

### a) Agregar al estado inicial

```typescript
const [formData, setFormData] = useState<ExploreFormData>({
  // ... campos existentes
  
  // ✨ NUEVO CAMPO CON VALOR POR DEFECTO
  myNewField: '',  // O el valor inicial apropiado
})
```

### b) Agregar estado de validación

```typescript
const [validationStates, setValidationStates] = useState<ValidationStates>({
  // ... validaciones existentes
  
  // ✨ NUEVO ESTADO DE VALIDACIÓN
  myNewField: { isValid: false, error: '' },
})
```

### c) Agregar caso de validación

```typescript
const validateStep = useCallback(async (step: number): Promise<boolean> => {
  setIsValidating(true)
  let isValid = true

  try {
    switch (step) {
      // ... casos existentes (1-6)
      
      // ✨ NUEVO CASO
      case 7: {  // Cambia el número según corresponda
        // Si es validación síncrona:
        const result = validateMyNewField(formData.myNewField)
        
        // Si es validación asíncrona:
        // const result = await validateMyNewFieldAsync(formData.myNewField)
        
        setValidationStates(prev => ({
          ...prev,
          myNewField: result
        }))
        isValid = result.isValid
        break
      }
      
      default:
        isValid = true
    }
  } finally {
    setIsValidating(false)
  }

  return isValid
}, [formData])
```

### d) Agregar verificación de paso válido

```typescript
const isStepValid = useCallback((step: number): boolean => {
  switch (step) {
    // ... casos existentes (1-6)
    
    // ✨ NUEVO CASO
    case 7:  // Cambia el número según corresponda
      return formData.myNewField.trim().length > 0  // Ajusta según tu lógica
    
    default:
      return false
  }
}, [formData])
```

### e) Agregar pre-llenado (opcional)

Si el campo debe pre-llenarse desde el perfil:

```typescript
const prefillFromProfile = useCallback((profile: any) => {
  // ... código existente
  
  // ✨ NUEVO CAMPO
  if (profile.my_new_field) {  // Nombre del campo en la DB
    updates.myNewField = profile.my_new_field
    console.log('  ✓ my_new_field:', profile.my_new_field)
  }
  
  // ...
}, [])
```

---

## 4️⃣ Crear Componente del Paso

**Archivo**: `components/steps/StepMyNewField.tsx`

```typescript
/**
 * Paso X: Mi Nuevo Campo
 * 
 * [Descripción de lo que hace este paso]
 * - [Lista de características]
 * - [o validaciones importantes]
 */

import type React from "react"
import { Input } from "@/components/ui/input"
import { StepContainer } from "../StepContainer"
import { StepNavigation } from "../StepNavigation"
import { ValidationMessage } from "../ValidationMessage"
import type { StepProps } from "../../types"

// ✨ DEFINE LOS PROPS ESPECÍFICOS DEL PASO
interface StepMyNewFieldProps extends StepProps {
  value: string  // Cambia el tipo según tu campo
  onChange: (value: string) => void  // Ajusta el tipo del parámetro
  error: string
  isValid: boolean
}

export const StepMyNewField: React.FC<StepMyNewFieldProps> = ({
  value,
  onChange,
  error,
  isValid,
  onNext,
  onBack,
  isValidating,
  isSubmitting,
  currentStep,
  totalSteps,
}) => {
  return (
    <StepContainer>
      {/* ✨ TÍTULO DEL PASO */}
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center text-balance">
        ¿[Tu pregunta aquí]?
      </h2>

      {/* ✨ CAMPO DE ENTRADA - Elige el componente apropiado */}
      
      {/* Opción 1: Input de texto */}
      <Input
        type="text"  // O "email", "number", etc.
        placeholder="[Tu placeholder aquí]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input-epicare ${
          error ? 'border-red-500' : isValid ? 'border-green-500' : ''
        }`}
      />
      
      {/* Opción 2: Select/Dropdown 
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="input-epicare w-full text-lg font-semibold mb-0">
          <SelectValue placeholder="Selecciona una opción" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Opción 1</SelectItem>
          <SelectItem value="option2">Opción 2</SelectItem>
        </SelectContent>
      </Select>
      */
      
      {/* Opción 3: Calendario
      <Popover>
        <PopoverTrigger asChild>
          <button className="input-epicare w-full justify-start text-left font-normal h-12 px-4 py-3 flex items-center">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? parseDateLocal(value).toLocaleDateString() : <span className="text-white">Elige una fecha</span>}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ? parseDateLocal(value) : undefined}
            onSelect={(date) => onChange(date ? formatDateToLocal(date) : '')}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      */

      {/* ✨ MENSAJES DE VALIDACIÓN */}
      {error && <ValidationMessage type="error" message={error} />}
      {isValid && <ValidationMessage type="success" message="Campo válido" />}

      {/* ✨ NAVEGACIÓN */}
      <StepNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={onBack}
        onNext={onNext}
        canProceed={value.trim().length > 0}  // Ajusta según tu lógica
        isValidating={isValidating}
        isSubmitting={isSubmitting}
      />
    </StepContainer>
  )
}
```

---

## 5️⃣ Exportar el Componente

**Archivo**: `components/steps/index.ts`

```typescript
// ... exports existentes

// ✨ NUEVO EXPORT
export { StepMyNewField } from './StepMyNewField'
```

---

## 6️⃣ Agregar al Flujo Principal

**Archivo**: `page.tsx`

### a) Actualizar TOTAL_STEPS

```typescript
// ✨ INCREMENTAR EL TOTAL
const TOTAL_STEPS = 7  // Era 6, ahora 7 (ajusta según corresponda)
```

### b) Importar el componente

```typescript
import {
  // ... imports existentes
  
  // ✨ NUEVO IMPORT
  StepMyNewField,
} from "./components"
```

### c) Agregar renderizado condicional

```typescript
if (step === 2 && hasAccount === false) {
  return (
    <StepLayout>
      {/* ... pasos existentes (1-6) */}

      {/* ✨ NUEVO PASO */}
      {registrationStep === 7 && (  // Ajusta el número
        <StepMyNewField
          value={formData.myNewField}
          onChange={(value) => updateField('myNewField', value)}
          error={validationStates.myNewField.error}
          isValid={validationStates.myNewField.isValid}
          onNext={handleRegistrationNext}
          onBack={handleRegistrationBack}
          isValidating={isValidating}
          isSubmitting={isSubmitting}
          currentStep={7}  // Ajusta el número
          totalSteps={TOTAL_STEPS}
        />
      )}
    </StepLayout>
  )
}
```

---

## 7️⃣ Actualizar Constantes (Opcional)

**Archivo**: `constants.ts`

Si tu paso usa opciones predefinidas, agrégalas aquí:

```typescript
// ✨ NUEVAS OPCIONES
export const MY_NEW_FIELD_OPTIONS = [
  { value: 'option1', label: 'Opción 1' },
  { value: 'option2', label: 'Opción 2' },
  // ...
] as const

// ✨ NUEVOS MENSAJES DE ERROR
export const ERROR_MESSAGES = {
  // ... errores existentes
  
  MY_NEW_FIELD_REQUIRED: 'Este campo es requerido',
  MY_NEW_FIELD_INVALID: 'Valor inválido',
} as const

// ✨ NUEVOS MENSAJES DE ÉXITO
export const SUCCESS_MESSAGES = {
  // ... éxitos existentes
  
  MY_NEW_FIELD_VALID: 'Campo válido',
} as const
```

---

## 8️⃣ Probar el Nuevo Paso

### Checklist de Pruebas

- [ ] El paso se muestra correctamente en su orden
- [ ] Los campos se pre-llenan si el usuario tiene perfil
- [ ] La validación funciona correctamente
- [ ] Los mensajes de error se muestran apropiadamente
- [ ] Los mensajes de éxito se muestran cuando es válido
- [ ] El botón "Next" solo se habilita cuando el paso es válido
- [ ] El botón "Back" funciona correctamente
- [ ] Los estados de loading se muestran durante validación
- [ ] Los datos se guardan correctamente en sessionStorage
- [ ] El flujo continúa al siguiente paso sin errores

---

## 💡 Tips Adicionales

### Para Campos Complejos

Si tu campo necesita lógica compleja, considera crear un sub-componente:

```typescript
// components/steps/StepMyNewField/FieldComponent.tsx
export const FieldComponent: React.FC<Props> = ({ ... }) => {
  // Lógica compleja aquí
}

// Luego úsalo en StepMyNewField.tsx
```

### Para Validaciones con Dependencias

Si tu validación depende de otros campos:

```typescript
const validateStep = useCallback(async (step: number): Promise<boolean> => {
  // ...
  case 7: {
    // Accede a otros campos del formData
    const result = validateMyNewField(
      formData.myNewField,
      formData.otherField  // ✨ Dependencia
    )
    // ...
  }
}, [formData])  // formData en las dependencias
```

### Para Pasos Opcionales

Si tu paso es condicional:

```typescript
{registrationStep === 7 && someCondition && (
  <StepMyNewField {...props} />
)}
```

Y ajusta la lógica de navegación para saltarlo si no aplica.

---

## 📚 Recursos

- Ver pasos existentes en `components/steps/` como referencia
- Consultar `README.md` para más detalles
- Revisar `types.ts` para entender las interfaces
- Leer `utils/validations.ts` para patrones de validación

---

¡Listo! Con estos pasos deberías poder agregar cualquier nuevo paso al formulario de exploración de manera consistente y mantenible.
