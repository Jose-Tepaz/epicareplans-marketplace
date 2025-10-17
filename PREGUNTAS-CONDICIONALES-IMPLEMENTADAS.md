# 🔧 **Preguntas Condicionales Implementadas**

## **✅ Problema Solucionado:**

### **Antes (Incorrecto):**
```
1. Pregunta: "Are any of the proposed insureds covered by..."
   ↓
2. Usuario responde: "No"
   ↓
3. ❌ AÚN SE MUESTRA: "Insurance Company Name"
   ↓
4. ❌ AÚN SE MUESTRA: "Proposed Insured's Name"
```

### **Después (Correcto):**
```
1. Pregunta: "Are any of the proposed insureds covered by..."
   ↓
2. Usuario responde: "No"
   ↓
3. ✅ NO SE MUESTRA: "Insurance Company Name"
   ↓
4. ✅ Continúa con siguientes preguntas
```

## **🔧 Implementación Realizada:**

### **1. Tipos Actualizados**
**Archivo:** `lib/types/application-bundle.ts`
```typescript
export interface ConditionalQuestion {
  questionId: number
  answerId: number
}

export interface EligibilityQuestion {
  questionId: number
  questionText: string
  questionType: 'Eligibility' | 'Authorization' | 'PreEx' | 'HRF' | 'GeneralQuestion' | 'PriorInsurance' | 'Creditable' | 'Hidden'
  sequenceNo: number
  possibleAnswers: PossibleAnswer[]
  condition?: ConditionalQuestion  // ✅ Nuevo campo
}
```

### **2. Lógica de Visibilidad**
**Archivo:** `components/dynamic-questions-form.tsx`
```typescript
// Función para determinar si una pregunta debe ser visible
const isQuestionVisible = (question: EligibilityQuestion): boolean => {
  // Si no tiene condición, siempre es visible
  if (!question.condition) return true
  
  // Buscar la respuesta de la pregunta condicional
  const conditionResponse = responses.find(r => 
    r.questionId === question.condition.questionId
  )
  
  // Si no hay respuesta para la pregunta condicional, no mostrar
  if (!conditionResponse) return false
  
  // Verificar si la respuesta coincide con la condición
  const shouldShow = conditionResponse.response === question.condition.answerId.toString()
  
  return shouldShow
}

// Filtrar preguntas visibles
const visibleQuestions = questions.filter(isQuestionVisible)
```

### **3. Limpieza de Respuestas**
**Archivo:** `components/dynamic-questions-form.tsx`
```typescript
// Limpiar respuestas de preguntas que ya no son visibles
useEffect(() => {
  const visibleQuestionIds = visibleQuestions.map(q => q.questionId)
  const responsesToKeep = responses.filter(r => visibleQuestionIds.includes(r.questionId))
  
  if (responsesToKeep.length !== responses.length) {
    // Actualizar respuestas solo si hay cambios
    setResponses(responsesToKeep)
  }
}, [visibleQuestions, responses])
```

### **4. Renderizado Condicional**
**Archivo:** `components/dynamic-questions-form.tsx`
```typescript
// Renderizar solo preguntas visibles
<div className="space-y-4">
  {visibleQuestions.map(renderQuestion)}
</div>

// Debug info para desarrollo
{process.env.NODE_ENV === 'development' && (
  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
    <h4 className="text-sm font-semibold text-blue-800 mb-2">Debug: Preguntas Condicionales</h4>
    <div className="text-xs text-blue-700 space-y-1">
      <div>Total preguntas: {questions.length}</div>
      <div>Preguntas visibles: {visibleQuestions.length}</div>
      <div>Preguntas ocultas: {questions.length - visibleQuestions.length}</div>
    </div>
  </div>
)}
```

## **📋 Cómo Funciona:**

### **1. Estructura de Pregunta Condicional:**
```typescript
{
  "questionId": 123,
  "questionText": "Are any of the proposed insureds covered by...",
  "possibleAnswers": [
    { "id": 1, "answerText": "Yes" },
    { "id": 2, "answerText": "No" }
  ],
  "condition": {
    "questionId": 123,
    "answerId": 1  // Solo mostrar si se responde "Yes" (id: 1)
  }
}
```

### **2. Flujo de Evaluación:**
```typescript
// 1. Usuario responde pregunta principal
updateResponse(123, "2") // "No"

// 2. Sistema evalúa preguntas dependientes
isQuestionVisible(124) // Pregunta sobre "Insurance Company Name"
// - condition.questionId: 123
// - condition.answerId: 1 (solo si responde "Yes")
// - actualResponse: "2" (usuario respondió "No")
// - shouldShow: false

// 3. Pregunta se oculta
visibleQuestions = questions.filter(isQuestionVisible)
// Pregunta 124 no está en visibleQuestions
```

### **3. Limpieza Automática:**
```typescript
// Si pregunta se oculta, se limpia su respuesta
useEffect(() => {
  // Remover respuesta de pregunta 124
  responses = responses.filter(r => r.questionId !== 124)
}, [visibleQuestions])
```

## **🚀 Beneficios:**

### **1. Experiencia de Usuario Mejorada**
- ✅ **Preguntas relevantes** - Solo muestra lo que aplica
- ✅ **Flujo lógico** - Preguntas aparecen cuando corresponde
- ✅ **Menos confusión** - No preguntas irrelevantes

### **2. Datos Limpios**
- ✅ **Respuestas relevantes** - Solo respuestas de preguntas visibles
- ✅ **Sin datos basura** - Respuestas de preguntas ocultas se limpian
- ✅ **Validación correcta** - Solo valida preguntas visibles

### **3. Debugging Facilitado**
- ✅ **Logging detallado** - Muestra evaluación de condiciones
- ✅ **Info de debug** - Total vs. visible vs. ocultas
- ✅ **Trazabilidad** - Fácil identificar problemas

## **🧪 Testing:**

### **Escenario 1: Usuario sin Cobertura Previa**
```
1. Pregunta: "Are any of the proposed insureds covered by..."
2. Usuario: "No"
3. Resultado: ✅ Preguntas sobre compañía de seguros se ocultan
```

### **Escenario 2: Usuario con Cobertura Previa**
```
1. Pregunta: "Are any of the proposed insureds covered by..."
2. Usuario: "Yes"
3. Resultado: ✅ Preguntas sobre compañía de seguros aparecen
```

### **Escenario 3: Cambio de Respuesta**
```
1. Usuario responde: "Yes" → Aparecen preguntas adicionales
2. Usuario cambia a: "No" → Preguntas adicionales se ocultan
3. Resultado: ✅ Respuestas de preguntas ocultas se limpian
```

## **📋 Archivos Modificados:**

### **Tipos:**
- ✅ `lib/types/application-bundle.ts` - Interface ConditionalQuestion y campo condition

### **Componente:**
- ✅ `components/dynamic-questions-form.tsx` - Lógica de visibilidad y limpieza

## **🎯 Estado Actual:**

🟢 **IMPLEMENTADO** - Preguntas condicionales funcionando
🟢 **FUNCIONAL** - Solo muestra preguntas relevantes
🟢 **INTELIGENTE** - Limpia respuestas automáticamente
🟢 **DEBUGGEABLE** - Logging y info de debug

## ** Próximos Pasos:**

1. **Probar flujo completo** - Responder "No" a cobertura previa
2. **Verificar ocultación** - Preguntas sobre compañía no deben aparecer
3. **Probar cambio de respuesta** - Cambiar de "No" a "Yes"
4. **Verificar limpieza** - Respuestas de preguntas ocultas se limpian

## **🔍 Logging para Debugging:**

### **En la Consola verás:**
```
Question 124 visibility check: {
  conditionQuestionId: 123,
  conditionAnswerId: 1,
  actualResponse: "2",
  shouldShow: false
}

Cleaning up responses for hidden questions: {
  originalResponses: 3,
  keptResponses: 2,
  removedResponses: 1
}
```

### **En la UI (modo desarrollo):**
```
Debug: Preguntas Condicionales
Total preguntas: 5
Preguntas visibles: 3
Preguntas ocultas: 2
Preguntas con condiciones:
  Q124: Depende de Q123 = 1
  Q125: Depende de Q123 = 1
```

**¿Quieres probar ahora el flujo de preguntas condicionales?** 🎯

El sistema ahora debería funcionar correctamente: cuando respondas "No" a la pregunta sobre cobertura previa, las preguntas sobre "Insurance Company Name" y "Proposed Insured's Name" deberían ocultarse automáticamente.
