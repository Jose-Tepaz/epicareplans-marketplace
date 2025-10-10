# InsuranceCard Component Documentation

## 📋 Descripción General

El componente `InsuranceCard` es una tarjeta visual interactiva que muestra información de planes de seguro en el marketplace de EpiCare. Proporciona una vista resumida del plan con la opción de ver detalles completos en un modal.

## 🎯 Características Principales

### Vista de Tarjeta (Card View)
- **Header**: Ícono de escudo, nombre del plan y precio mensual
- **Badge "All State"**: Indicador visual para planes disponibles en todos los estados
- **Coverage & Product Type**: Grid de 2 columnas con información básica
- **Benefits Preview**: Muestra los primeros 3 beneficios con indicador de cantidad adicional
- **Action Buttons**: 
  - "See more": Abre modal con detalles completos
  - "Select this plan": Selecciona el plan (funcionalidad pendiente)
- **Brochure Download**: Enlace para descargar el folleto del plan (si está disponible)

### Vista de Modal (Modal View)
- **Header**: Título con ícono y descripción
- **Precio Destacado**: Sección visual con el precio mensual
- **Plan Details**: Información detallada del plan:
  - Plan Type
  - Benefit Description
  - Carrier (si está disponible)
  - Coverage Area
- **All Benefits**: Lista completa de todos los beneficios con íconos de check
- **Brochure Download**: Enlace para descargar el folleto
- **Select Button**: Botón para seleccionar el plan y cerrar el modal

## 🔧 Props

### InsurancePlan Interface

```typescript
interface InsurancePlan {
  id: string                    // Identificador único del plan
  name: string                  // Nombre del plan
  price: number                 // Precio mensual
  coverage: string              // Descripción de cobertura
  productType: string           // Tipo de producto
  benefits: string[]            // Array de beneficios
  allState: boolean             // Disponible en todos los estados
  brochureUrl?: string          // URL del brochure (opcional)
  planType: string              // Tipo de plan (NICAFB, Life, etc.)
  benefitDescription: string    // Descripción de beneficios
  carrierName?: string          // Nombre del carrier (opcional)
}
```

## 📦 Uso

### Ejemplo Básico

```tsx
import { InsuranceCard } from '@/components/insurance-card'

const plan = {
  id: "1",
  name: "Accident Fixed-Benefit",
  price: 25.15,
  coverage: "$25,000/$50,000 Benefit",
  productType: "NHICSupplemental",
  benefits: [
    "One Time Enrollment Fee",
    "LIFE Association Membership",
    "Emergency Room Coverage",
    "Ambulance Services"
  ],
  allState: true,
  planType: "NICAFB",
  benefitDescription: "$25,000/$50,000 Benefit",
  brochureUrl: "https://example.com/brochure.pdf",
  carrierName: "AllState"
}

function InsuranceOptions() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <InsuranceCard plan={plan} />
    </div>
  )
}
```

### Ejemplo con Múltiples Planes

```tsx
function InsuranceOptionsPage() {
  const plans = [
    { id: "1", name: "Plan A", ... },
    { id: "2", name: "Plan B", ... },
    { id: "3", name: "Plan C", ... }
  ]

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {plans.map((plan) => (
        <InsuranceCard key={plan.id} plan={plan} />
      ))}
    </div>
  )
}
```

## 🎨 Estilos y Diseño

### Clases CSS Principales

- **Tarjeta**: `border-2 border-primary rounded-3xl p-6 bg-white hover:shadow-lg`
- **Botones**: Diseño circular con `rounded-full`
- **Modal**: `max-w-2xl max-h-[80vh] overflow-y-auto`
- **Colores**:
  - Primary: Color principal del sitio
  - Cyan: Color de acento para beneficios
  - Green: Color para indicadores de verificación

### Responsive Design

- **Mobile**: Vista de una columna
- **Tablet/Desktop**: Vista de dos columnas (grid)
- **Modal**: Adaptable con scroll automático en contenido largo

## 🔄 Estados del Componente

### isDialogOpen
- **Tipo**: `boolean`
- **Inicial**: `false`
- **Descripción**: Controla la visibilidad del modal de detalles

## 🚀 Funcionalidades

### 1. Vista Previa de Beneficios
- Muestra los primeros 3 beneficios en la tarjeta
- Badge "+X more" si hay más de 3 beneficios
- Vista completa en el modal

### 2. Modal Interactivo
- Se abre al hacer clic en "See more"
- Scroll automático para contenido largo
- Se puede cerrar con:
  - Botón X
  - Tecla ESC
  - Click fuera del modal
  - Botón "Select this plan"

### 3. Descarga de Brochure
- Condicional: solo se muestra si `brochureUrl` existe
- Descarga automática del archivo
- Se abre en nueva pestaña como fallback

## 📊 Integración con API

El componente está diseñado para trabajar con datos de la API de AllState:

```typescript
// Mapeo de datos del API a InsurancePlan
const mappedPlan: InsurancePlan = {
  id: apiPlan.id,
  name: apiPlan.planName,
  price: apiPlan.insuranceRate,
  coverage: apiPlan.benefitDescription,
  productType: apiPlan.productType,
  benefits: apiPlan.benefits.map(b => b.name),
  allState: true,
  planType: apiPlan.planType,
  benefitDescription: apiPlan.benefitDescription,
  brochureUrl: apiPlan.pathToBrochure,
  carrierName: apiPlan.carrierName
}
```

## 🛠️ Dependencias

- `lucide-react`: Íconos (Shield, CheckCircle2, X)
- `@/components/ui/button`: Componente de botón
- `@/components/ui/badge`: Componente de badge
- `@/components/ui/dialog`: Componente de modal/dialog
- `react`: useState hook

## ⚠️ Notas Importantes

1. **Funcionalidad Pendiente**: El botón "Select this plan" actualmente solo cierra el modal. Se debe implementar la lógica de selección de plan.

2. **Validación de Datos**: Asegúrate de que todos los campos obligatorios tengan valores válidos antes de renderizar el componente.

3. **Brochure URL**: El enlace de brochure se renderiza condicionalmente. Si no hay URL, la sección no se muestra.

4. **Accessibility**: El modal incluye manejo de teclado (ESC) y focus management automático.

## 🔮 Mejoras Futuras

- [ ] Implementar lógica de selección de plan
- [ ] Agregar animaciones de transición al abrir/cerrar modal
- [ ] Implementar comparación entre planes
- [ ] Agregar funcionalidad de "favoritos"
- [ ] Integrar con sistema de checkout
- [ ] Agregar tooltips explicativos para términos técnicos
- [ ] Implementar vista de impresión del plan

## 📝 Changelog

### v1.0.0 (Octubre 2024)
- Versión inicial del componente
- Vista de tarjeta con información resumida
- Modal con detalles completos del plan
- Descarga de brochure
- Responsive design
- Documentación completa

## 👨‍💻 Autor

**EpiCare Marketplace Team**

## 📄 Licencia

Privado - EpiCare Marketplace © 2024

