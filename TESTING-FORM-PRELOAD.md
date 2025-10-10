# Guía de Prueba: Precarga de Datos del Formulario

## 🎯 Objetivo
Verificar que los datos del formulario multipaso se precarguen correctamente en el modal de edición de la página `insurance-options`.

## 📋 Flujo de Prueba

### 1. Completar el Formulario Multipaso

**Ruta:** `/explore`

Completa todos los pasos del formulario:

1. **Step 1**: ZIP Code
   - Ejemplo: `90210`

2. **Step 2**: Date of Birth  
   - Ejemplo: `1990-01-15`

3. **Step 3**: Gender
   - Ejemplo: `male`

4. **Step 4**: Smokes/Tobacco Use
   - Selecciona: `No` o `Yes`
   - Si `Yes`, ingresa fecha: `2024-01-01`

5. **Step 5**: Coverage Start Date
   - Ejemplo: `2025-02-01`

6. **Step 6**: Payment Frequency
   - Ejemplo: `monthly`

### 2. Verificar Almacenamiento en SessionStorage

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Ver los datos del formulario guardados
console.log(JSON.parse(sessionStorage.getItem('insuranceFormData')))

// Deberías ver algo como:
// {
//   zipCode: "90210",
//   dateOfBirth: "1990-01-15",
//   gender: "male",
//   smokes: false,
//   lastTobaccoUse: "",
//   coverageStartDate: "2025-02-01",
//   paymentFrequency: "monthly"
// }
```

### 3. Navegar a Insurance Options

**Ruta:** `/insurance-options`

Verifica que:
- ✅ Los planes se muestran correctamente
- ✅ En la parte superior se muestra un resumen de tus datos:
  - ZIP Code: 90210
  - Age: (calculada automáticamente)
  - Gender: Male
  - Smoker: No

### 4. Abrir Modal de Edición

1. Click en el botón **"Edit Information"** (esquina superior derecha)
2. El modal debe abrirse

### 5. Verificar Precarga de Datos

En el modal, verifica que TODOS los campos estén precargados:

#### ✅ Checklist de Campos Precargados:

- [ ] **ZIP Code**: Debe mostrar el valor ingresado (ej: `90210`)
- [ ] **Date of Birth**: Debe mostrar la fecha ingresada (ej: `1990-01-15`)
- [ ] **Gender**: Debe tener seleccionado el valor correcto (ej: `Male`)
- [ ] **Smokes**: El botón correcto debe estar seleccionado (`Yes` o `No`)
- [ ] **Last Tobacco Use**: Solo visible si `Smokes = Yes`, debe mostrar la fecha
- [ ] **Coverage Start Date**: Debe mostrar la fecha ingresada
- [ ] **Payment Frequency**: Debe tener seleccionado el valor correcto

#### Indicador Visual:

Debes ver el mensaje verde:
```
✓ Your previous information has been loaded
```

### 6. Editar Datos

1. Cambia el **ZIP Code** a otro valor (ej: `10001`)
2. Click en **"Update & Search Plans"**
3. Verifica:
   - ✅ Aparece spinner "Updating..."
   - ✅ El modal se cierra automáticamente
   - ✅ Los planes se actualizan
   - ✅ El resumen en la parte superior muestra el nuevo ZIP Code

### 7. Reabrir Modal para Verificar

1. Click nuevamente en **"Edit Information"**
2. Verifica que el nuevo ZIP Code (`10001`) está precargado
3. Los demás campos deben mantener los valores originales

## 🐛 Debugging

### Si los datos NO se cargan:

1. **Verifica SessionStorage:**
   ```javascript
   console.log(sessionStorage.getItem('insuranceFormData'))
   ```
   - Si es `null`: Los datos no se guardaron
   - Si tiene datos: Verifica el formato JSON

2. **Revisa Console Logs:**
   - Al completar formulario: `"Saving form data to sessionStorage:"`
   - Al cargar página: `"Loaded form data from sessionStorage:"`
   - Si no hay datos: `"No stored form data found"`

3. **Prueba Manual:**
   ```javascript
   // Guarda datos manualmente en console
   sessionStorage.setItem('insuranceFormData', JSON.stringify({
     zipCode: "90210",
     dateOfBirth: "1990-01-15",
     gender: "male",
     smokes: false,
     lastTobaccoUse: "",
     coverageStartDate: "2025-02-01",
     paymentFrequency: "monthly"
   }))
   
   // Recarga la página
   location.reload()
   ```

### Si el modal muestra campos vacíos:

1. Verifica que `formData` state tiene valores:
   ```javascript
   // En React DevTools, busca el componente InsuranceOptionsPage
   // Verifica el state "formData"
   ```

2. Verifica que los inputs tienen el atributo `value`:
   ```jsx
   <Input value={formData.zipCode} />  // ✅ Correcto
   <Input defaultValue={formData.zipCode} />  // ❌ No funcionará
   ```

## 📊 Casos de Prueba

### Caso 1: Primer Flujo Completo
- [ ] Usuario nuevo
- [ ] Completa formulario
- [ ] Datos se guardan
- [ ] Datos se cargan en modal

### Caso 2: Edición de Datos
- [ ] Usuario con datos guardados
- [ ] Edita ZIP Code
- [ ] Actualiza planes
- [ ] Nuevos datos se guardan

### Caso 3: Múltiples Ediciones
- [ ] Edita datos 3 veces
- [ ] Cada vez se cargan los datos más recientes
- [ ] SessionStorage se actualiza correctamente

### Caso 4: Recarga de Página
- [ ] Completa formulario
- [ ] Navega a insurance-options
- [ ] Recarga la página (F5)
- [ ] Datos persisten
- [ ] Modal muestra datos guardados

## ✅ Criterios de Éxito

El sistema funciona correctamente si:

1. ✅ Los datos del formulario se guardan en `sessionStorage` al completar
2. ✅ Los datos se cargan automáticamente en `insurance-options`
3. ✅ El resumen muestra ZIP Code, Age, Gender, Smoker
4. ✅ El modal precarga TODOS los campos correctamente
5. ✅ El mensaje verde "✓ Your previous information has been loaded" aparece
6. ✅ Los datos persisten después de recargar la página
7. ✅ Las ediciones actualizan los planes correctamente
8. ✅ Los nuevos datos se guardan y precargan en futuras ediciones

## 🔧 Comandos de Desarrollo

```bash
# Limpiar sessionStorage (si necesitas empezar de cero)
sessionStorage.clear()

# Ver todos los items en sessionStorage
Object.keys(sessionStorage).forEach(key => {
  console.log(key, sessionStorage.getItem(key))
})

# Eliminar solo los datos del formulario
sessionStorage.removeItem('insuranceFormData')
```

## 📝 Notas

- Los datos se guardan en `sessionStorage`, NO en `localStorage`
- Los datos persisten durante la sesión del navegador
- Los datos se eliminan al cerrar la pestaña/ventana
- Si cambias de navegador o dispositivo, los datos NO persisten (esto es correcto)

## 🎉 Resultado Esperado

Al seguir este flujo, el usuario debe poder:
1. Completar el formulario una sola vez
2. Ver sus datos resumidos en insurance-options
3. Editar cualquier dato sin volver al formulario multipaso
4. Ver sus datos precargados cada vez que abre el modal
5. Actualizar planes con nuevos datos instantáneamente

