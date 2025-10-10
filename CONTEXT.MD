## 🌐 Descripción General

El proyecto consiste en el desarrollo de un **ecosistema digital para la venta, gestión y seguimiento de seguros**, integrando múltiples aseguradoras mediante APIs (ej. Ameritas, All State, etc.).

El sistema estará compuesto por **tres módulos principales**, todos conectados a una misma base de datos central (Supabase), que permitirán una experiencia fluida para usuarios, clientes y equipo interno.

---

## 📋 Estado Actual del Proyecto

### ✅ **Funcionalidades Implementadas (Estáticas)**
- **Formulario multipasos** en `/explore` - 6 pasos completos
- **Página de resultados** en `/insurance-options` - Muestra planes estáticos
- **UI/UX completa** con Next.js, Shadcn, Tailwind CSS

### 🔄 **Funcionalidades Pendientes (Dinámicas)**
- Integración con API de All State
- Configuración de Supabase
- Autenticación con Magic Link
- Carrito de compras
- Checkout y redirección

---

## 🎯 **Prioridades de Desarrollo**

1. **PRIMERA FASE**: Formulario multipasos + Resultados dinámicos
2. **SEGUNDA FASE**: Integración con All State API
3. **TERCERA FASE**: Supabase + Autenticación
4. **CUARTA FASE**: Carrito + Checkout

---

## 🔧 **Stack Tecnológico**

- **Frontend**: Next.js 14, React, TypeScript
- **UI**: Shadcn/ui, Tailwind CSS
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth (Magic Link)
- **API Externa**: All State Insurance API

---

## 🔑 **Credenciales de API**

```bash
# All State API
Authorization: Basic VGVzdFVzZXI6VGVzdDEyMzQ=
agentId: "159208"
```

### 📋 **APIs de Aseguradoras**

#### 🔍 **API de Cotización (All State)**
- **Endpoint**: `https://qa1-ngahservices.ngic.com/QuotingAPI/api/v1/Rate/AllPlans`
- **Método**: POST
- **Datos**: Información del formulario multipasos
- **Estado**: ✅ Documentación disponible
- **Uso**: Enviar datos del formulario multipasos para obtener todos los planes disponibles

#### 📝 **API de Enrollment (Aseguradoras)**
- **Endpoint**: Para procesar inscripciones/checkout
- **Método**: POST
- **Datos**: Formulario con información completa del usuario
- **Estado**: ⏳ Documentación pendiente
- **Nota**: Cada aseguradora tendrá su propio endpoint de enrollment

---

## 📊 **Estructura de Base de Datos (Por Definir)**

> **IMPORTANTE**: Toda la estructura de base de datos debe quedar completamente documentada

### Tablas Propuestas:
- `users` - Información de usuarios
- `user_profiles` - Perfiles de seguros de usuarios
- `insurance_requests` - Solicitudes de cotización
- `insurance_plans` - Planes disponibles
- `cart_items` - Items en carrito
- `enrollment_requests` - Solicitudes de enrollment/checkout
- `orders` - Órdenes de compra

---

## Importante

Ahora solo trabajaremos con All State, la documentación de la api de all state es esta:

## 🔹 1. Sitio Web Público

### 🎯 Objetivo

El objetivo del sitio web es **atraer, educar y convertir visitantes en clientes** mediante un proceso guiado que permite al usuario:

1. Conocer los diferentes tipos de seguros disponibles.
2. Completar un **formulario multipasos (/explore)** para determinar su perfil y elegibilidad, este formulario envia una solicitud a la
3. Crear una cuenta automáticamente (mediante Magic Link).
4. Ver los seguros recomendados con base en su perfil.
5. Agregar uno o varios seguros al carrito.
6. Redirigirse al **checkout** del proveedor correspondiente para completar el pago.

### 🧩 Funcionalidades Clave

- Catálogo de productos conectado a APIs de las aseguradoras.
- Formulario dinámico de perfil (mulpasos).
- Creación de cuenta con Supabase Auth.
- Carrito inteligente que agrupa productos por proveedor.
- Envío automático de información de compra y perfil al backend.
- Redirección al Dashboard de usuario una vez finalizada la compra.

### 🧠 Rol dentro del ecosistema

El sitio web actúa como **canal de adquisición y registro**, donde inicia el ciclo de vida del cliente.

Toda la información recolectada en este módulo nutre al **dashboard del usuario** y al **panel interno de gestión**.

# Servicios

Base de datos: Supabase

API, por ahora solo ALLSTATE:

# Documentación de la API

Datos completos que podemos enviar para recibir todos los planes (no es necesario enviar todo)

```json
{
  "agentId": "string",
  "effectiveDate": "2025-10-07T04:03:16.760Z",
  "terminationDate": "2025-10-07T04:03:16.760Z",
  "enrollmentDate": "2025-10-07T04:03:16.760Z",
  "stmTerm": 0,
  "zipCode": "strin",
  "state": "string",
  "applicants": [
    {
      "birthDate": "2025-10-07T04:03:16.760Z",
      "gender": "Male",
      "relationshipType": "None",
      "isSmoker": true,
      "dateLastSmoked": "2025-10-07T04:03:16.760Z",
      "hasPriorCoverage": true,
      "rateTier": "Standard",
      "memberId": "string"
    }
  ],
  "insuranceNetwork": "Undefined",
  "stmRenewalTerms": 0,
  "stmRenewalRateLock": true,
  "isRewrite": true,
  "listBillNumber": "string",
  "productTypes": [
    "Unknown"
  ],
  "paymentFrequency": "None",
  "planTypes": [
    "Unknown"
  ],
  "medSupp": {
    "enrollmentType": "Unknown",
    "medicarePartBEffectiveDate": "2025-10-07T04:03:16.760Z",
    "guaranteedIssueCircumstance": "BirthdayAnniversary",
    "isPreMacraEligible": true,
    "hasHouseholdDiscount": true,
    "householdDiscountType": "None",
    "wearablesDiscount": true,
    "applicationFormNumber": "string"
  },
  "includeAdditionalBenefits": true,
  "includeACABundleDiscounts": true,
  "includeStackableDiscounts": true
}
```

Datos importantes para obtener todos los planes

```jsx
{
	"PlansToRate": null,
	 "ExcludeAvailablePlans": false,
  "agentId": "159208",
  "effectiveDate": "2025-08-25T22:50:17.715Z",
  "zipCode": "07008",
  "applicants": [
    {
      "birthDate": "1994-08-25T22:50:17.715Z",
      "gender": "Male",
      "relationshipType": "Primary",
      "isSmoker": false
    }
  ],
	"paymentFrequency": "Monthly",
	"productTypes": [
   "NHICSupplemental" // para obtener tipos de productos
  ]
	

  
}
```

Si es fumador, necesitamos los siguientes campos adicionales

```json
{
"isSmoker": true,
"dateLastSmoked": "2025-10-07T04:03:16.760Z"
}
```

Si queremos agregar nuevos miembros

```json
"applicants": [
    {
      "birthDate": "2025-10-07T04:03:16.760Z",
      "gender": "Male",
      "relationshipType": "None",
      "isSmoker": true,
      "dateLastSmoked": "2025-10-07T04:03:16.760Z",
      "hasPriorCoverage": true,
      "rateTier": "Standard",
      "memberId": "string"
    }
```

La respuesta que retorna la API es una lista de planes con la siguiente información

```jsx
{
	"ratedPlans": [],
	"availablePlans": [
		{
			"id": "2144",
			"enrollerId": "159208",
			"productCode": "21044",
			"planType": "NICAFB",
			"productType": "NHICSupplemental",
			"planName": "Accident Fixed-Benefit",
			"activeThruDate": "2999-12-31T00:00:00",
			"applicationType": "Individual",
			"issueType": "Guaranteed",
			"productSubCode": 2144,
			"planKey": "2144",
			"paymentFrequency": "Monthly",
			"discounts": [],
			"familyComposition": "Member",
			"isAMERider": false,
			"hasDentalDiscountCard": false,
			"coverageEffectiveDate": "2025-08-25T22:50:17.715Z",
			"coverageTerminationDate": null,
			"coverageEnrolledDate": "2025-08-24T22:50:17.715Z",
			"insuranceNetwork": "Undefined",
			"baseProducts": [
				"AFB_I"
			],
			"baseProductName": null,
			"pathToBrochure": "https://allstatehealth.canto.com/direct/document/arajrcs24944d28vfj22097p4p/bmb78ne6pRgoe0oRhGAAgc7AHYs/original?content-type=application%2Fpdf&name=2024_0125_AHS_AFB_1037-2_BRO.pdf",
			"stmRenewalTerms": null,
			"stmRenewalRateLock": null,
			"insuranceRate": 25.15,
			"standardTierInsuranceRate": 25.15,
			"rate": 25.15,
			"standardTierRate": 25.15,
			"totalRate": 25.15,
			"standardTierTotalRate": 25.15,
			"rateExcludingMultiProductDiscounts": 0,
			"providerLink": "",
			"benefits": [
				{
					"name": "One Time Enrollment Fee",
					"value": 0,
					"premium": 0.00,
					"which": "EnrollmentFee",
					"formattedValue": "$0.00"
				},
				{
					"name": "LIFE Association Membership",
					"value": 0,
					"premium": 0.00,
					"which": "AssociationFee",
					"formattedValue": "$0.00"
				}
			],
			"benefitDescription": "$25,000/$50,000 Benefit",
			"numberOfDays": 0,
			"additionalCoverages": [],
			"memberRates": [],
			"riders": [],
			"isDiscounted": false,
			"productSourceDetail": null,
			"valid": true,
			"enrollmentFeeNumber": 0.00,
			"productRateComponents": [],
			"applicants": [],
			"waiveFee": false,
			"isSeniorPlan": false,
			"carrierName": null
		}
		]
		"additionalPlansToOffer": [],
	"discountedPlansToOffer": [],
	"monthlyPaymentTotal": 0,
	"initialPaymentTotal": 0,
	"enrollmentFeeTotal": 0
	}
		
```

---

## 📝 **CHECKLIST DE DESARROLLO**

### 🚀 **FASE 1: Formulario Multipasos + Resultados Dinámicos**

#### ✅ **Formulario Multipasos (/explore)**
- [x] **Paso 1**: Pregunta si tiene cuenta (implementado)
- [x] **Paso 2**: Código postal (implementado)
- [x] **Paso 3**: Fecha de nacimiento (implementado)
- [x] **Paso 4**: Género (implementado)
- [x] **Paso 5**: Fumador/Tabaco (implementado)
- [x] **Paso 6**: Fecha de inicio de cobertura (implementado)
- [x] **Paso 7**: Frecuencia de pago (implementado)
- [ ] **Validación**: Mapear campos del formulario a API de All State
- [ ] **Envío**: Conectar formulario con API para obtener planes reales
- [ ] **Navegación**: Redirigir a `/insurance-options` con datos reales

#### 🔄 **Página de Resultados (/insurance-options)**
- [x] **UI**: Diseño de tarjetas de seguros (implementado)
- [x] **Filtros**: Filtros por tipo de plan, producto, ordenamiento (implementado)
- [ ] **Datos Dinámicos**: Reemplazar datos estáticos con respuesta de API
- [ ] **Carrito**: Implementar funcionalidad de agregar al carrito
- [ ] **Estado**: Manejar estado de planes seleccionados

### 🔌 **FASE 2: Integración con All State API**

#### 📡 **Configuración de API**
- [ ] **Variables de Entorno**: Configurar credenciales de API
- [ ] **Cliente HTTP**: Crear cliente para consumir API de All State
- [ ] **Tipos TypeScript**: Definir interfaces para request/response
- [ ] **Manejo de Errores**: Implementar manejo de errores de API

#### 🔄 **Endpoints a Implementar**
- [ ] **POST /api/insurance/quote**: Proxy para `https://qa1-ngahservices.ngic.com/QuotingAPI/api/v1/Rate/AllPlans`
- [ ] **GET /api/insurance/plans**: Obtener planes disponibles (cache local)
- [ ] **POST /api/insurance/enrollment**: Procesar inscripción con API de enrollment
- [ ] **Validación**: Validar datos antes de enviar a API de All State

### 🗄️ **FASE 3: Supabase + Autenticación**

#### 🏗️ **Configuración de Supabase**
- [ ] **Proyecto**: Crear proyecto en Supabase
- [ ] **Variables de Entorno**: Configurar URL y anon key
- [ ] **Cliente**: Configurar cliente de Supabase

#### 📊 **Estructura de Base de Datos**
- [ ] **Tabla `users`**: Información básica de usuarios
- [ ] **Tabla `user_profiles`**: Perfiles de seguros de usuarios
- [ ] **Tabla `insurance_requests`**: Solicitudes de cotización
- [ ] **Tabla `insurance_plans`**: Planes disponibles (cache)
- [ ] **Tabla `cart_items`**: Items en carrito
- [ ] **Tabla `orders`**: Órdenes de compra
- [ ] **Documentación**: Documentar completamente la estructura

#### 🔐 **Autenticación**
- [ ] **Magic Link**: Configurar autenticación sin contraseña
- [ ] **Middleware**: Proteger rutas que requieren autenticación
- [ ] **Context**: Crear contexto de autenticación
- [ ] **Redirección**: Manejar flujo de login/logout

### 🛒 **FASE 4: Carrito + Checkout**

#### 🛒 **Carrito de Compras**
- [ ] **Estado Global**: Implementar estado del carrito (Context/Redux)
- [ ] **Agregar Items**: Funcionalidad para agregar planes al carrito
- [ ] **Eliminar Items**: Funcionalidad para remover planes
- [ ] **Persistencia**: Guardar carrito en localStorage/Supabase
- [ ] **Validación**: Validar disponibilidad de planes

#### 💳 **Checkout**
- [ ] **Resumen**: Mostrar resumen de compra
- [ ] **Formulario de Enrollment**: Formulario completo para API de enrollment
- [ ] **API de Enrollment**: Integrar con endpoint de enrollment de aseguradoras
- [ ] **Redirección**: Redirigir a checkout de aseguradora correspondiente
- [ ] **Tracking**: Implementar tracking de conversiones
- [ ] **Confirmación**: Página de confirmación post-compra

### 🧪 **FASE 5: Testing y Optimización**

#### 🧪 **Testing**
- [ ] **Unit Tests**: Tests para componentes principales
- [ ] **Integration Tests**: Tests para flujo completo
- [ ] **API Tests**: Tests para integración con All State
- [ ] **E2E Tests**: Tests end-to-end del flujo de usuario

#### ⚡ **Optimización**
- [ ] **Performance**: Optimizar carga de imágenes y componentes
- [ ] **SEO**: Implementar meta tags y sitemap
- [ ] **Analytics**: Configurar Google Analytics
- [ ] **Error Monitoring**: Implementar Sentry o similar

### 📚 **DOCUMENTACIÓN**

#### 📖 **Documentación Técnica**
- [ ] **README**: Documentar setup y deployment
- [ ] **API Docs**: Documentar endpoints internos
- [ ] **DB Schema**: Documentar estructura de base de datos
- [ ] **Deployment**: Documentar proceso de deployment

#### 📋 **Documentación de Usuario**
- [ ] **User Guide**: Guía de usuario para el formulario
- [ ] **FAQ**: Preguntas frecuentes
- [ ] **Support**: Documentación de soporte

---

## 🎯 **PRÓXIMOS PASOS INMEDIATOS**

1. **Revisar formulario actual** y mapear campos a API de All State ✅
2. **Configurar variables de entorno** para API de All State
3. **Crear endpoint proxy** `/api/insurance/quote` para `https://qa1-ngahservices.ngic.com/QuotingAPI/api/v1/Rate/AllPlans`
4. **Conectar formulario** con API para obtener planes reales
5. **Actualizar página de resultados** con datos dinámicos

---

## 📞 **Contacto y Soporte**

Para dudas sobre el proyecto o la API de All State, consultar este documento o contactar al equipo de desarrollo.