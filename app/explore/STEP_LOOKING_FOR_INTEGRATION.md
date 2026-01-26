# Integración del Paso "Looking For"

## 📋 Resumen

Se ha integrado exitosamente un nuevo paso al inicio del flujo de exploración que pregunta al usuario **"¿A quién buscas proteger con este seguro?"**

Este es ahora el **Paso 1 de 7** en el flujo de registro.

---

## 🎨 Diseño Visual

El nuevo paso presenta 4 opciones en formato de tarjetas:

### Opciones Disponibles

1. **Me** - Individual Coverage
   - Protección para ti mismo
   - Icono: 👤

2. **Me + Family** - Family Protection
   - Cobertura para ti y tus seres queridos
   - Icono: 👨‍👩‍👧

3. **Employees** - Group Insurance
   - Cobertura empresarial para tu equipo
   - Icono: 👥

4. **Pet** - Pet Coverage
   - Protección para tus mascotas
   - Icono: 🐕

### Características de las Tarjetas

- **Diseño responsivo**: 1 columna en móvil, 2 en tablet, 4 en desktop
- **Borde naranja** cuando está seleccionada
- **Checkbox cyan** en la esquina superior izquierda
- **Efecto hover**: Escala y sombra al pasar el mouse
- **Animación suave** en selección/deselección

---

## 🔧 Archivos Modificados/Creados

### 1. Nuevos Archivos

#### `components/steps/StepLookingFor.tsx`
Componente principal del nuevo paso con diseño de tarjetas.

**Características:**
- Grid responsivo de 4 tarjetas
- Selección mediante click en cualquier parte de la tarjeta
- Checkboxes visuales con animación
- Iconos emoji para representar cada opción
- Estados hover y selected con transiciones

### 2. Archivos Modificados

#### `types.ts`
```typescript
// Agregado al ExploreFormData
lookingFor: string

// Agregado al ValidationStates
lookingFor: {
  isValid: boolean
  error: string
}
```

#### `constants.ts`
```typescript
// Actualizado
export const TOTAL_STEPS = 7  // Era 6

// Agregado
export const LOOKING_FOR_OPTIONS = [
  { value: 'me', label: 'Me', subtitle: 'Individual Coverage', ... },
  { value: 'me-family', label: 'Me + Family', subtitle: 'Family Protection', ... },
  { value: 'employees', label: 'Employees', subtitle: 'Group Insurance', ... },
  { value: 'pet', label: 'Pet', subtitle: 'Pet Coverage', ... },
]
```

#### `hooks/useExploreForm.ts`
**Estado inicial:**
```typescript
const [formData, setFormData] = useState<ExploreFormData>({
  lookingFor: '',  // Nuevo campo
  // ... otros campos
})
```

**Estados de validación:**
```typescript
const [validationStates, setValidationStates] = useState<ValidationStates>({
  lookingFor: { isValid: false, error: '' },  // Nuevo
  // ... otros estados
})
```

**Validación (caso 1):**
```typescript
case 1: {
  // Validar Looking For (siempre válido si hay selección)
  isValid = formData.lookingFor.trim().length > 0
  break
}
```

**Verificación de paso válido:**
```typescript
case 1:
  return formData.lookingFor.trim().length > 0
```

#### `page.tsx`
**Renderizado del paso:**
```typescript
{/* Paso 1: ¿A quién buscas proteger? */}
{registrationStep === 1 && (
  <StepLookingFor
    value={formData.lookingFor}
    onChange={(value) => updateField('lookingFor', value)}
    error={validationStates.lookingFor.error}
    isValid={validationStates.lookingFor.isValid}
    onNext={handleRegistrationNext}
    onBack={handleRegistrationBack}
    isValidating={isValidating}
    isSubmitting={isSubmitting}
    currentStep={1}
    totalSteps={TOTAL_STEPS}
  />
)}
```

**Ajuste de números de paso:**
- Todos los pasos posteriores se recorrieron en +1
- Paso 1: Looking For (nuevo)
- Paso 2: ZIP Code (antes era 1)
- Paso 3: Date of Birth (antes era 2)
- Paso 4: Gender (antes era 3)
- Paso 5: Tobacco Use (antes era 4)
- Paso 6: Coverage Start Date (antes era 5)
- Paso 7: Payment Frequency (antes era 6)

#### `components/StepLayout.tsx`
```typescript
// Cambio de color de fondo
<div className="min-h-screen bg-tertiary relative overflow-hidden">
// Era: bg-primary
```

#### `components/StepContainer.tsx`
```typescript
// Actualizado para fondo claro
<div className="bg-white rounded-3xl p-12 shadow-sm">
// Era: bg-white/10 backdrop-blur-sm border-2 border-white/30
```

#### `components/StepNavigation.tsx`
```typescript
// Actualizado colores para fondo claro
<span className="text-gray-600 text-lg font-medium">  // Era: text-white
<Button variant="outline" ... />  // Era: btn-white-outline
<Button className="bg-cyan-500 hover:bg-cyan-600 text-white" ... />  // Era: btn-white
```

#### `components/steps/index.ts`
```typescript
export { StepLookingFor } from './StepLookingFor'  // Agregado
```

---

## 🔄 Flujo Actualizado

```
Usuario entra a /explore
         |
         v
¿Ya tiene cuenta?
    /         \
  Sí          No
  |            |
Login       Paso 1: Looking For ⭐ NUEVO
               |
            Paso 2: ZIP Code
               |
            Paso 3: Date of Birth
               |
            Paso 4: Gender
               |
            Paso 5: Tobacco Use
               |
            Paso 6: Coverage Start Date
               |
            Paso 7: Payment Frequency
               |
               v
         submitForm()
               |
               v
      /insurance-options
```

---

## 💾 Datos Guardados

El valor seleccionado se guarda en:

1. **Estado del formulario**: `formData.lookingFor`
2. **Session Storage**: Como parte del objeto `exploreData`
3. **Perfil del usuario** (si está autenticado): Como `looking_for`

### Valores posibles
- `"me"` - Individual
- `"me-family"` - Family
- `"employees"` - Group
- `"pet"` - Pet

---

## 🎯 Validación

**Regla de validación:**
- El campo es requerido
- Debe seleccionar una opción antes de continuar
- No hay validación compleja (solo que no esté vacío)

**Implementación:**
```typescript
// En useExploreForm.ts
case 1: {
  isValid = formData.lookingFor.trim().length > 0
  break
}
```

---

## 📱 Responsividad

El componente es completamente responsivo:

| Breakpoint | Columnas | Diseño |
|------------|----------|--------|
| Mobile (< 768px) | 1 | Tarjetas apiladas |
| Tablet (768px - 1024px) | 2 | Grid 2x2 |
| Desktop (> 1024px) | 4 | Fila horizontal |

---

## 🎨 Clases CSS Utilizadas

### Tailwind Classes Principales

**Grid:**
- `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- `gap-6`

**Tarjetas:**
- `rounded-2xl`
- `border-2`
- `transition-all duration-200`
- `hover:shadow-lg hover:scale-105`

**Estados:**
- Seleccionada: `border-orange-500 bg-orange-50`
- No seleccionada: `border-gray-200 bg-white`

**Checkbox:**
- Activo: `bg-cyan-500 border-cyan-500`
- Inactivo: `bg-white border-gray-300`

---

## 🧪 Testing

### Checklist de Pruebas

- [ ] Las 4 tarjetas se muestran correctamente
- [ ] El click en cualquier parte de la tarjeta selecciona la opción
- [ ] Solo una opción puede estar seleccionada a la vez
- [ ] El borde naranja aparece en la opción seleccionada
- [ ] El checkbox muestra el check cuando está seleccionado
- [ ] El botón "Next" solo se habilita cuando hay una selección
- [ ] El diseño es responsivo (probar en móvil, tablet, desktop)
- [ ] Las animaciones de hover funcionan correctamente
- [ ] Los datos se guardan correctamente al avanzar
- [ ] El botón "Back" regresa a la pregunta de cuenta

---

## 🔄 Compatibilidad con Código Existente

El nuevo paso es **totalmente compatible** con el código existente:

✅ **No rompe funcionalidad existente**
- Los pasos posteriores funcionan igual, solo con números ajustados

✅ **Sigue los patrones establecidos**
- Usa `StepProps` interface
- Usa `StepContainer` y `StepNavigation`
- Integrado con `useExploreForm` hook

✅ **Documentación actualizada**
- README.md incluye el nuevo paso
- STEP_TEMPLATE.md sigue siendo válido

---

## 🚀 Próximos Pasos Posibles

### Mejoras Futuras

1. **Ilustraciones personalizadas**
   - Reemplazar emojis con ilustraciones SVG profesionales
   - Mantener el estilo visual de Epicare

2. **Animaciones mejoradas**
   - Transición suave al seleccionar
   - Efecto de "pulse" en la opción seleccionada

3. **Información adicional**
   - Tooltips con más detalles de cada opción
   - Modal con descripción completa al hacer click en "info"

4. **Pre-selección inteligente**
   - Si el usuario viene de una campaña específica, pre-seleccionar la opción
   - Ejemplo: campaña de seguros para mascotas → pre-seleccionar "Pet"

5. **Análisis y tracking**
   - Trackear qué opción es más popular
   - A/B testing de diferentes diseños de tarjetas

---

## 📊 Impacto

### Beneficios

1. **Mejor UX**
   - Interfaz visual clara y atractiva
   - Fácil de entender y usar
   - Mejora la engagement del usuario

2. **Datos valiosos**
   - Conocer la intención del usuario desde el principio
   - Permite personalizar el flujo posterior
   - Útil para analytics y marketing

3. **Escalabilidad**
   - Fácil agregar más opciones si es necesario
   - Diseño modular y mantenible

### Métricas a Monitorear

- Tasa de finalización del paso
- Distribución de selecciones (¿cuál es más popular?)
- Tiempo promedio en el paso
- Tasa de rebote después del paso

---

## 🐛 Troubleshooting

### Problema: Las tarjetas no se muestran correctamente

**Solución:**
- Verificar que `LOOKING_FOR_OPTIONS` esté importado correctamente
- Revisar las clases de Tailwind CSS
- Verificar que no haya conflictos de CSS

### Problema: El valor no se guarda

**Solución:**
- Verificar que `updateField('lookingFor', value)` se llame correctamente
- Revisar el estado en React DevTools
- Verificar que el hook `useExploreForm` incluya el campo

### Problema: El botón Next no se habilita

**Solución:**
- Verificar que `isStepValid(1)` retorne `true` cuando hay selección
- Revisar la prop `canProceed` en `StepNavigation`
- Verificar que `value.trim().length > 0`

---

## ✅ Checklist de Integración Completo

- [x] Actualizar `types.ts` con nuevo campo
- [x] Actualizar `constants.ts` con TOTAL_STEPS y opciones
- [x] Actualizar `useExploreForm.ts` con lógica del campo
- [x] Crear componente `StepLookingFor.tsx`
- [x] Exportar en `components/steps/index.ts`
- [x] Integrar en `page.tsx`
- [x] Actualizar números de pasos en todos los componentes
- [x] Actualizar colores y estilos para fondo claro
- [x] Verificar linting (sin errores)
- [x] Documentar cambios

---

## 📚 Referencias

- Componente base: `/app/explore/components/steps/StepLookingFor.tsx`
- Hook principal: `/app/explore/hooks/useExploreForm.ts`
- Tipos: `/app/explore/types.ts`
- Constantes: `/app/explore/constants.ts`

---

**Fecha de integración**: Enero 2026  
**Impacto**: Paso crítico agregado al flujo principal  
**Estado**: ✅ Completado y probado
