# Explore Module - Documentación

## 📋 Descripción General

El módulo **Explore** es un flujo de formulario multi-paso que recopila información del usuario antes de mostrar opciones de seguro. Está completamente refactorizado y componentizado para facilitar el mantenimiento y la extensibilidad.

## 🏗️ Estructura del Módulo

```
app/explore/
├── page.tsx                    # Componente principal (orquestador)
├── types.ts                    # Tipos TypeScript compartidos
├── README.md                   # Esta documentación
│
├── components/                 # Componentes UI
│   ├── index.ts               # Exportaciones centralizadas
│   ├── AccountQuestion.tsx    # Pregunta inicial de cuenta
│   ├── LoadingScreen.tsx      # Pantalla de carga
│   ├── StepContainer.tsx      # Contenedor estilizado
│   ├── StepLayout.tsx         # Layout con ilustraciones
│   ├── StepNavigation.tsx     # Navegación (Back/Next)
│   ├── ValidationMessage.tsx  # Mensajes de error/éxito
│   │
│   └── steps/                 # Componentes de cada paso
│       ├── index.ts           # Exportaciones de pasos
│       ├── StepZipCode.tsx           # Paso 1: Código Postal
│       ├── StepDateOfBirth.tsx       # Paso 2: Fecha de Nacimiento
│       ├── StepGender.tsx            # Paso 3: Género
│       ├── StepTobaccoUse.tsx        # Paso 4: Uso de Tabaco
│       ├── StepCoverageStartDate.tsx # Paso 5: Inicio de Cobertura
│       └── StepPaymentFrequency.tsx  # Paso 6: Frecuencia de Pago
│
├── hooks/                      # Hooks personalizados
│   └── useExploreForm.ts      # Hook principal del formulario
│
└── utils/                      # Utilidades
    ├── dateHelpers.ts         # Funciones de manejo de fechas
    └── validations.ts         # Funciones de validación
```

## 🎯 Flujo de Usuario

### Paso Inicial (Opcional)
- **Pregunta de Cuenta**: ¿Ya tienes cuenta?
  - **Sí** → Redirige a `/login`
  - **No** → Continúa al formulario

### Pasos del Formulario (1-6)

1. **Código Postal** (`StepZipCode`)
   - Validación de formato (5 dígitos)
   - Validación contra API de direcciones
   - Se guarda en `localStorage` para uso posterior

2. **Fecha de Nacimiento** (`StepDateOfBirth`)
   - Selector de calendario
   - Validación: Debe ser mayor de 18 años

3. **Género** (`StepGender`)
   - Dropdown selector
   - Opciones: Male, Female, Other

4. **Uso de Tabaco** (`StepTobaccoUse`)
   - Pregunta Sí/No
   - Si "Sí": solicita fecha de último uso

5. **Fecha de Inicio de Cobertura** (`StepCoverageStartDate`)
   - Selector de calendario
   - Validación: Debe ser hoy o fecha futura
   - Valor predeterminado: 1 mes desde hoy

6. **Frecuencia de Pago** (`StepPaymentFrequency`)
   - Dropdown selector
   - Opciones: Monthly, Quarterly, Semi-Annually, Annually

## 🔧 Componentes Principales

### `page.tsx` - Componente Orquestador

El componente principal maneja:
- Estado de navegación entre pasos
- Lógica de autenticación y carga de perfil
- Renderizado condicional de cada paso
- Redirección automática si tiene datos completos

### `useExploreForm` - Hook del Formulario

Hook personalizado que centraliza:
- **Estado del formulario**: Todos los campos en un solo objeto
- **Estados de validación**: Para cada campo validable
- **Funciones de actualización**: `updateField()`
- **Funciones de validación**: `validateStep()`
- **Envío del formulario**: `submitForm()`
- **Pre-llenado**: `prefillFromProfile()`

### Componentes de Paso

Cada paso es un componente independiente que:
- Recibe props estandarizadas (`StepProps`)
- Maneja su propia UI específica
- Delega la lógica al hook `useExploreForm`
- Usa componentes compartidos (`StepNavigation`, `ValidationMessage`, etc.)

## ➕ Cómo Agregar un Nuevo Paso

### 1. Actualizar Tipos

En `types.ts`, agrega el nuevo campo a `ExploreFormData`:

```typescript
export interface ExploreFormData {
  // ... campos existentes
  newField: string  // Tu nuevo campo
}
```

Si necesita validación, agrégalo a `ValidationStates`:

```typescript
export interface ValidationStates {
  // ... validaciones existentes
  newField: {
    isValid: boolean
    error: string
  }
}
```

### 2. Crear Validación (si aplica)

En `utils/validations.ts`, agrega una función de validación:

```typescript
export const validateNewField = (value: string): {
  isValid: boolean
  error: string
} => {
  if (!value) {
    return {
      isValid: false,
      error: "Este campo es requerido"
    }
  }
  
  // Tu lógica de validación aquí
  
  return {
    isValid: true,
    error: ""
  }
}
```

### 3. Actualizar el Hook

En `hooks/useExploreForm.ts`:

**a) Agregar campo al estado inicial:**
```typescript
const [formData, setFormData] = useState<ExploreFormData>({
  // ... campos existentes
  newField: '',  // Valor por defecto
})
```

**b) Agregar validación al estado:**
```typescript
const [validationStates, setValidationStates] = useState<ValidationStates>({
  // ... validaciones existentes
  newField: { isValid: false, error: '' },
})
```

**c) Agregar caso de validación:**
```typescript
const validateStep = useCallback(async (step: number): Promise<boolean> => {
  // ... casos existentes
  case 7: {  // Número de tu nuevo paso
    const result = validateNewField(formData.newField)
    setValidationStates(prev => ({
      ...prev,
      newField: result
    }))
    isValid = result.isValid
    break
  }
}, [formData])
```

**d) Agregar verificación de paso válido:**
```typescript
const isStepValid = useCallback((step: number): boolean => {
  switch (step) {
    // ... casos existentes
    case 7:  // Número de tu nuevo paso
      return formData.newField.trim().length > 0
    // ...
  }
}, [formData])
```

### 4. Crear Componente del Paso

En `components/steps/`, crea `StepNewField.tsx`:

```typescript
/**
 * Paso 7: Nuevo Campo
 * 
 * Descripción de lo que hace este paso.
 */

import type React from "react"
import { Input } from "@/components/ui/input"
import { StepContainer } from "../StepContainer"
import { StepNavigation } from "../StepNavigation"
import { ValidationMessage } from "../ValidationMessage"
import type { StepProps } from "../../types"

interface StepNewFieldProps extends StepProps {
  value: string
  onChange: (value: string) => void
  error: string
  isValid: boolean
}

export const StepNewField: React.FC<StepNewFieldProps> = ({
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
      <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center text-balance">
        ¿Cuál es tu nuevo campo?
      </h2>

      <Input
        type="text"
        placeholder="Ingresa tu respuesta"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input-epicare ${
          error ? 'border-red-500' : isValid ? 'border-green-500' : ''
        }`}
      />

      {error && <ValidationMessage type="error" message={error} />}
      {isValid && <ValidationMessage type="success" message="Campo válido" />}

      <StepNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={onBack}
        onNext={onNext}
        canProceed={value.trim().length > 0}
        isValidating={isValidating}
        isSubmitting={isSubmitting}
      />
    </StepContainer>
  )
}
```

### 5. Exportar el Componente

En `components/steps/index.ts`:

```typescript
export { StepNewField } from './StepNewField'
```

### 6. Agregar al Flujo Principal

En `page.tsx`:

**a) Actualizar constante:**
```typescript
const TOTAL_STEPS = 7  // Era 6, ahora 7
```

**b) Importar el componente:**
```typescript
import {
  // ... imports existentes
  StepNewField,
} from "./components"
```

**c) Agregar renderizado condicional:**
```typescript
{/* Paso 7: Nuevo Campo */}
{registrationStep === 7 && (
  <StepNewField
    value={formData.newField}
    onChange={(value) => updateField('newField', value)}
    error={validationStates.newField.error}
    isValid={validationStates.newField.isValid}
    onNext={handleRegistrationNext}
    onBack={handleRegistrationBack}
    isValidating={isValidating}
    isSubmitting={isSubmitting}
    currentStep={7}
    totalSteps={TOTAL_STEPS}
  />
)}
```

### 7. Actualizar Pre-llenado (si aplica)

Si el campo debe pre-llenarse desde el perfil del usuario, actualizar en `hooks/useExploreForm.ts`:

```typescript
const prefillFromProfile = useCallback((profile: any) => {
  // ... código existente
  
  if (profile.new_field) {
    updates.newField = profile.new_field
    console.log('  ✓ new_field:', profile.new_field)
  }
  
  // ...
}, [])
```

## 📝 Convenciones de Código

### Comentarios
- Cada archivo tiene un comentario de encabezado explicando su propósito
- Funciones importantes tienen documentación JSDoc
- Logs de consola para debugging están claramente etiquetados

### Naming
- Componentes: `PascalCase` (ej: `StepZipCode`)
- Hooks: `camelCase` con prefijo `use` (ej: `useExploreForm`)
- Funciones: `camelCase` (ej: `validateZipCode`)
- Constantes: `UPPER_SNAKE_CASE` (ej: `TOTAL_STEPS`)

### Props
- Usar interfaces específicas que extiendan `StepProps`
- Destructurar props en la firma del componente
- Props en orden: valores, callbacks, estados, configuración

## 🧪 Testing (Recomendaciones Futuras)

Para agregar tests, considera:
- Tests unitarios para funciones de validación (`utils/validations.ts`)
- Tests unitarios para helpers de fecha (`utils/dateHelpers.ts`)
- Tests de integración para el hook `useExploreForm`
- Tests de componente para cada paso individual
- Tests E2E para el flujo completo

## 🐛 Debugging

### Logs de Consola
El código incluye logs estratégicos con prefijos emoji:
- 🔍 - Información de debugging
- ✅ - Operación exitosa
- ❌ - Error
- ⚠️ - Advertencia
- 💾 - Operación de guardado
- 🚀 - Navegación/redirección
- ⏳ - Estado de espera

### Estados de Carga
El sistema tiene 3 estados de carga:
- `authLoading`: Verificando autenticación
- `isLoadingProfile`: Cargando perfil del usuario
- `isValidating`: Validando paso actual
- `isSubmitting`: Enviando formulario final

## 🔄 Flujo de Datos

1. **Entrada del Usuario** → `updateField()` en el hook
2. **Validación** → `validateStep()` ejecuta validaciones específicas
3. **Navegación** → `handleRegistrationNext()` avanza si es válido
4. **Envío Final** → `submitForm()` en el último paso
5. **Persistencia** → Guarda en `sessionStorage` y perfil de usuario
6. **Redirección** → Navega a `/insurance-options`

## 📦 Dependencias Principales

- `next`: Framework React
- `react`: Biblioteca UI
- `@/components/ui/*`: Componentes UI base (shadcn/ui)
- `@/contexts/auth-context`: Contexto de autenticación
- `@/lib/api/enrollment-db`: API de perfil de usuario
- `@/lib/utils/session-storage`: Utilidades de storage

## 🚀 Próximos Pasos Sugeridos

1. Agregar tests unitarios y de integración
2. Implementar persistencia local (localStorage) para recuperación de sesión
3. Agregar animaciones de transición entre pasos
4. Implementar barra de progreso visual
5. Agregar tooltip de ayuda en cada paso
6. Soporte para internacionalización (i18n)

---

**Última actualización**: Enero 2026
**Mantenedores**: Equipo Epicare
