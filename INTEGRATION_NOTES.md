# 📝 Notas de Integración - API All State

## ✅ Estado Actual

### Funcionando
- ✅ Formulario multipasos completo con 6 pasos
- ✅ Endpoint `/api/insurance/quote` respondiendo correctamente
- ✅ Conexión con API de All State establecida
- ✅ Mapeo de datos del formulario a formato All State
- ✅ Manejo de respuestas y errores
- ✅ Página de resultados con fallback data

### En Proceso
- ⏳ Obtener planes reales de All State (actualmente devuelve array vacío)

## 🔧 Configuración

### Variables de Entorno (.env.local)
```bash
ALLSTATE_API_URL=https://qa1-ngahservices.ngic.com/QuotingAPI/api/v1/Rate/AllPlans
ALLSTATE_AUTH_TOKEN=VGVzdFVzZXI6VGVzdDEyMzQ=
ALLSTATE_AGENT_ID=159208
```

### Servidor de Desarrollo
- **Puerto**: 3000 (por defecto)
- **Comando**: `npm run dev`
- **Nota**: Asegurarse de que no haya múltiples instancias corriendo

## 📊 Formato de Request a All State

### Estructura Completa
```json
{
  "PlansToRate": null,
  "ExcludeAvailablePlans": false,
  "agentId": "159208",
  "effectiveDate": "2025-11-25T22:50:17.715Z",
  "zipCode": "07008",
  "applicants": [
    {
      "birthDate": "1994-08-25T22:50:17.715Z",
      "gender": "Male",
      "relationshipType": "Primary",
      "isSmoker": true
    }
  ],
  "paymentFrequency": "Monthly",
  "productTypes": ["NHICSupplemental"]
}
```

### Parámetros que Funcionan en Insomnia
- ZIP Code: `07008`
- Birth Date: `1994-08-25T22:50:17.715Z`
- Gender: `Male`
- Is Smoker: `true`
- Payment Frequency: `Monthly`
- Product Types: `["NHICSupplemental"]`

## 🐛 Problemas Encontrados y Soluciones

### 1. Múltiples Instancias de Next.js
**Problema**: El servidor tardaba mucho en responder
**Causa**: Había múltiples instancias de `next dev` corriendo
**Solución**: 
```bash
pkill -f "next dev"
npm run dev
```

### 2. Respuesta Vacía de All State
**Problema**: La API responde correctamente pero sin planes
**Posibles Causas**:
- Parámetros específicos no tienen planes disponibles en ambiente QA
- Fecha de effectiveDate puede necesitar ser futura
- Combinación específica de parámetros no tiene cobertura

**Para Debugging**:
```bash
curl -X POST http://localhost:3000/api/insurance/quote \
  -H "Content-Type: application/json" \
  -d '{"zipCode":"07008","dateOfBirth":"1994-08-25","gender":"male","smokes":true,"coverageStartDate":"2025-11-25","paymentFrequency":"monthly"}'
```

## 🧪 Testing

### Probar Endpoint Directamente
```bash
curl -X POST http://localhost:3000/api/insurance/quote \
  -H "Content-Type: application/json" \
  -d '{
    "zipCode": "07008",
    "dateOfBirth": "1994-08-25",
    "gender": "male",
    "smokes": true,
    "coverageStartDate": "2025-11-25",
    "paymentFrequency": "monthly"
  }'
```

### Probar Formulario Completo
1. Ve a: `http://localhost:3000/explore`
2. Completa el formulario con los datos de prueba
3. Verifica en la consola del navegador los logs
4. Revisa la respuesta en la página de resultados

## 📝 Próximos Pasos

1. **Verificar con All State**: Confirmar que el ambiente QA tiene datos de prueba disponibles
2. **Probar Diferentes Parámetros**: Intentar con diferentes combinaciones
3. **Revisar Logs**: Verificar los logs del servidor para ver la respuesta exacta de All State
4. **Contactar Soporte**: Si persiste el problema, contactar a All State para verificar credenciales

## 🔗 Endpoints

### Internos
- `POST /api/insurance/quote` - Obtener cotizaciones de seguros
- `POST /api/insurance/debug` - Endpoint de debug (sin llamar a All State)

### Externos
- `POST https://qa1-ngahservices.ngic.com/QuotingAPI/api/v1/Rate/AllPlans` - All State Rate API

## 📚 Archivos Importantes

- `/lib/types/insurance.ts` - TypeScript interfaces
- `/lib/api/allstate.ts` - Cliente API All State (deprecado, usar route directamente)
- `/app/api/insurance/quote/route.ts` - API Route handler
- `/app/explore/page.tsx` - Formulario multipasos
- `/app/insurance-options/page.tsx` - Página de resultados

## 💡 Tips

1. **Siempre verificar que solo haya una instancia de Next.js corriendo**
2. **Los logs en la consola del servidor muestran los requests/responses**
3. **Si la API tarda, verificar conectividad de red**
4. **Usar datos de fallback mientras se resuelve la integración completa**
