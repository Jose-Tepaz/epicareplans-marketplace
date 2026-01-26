# Estructura Visual del Módulo Explore

## 📂 Árbol de Archivos

```
app/explore/
│
├── 📄 page.tsx                          # Componente principal (orquestador)
│   └─ ~350 líneas
│   └─ Responsabilidad: Navegación y flujo general
│
├── 📄 types.ts                          # Tipos e interfaces TypeScript
│   └─ Interfaces: ExploreFormData, ValidationStates, StepProps
│
├── 📄 constants.ts                      # Constantes centralizadas
│   └─ Rutas, mensajes, configuración, opciones
│
├── 📁 components/                       # Componentes UI
│   │
│   ├── 📄 index.ts                      # Exportaciones centralizadas
│   │
│   ├── 🎨 StepLayout.tsx               # Layout general con ilustraciones
│   │   └─ Usado por: TODOS los pasos
│   │   └─ Contiene: Fondo, ilustraciones, contenedor centrado
│   │
│   ├── 🎨 StepContainer.tsx            # Contenedor estilizado
│   │   └─ Usado por: TODOS los pasos
│   │   └─ Estilo: Fondo translúcido, bordes redondeados
│   │
│   ├── 🎨 StepNavigation.tsx           # Navegación (Back/Next)
│   │   └─ Usado por: TODOS los pasos
│   │   └─ Muestra: Indicador de paso, botones, loading
│   │
│   ├── 🎨 ValidationMessage.tsx        # Mensajes de validación
│   │   └─ Usado por: Pasos con validación
│   │   └─ Tipos: Error (rojo), Success (verde)
│   │
│   ├── 🎨 LoadingScreen.tsx            # Pantalla de carga
│   │   └─ Usado por: Estado inicial, carga de perfil
│   │   └─ Muestra: Spinner, mensaje, subtítulo
│   │
│   ├── 🎨 AccountQuestion.tsx          # Pregunta inicial de cuenta
│   │   └─ Opciones: Sí (→ login), No (→ formulario)
│   │
│   └── 📁 steps/                       # Componentes de cada paso
│       │
│       ├── 📄 index.ts                 # Exportaciones de pasos
│       │
│       ├── 1️⃣ StepZipCode.tsx         # Paso 1: Código Postal
│       │   └─ Input de 5 dígitos
│       │   └─ Validación: Formato + API
│       │
│       ├── 2️⃣ StepDateOfBirth.tsx     # Paso 2: Fecha de Nacimiento
│       │   └─ Selector de calendario
│       │   └─ Validación: Edad mínima 18 años
│       │
│       ├── 3️⃣ StepGender.tsx          # Paso 3: Género
│       │   └─ Dropdown (Male, Female, Other)
│       │   └─ Sin validación especial
│       │
│       ├── 4️⃣ StepTobaccoUse.tsx      # Paso 4: Uso de Tabaco
│       │   └─ Radio buttons (Sí/No)
│       │   └─ Si Sí: Selector de fecha de último uso
│       │
│       ├── 5️⃣ StepCoverageStartDate.tsx # Paso 5: Inicio de Cobertura
│       │   └─ Selector de calendario
│       │   └─ Validación: Hoy o fecha futura
│       │
│       └── 6️⃣ StepPaymentFrequency.tsx # Paso 6: Frecuencia de Pago
│           └─ Dropdown (Monthly, Quarterly, etc.)
│           └─ Sin validación especial
│
├── 📁 hooks/                           # Hooks personalizados
│   │
│   └── 🎣 useExploreForm.ts           # Hook principal del formulario
│       └─ ~250 líneas
│       └─ Gestiona:
│           ├─ Estado del formulario (formData)
│           ├─ Estados de validación (validationStates)
│           ├─ Estados de loading (isValidating, isSubmitting)
│           ├─ Función updateField()
│           ├─ Función validateStep()
│           ├─ Función isStepValid()
│           ├─ Función submitForm()
│           └─ Función prefillFromProfile()
│
├── 📁 utils/                           # Funciones utilitarias
│   │
│   ├── 📅 dateHelpers.ts              # Manejo de fechas
│   │   └─ Funciones:
│   │       ├─ formatDateToLocal()
│   │       ├─ parseDateLocal()
│   │       ├─ calculateAge()
│   │       └─ getFutureDate()
│   │
│   └── ✅ validations.ts              # Validaciones
│       └─ Funciones:
│           ├─ validateZipCode()        (async)
│           ├─ validateDateOfBirth()
│           ├─ validateCoverageStartDate()
│           └─ validateLastTobaccoUse()
│
└── 📁 docs/                            # Documentación
    ├── 📖 README.md                    # Documentación principal
    ├── 📋 STEP_TEMPLATE.md             # Plantilla para nuevos pasos
    ├── 📊 REFACTORING_SUMMARY.md       # Resumen de refactorización
    └── 🗺️ STRUCTURE.md                 # Este archivo
```

---

## 🔄 Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│                         page.tsx (Orquestador)                   │
│                                                                   │
│  ┌────────────────┐     ┌─────────────────┐                     │
│  │   useAuth()    │────▶│  loadProfile()  │                     │
│  │   (Context)    │     └─────────────────┘                     │
│  └────────────────┘              │                               │
│                                   ▼                               │
│                          ┌─────────────────┐                     │
│                          │ useExploreForm  │◀─────┐             │
│                          │    (Hook)       │      │             │
│                          └─────────────────┘      │             │
│                                   │               │             │
│                                   ▼               │             │
│                          ┌─────────────────┐      │             │
│                          │    formData     │      │             │
│                          └─────────────────┘      │             │
│                                   │               │             │
│                                   ▼               │             │
│         ┌─────────────────────────┴────────┬──────┴─────┐      │
│         ▼                         ▼        ▼            ▼      │
│   ┌─────────┐            ┌─────────────┐  ┌──────┐  ┌──────┐ │
│   │ Step 1  │───validate─│ validations │  │ Next │  │ Back │ │
│   └─────────┘            └─────────────┘  └──────┘  └──────┘ │
│         │                         │           │         │      │
│         ▼                         ▼           ▼         ▼      │
│   ┌─────────┐            ┌─────────────┐  ┌─────────────────┐│
│   │ Step 2  │            │   Update    │  │   Navigation    ││
│   └─────────┘            │   State     │  │    Handler      ││
│         │                └─────────────┘  └─────────────────┘│
│         ▼                                                      │
│       ...                                                      │
│         │                                                      │
│         ▼                                                      │
│   ┌─────────┐            ┌─────────────┐                     │
│   │ Step 6  │───submit──▶│ submitForm()│                     │
│   └─────────┘            └─────────────┘                     │
│                                   │                            │
└───────────────────────────────────┼────────────────────────────┘
                                    ▼
                           ┌─────────────────┐
                           │  sessionStorage │
                           │  + Profile DB   │
                           └─────────────────┘
                                    │
                                    ▼
                           ┌─────────────────┐
                           │ /insurance-     │
                           │  options        │
                           └─────────────────┘
```

---

## 🎯 Responsabilidades por Archivo

### 📄 page.tsx
```
Responsabilidades:
├─ Gestionar estado de navegación (step, registrationStep)
├─ Cargar perfil del usuario (loadUserProfile)
├─ Manejar elección de cuenta (handleAccountChoice)
├─ Coordinar navegación entre pasos
├─ Renderizar componentes condicionales
└─ Manejar redirecciones

NO hace:
├─ ❌ Validaciones
├─ ❌ Manejo de estado del formulario
└─ ❌ Renderizado de UI específica
```

### 🎣 useExploreForm.ts
```
Responsabilidades:
├─ Mantener estado del formulario
├─ Mantener estados de validación
├─ Actualizar campos (updateField)
├─ Validar pasos (validateStep)
├─ Verificar si paso es válido (isStepValid)
├─ Enviar formulario final (submitForm)
└─ Pre-llenar desde perfil (prefillFromProfile)

NO hace:
├─ ❌ Renderizado
├─ ❌ Navegación
└─ ❌ Redirecciones
```

### 🎨 Componentes de Paso
```
Responsabilidades:
├─ Renderizar UI específica del paso
├─ Mostrar mensajes de validación
├─ Capturar input del usuario
└─ Llamar callbacks apropiados

NO hace:
├─ ❌ Validaciones (delega al hook)
├─ ❌ Gestión de estado (delega al hook)
└─ ❌ Navegación (delega a page.tsx)
```

### ✅ utils/validations.ts
```
Responsabilidades:
├─ Validar formato de datos
├─ Validar reglas de negocio
├─ Llamar APIs de validación
└─ Retornar resultado estándar

NO hace:
├─ ❌ Actualizar estado
├─ ❌ Mostrar UI
└─ ❌ Manejar navegación
```

---

## 🔌 Puntos de Extensión

### Para Agregar un Nuevo Paso

```
1. types.ts
   └─ Agregar campo a ExploreFormData
   └─ Agregar validación a ValidationStates (si aplica)

2. constants.ts
   └─ Actualizar TOTAL_STEPS
   └─ Agregar opciones/mensajes (si aplica)

3. utils/validations.ts
   └─ Crear función validateNewField() (si aplica)

4. hooks/useExploreForm.ts
   └─ Agregar campo al estado inicial
   └─ Agregar caso en validateStep()
   └─ Agregar caso en isStepValid()

5. components/steps/StepNewField.tsx
   └─ Crear componente del paso

6. components/steps/index.ts
   └─ Exportar nuevo componente

7. page.tsx
   └─ Importar componente
   └─ Agregar renderizado condicional
```

### Para Modificar Validación

```
utils/validations.ts
└─ Modificar función existente
   └─ Los cambios se reflejan automáticamente
```

### Para Cambiar Mensajes

```
constants.ts
└─ ERROR_MESSAGES.*
└─ SUCCESS_MESSAGES.*
   └─ Los cambios se reflejan automáticamente
```

---

## 📊 Métricas por Archivo

| Archivo | Líneas | Complejidad | Responsabilidades |
|---------|--------|-------------|-------------------|
| `page.tsx` | ~350 | Media | Orquestación |
| `useExploreForm.ts` | ~250 | Media-Alta | Lógica del formulario |
| `types.ts` | ~50 | Baja | Definiciones |
| `constants.ts` | ~150 | Baja | Configuración |
| `dateHelpers.ts` | ~50 | Baja | Utilidades |
| `validations.ts` | ~100 | Media | Validaciones |
| `StepLayout.tsx` | ~50 | Baja | Layout |
| `StepContainer.tsx` | ~20 | Baja | Estilo |
| `StepNavigation.tsx` | ~60 | Baja | Navegación |
| `ValidationMessage.tsx` | ~30 | Baja | Mensaje |
| `LoadingScreen.tsx` | ~30 | Baja | Loading |
| `AccountQuestion.tsx` | ~30 | Baja | Pregunta |
| `Step*.tsx` (cada uno) | ~80-150 | Baja | UI del paso |

**Total**: ~1,500 líneas (vs 961 líneas originales)
**Ventaja**: Mejor organización > líneas de código

---

## 🎨 Convenciones de Diseño

### Componentes
```typescript
// Estructura estándar de un componente de paso
export const StepName: React.FC<Props> = ({
  // 1. Props de datos
  value,
  onChange,
  
  // 2. Props de validación
  error,
  isValid,
  
  // 3. Props de navegación (de StepProps)
  onNext,
  onBack,
  isValidating,
  isSubmitting,
  currentStep,
  totalSteps,
}) => {
  return (
    <StepContainer>
      {/* Título */}
      <h2>...</h2>
      
      {/* Input */}
      <Input ... />
      
      {/* Validación */}
      {error && <ValidationMessage type="error" ... />}
      {isValid && <ValidationMessage type="success" ... />}
      
      {/* Navegación */}
      <StepNavigation ... />
    </StepContainer>
  )
}
```

### Validaciones
```typescript
// Estructura estándar de una función de validación
export const validateField = (value: string): {
  isValid: boolean
  error: string
} => {
  // 1. Validaciones básicas
  if (!value) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.FIELD_REQUIRED
    }
  }
  
  // 2. Validaciones específicas
  if (/* condición */) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.FIELD_INVALID
    }
  }
  
  // 3. Retorno exitoso
  return {
    isValid: true,
    error: ""
  }
}
```

---

## 🚦 Flujo de Validación

```
Usuario escribe ───▶ updateField() ───▶ formData actualizado
                                              │
                                              ▼
Usuario hace Next ─▶ validateStep() ────▶ validations.ts
                            │                   │
                            │                   ▼
                            │            Ejecuta validación
                            │                   │
                            │                   ▼
                            │            Retorna resultado
                            │                   │
                            ▼                   ▼
                   setValidationStates ◀────────┘
                            │
                            ▼
                   ¿Es válido? ──No──▶ Muestra error
                            │
                          Sí
                            │
                            ▼
                   Avanza al siguiente paso
```

---

## 💾 Flujo de Persistencia

```
                        submitForm()
                             │
                ┌────────────┴────────────┐
                ▼                         ▼
        sessionStorage              Si user autenticado
    (formato compatibilidad)         saveToProfile()
                │                         │
                ├─ insuranceFormData      ├─ zip_code
                ├─ exploreData            ├─ date_of_birth
                └─ insurancePlans         ├─ gender
                                          ├─ is_smoker
                                          └─ last_tobacco_use
```

---

Esta estructura visual te da una comprensión completa de cómo está organizado el módulo y cómo interactúan sus partes. 🎯
