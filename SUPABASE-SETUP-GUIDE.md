# 🚀 Guía de Configuración de Supabase - Epicare Marketplace

Esta guía te llevará paso a paso para configurar Supabase en tu proyecto.

## 📋 Paso 1: Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión o crea una cuenta
3. Haz clic en "New Project"
4. Configura tu proyecto:
   - **Name:** epicareplans-marketplace
   - **Database Password:** Guarda esta contraseña de forma segura
   - **Region:** Selecciona la más cercana a tus usuarios (ej: East US)
   - **Pricing Plan:** Free (para desarrollo)
5. Haz clic en "Create new project"
6. Espera 2-3 minutos mientras se provisiona el proyecto

## 🔑 Paso 2: Obtener las Credenciales

1. Una vez creado el proyecto, ve a **Settings** > **API**
2. Copia las siguientes credenciales:
   - **Project URL** (ej: `https://abcdefghijklm.supabase.co`)
   - **anon/public key** (comienza con `eyJ...`)
   - **service_role key** (comienza con `eyJ...`) - ⚠️ NUNCA expongas esta clave en el cliente

## 📝 Paso 3: Configurar Variables de Entorno

1. Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[tu-proyecto].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[tu-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[tu-service-role-key]

# Allstate API Configuration (ya existente)
ALLSTATE_ENROLLMENT_URL=https://qa1-ngahservices.ngic.com/EnrollmentAPI/api/Enrollment
ALLSTATE_AUTH_TOKEN=VGVzdFVzZXI6VGVzdDEyMzQ=
ALLSTATE_QUOTING_URL=https://qa1-ngahservices.ngic.com/QuotingAPI/api/Quoting
ALLSTATE_APPLICATION_BUNDLE_URL=https://qa1-ngahservices.ngic.com/ApplicationBundleAPI/api/ApplicationBundle
NEXT_PUBLIC_AGENT_NUMBER=159208
```

2. Reemplaza los valores:
   - `[tu-proyecto]` con tu Project URL
   - `[tu-anon-key]` con tu anon/public key
   - `[tu-service-role-key]` con tu service_role key

## 🗄️ Paso 4: Ejecutar el Schema SQL

1. En tu proyecto de Supabase, ve a **SQL Editor**
2. Haz clic en "New query"
3. Abre el archivo `supabase-schema.sql` de este proyecto
4. Copia TODO el contenido del archivo
5. Pégalo en el SQL Editor de Supabase
6. Haz clic en "Run" (o presiona Cmd/Ctrl + Enter)
7. Espera a que se ejecute (puede tomar 10-20 segundos)
8. Deberías ver: ✅ Success. No rows returned

## 🔐 Paso 5: Configurar Autenticación

### Email/Password

1. Ve a **Authentication** > **Providers**
2. Encuentra "Email" en la lista
3. Asegúrate que esté **Enabled**
4. Configuración recomendada:
   - ✅ Enable email confirmations
   - ✅ Secure email change
   - ✅ Secure password change

### Google OAuth

1. Ve a **Authentication** > **Providers**
2. Encuentra "Google" en la lista
3. Haz clic en "Enable"
4. Necesitarás:
   - **Client ID** de Google Cloud Console
   - **Client Secret** de Google Cloud Console
5. **Redirect URL:** Copia la URL que te muestra Supabase
6. Configuración en Google Cloud Console:
   - Ve a [console.cloud.google.com](https://console.cloud.google.com)
   - Crea un proyecto o selecciona uno existente
   - Ve a **APIs & Services** > **Credentials**
   - Crea "OAuth 2.0 Client ID"
   - Tipo: Web application
   - **Authorized redirect URIs:** Pega la URL de Supabase
   - Copia Client ID y Client Secret a Supabase

### Facebook OAuth

1. Ve a **Authentication** > **Providers**
2. Encuentra "Facebook" en la lista
3. Haz clic en "Enable"
4. Necesitarás:
   - **App ID** de Facebook Developers
   - **App Secret** de Facebook Developers
5. **Redirect URL:** Copia la URL que te muestra Supabase
6. Configuración en Facebook Developers:
   - Ve a [developers.facebook.com](https://developers.facebook.com)
   - Crea una app o selecciona una existente
   - Agrega "Facebook Login"
   - En Settings > Basic, copia App ID y App Secret
   - En Facebook Login Settings, agrega la Redirect URL de Supabase

## 🌐 Paso 6: Configurar URLs de Redirección

1. Ve a **Authentication** > **URL Configuration**
2. Agrega las siguientes URLs:

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs:**
```
http://localhost:3000/auth/callback
http://localhost:3000
```

**Para Producción (cuando despliegues):**
```
https://epicareplans.com/auth/callback
https://epicareplans.com
```

## 📧 Paso 7: Personalizar Email Templates (Opcional)

1. Ve a **Authentication** > **Email Templates**
2. Personaliza las plantillas:
   - **Confirm signup:** Email de verificación
   - **Invite user:** Email de invitación
   - **Magic Link:** Email con enlace mágico
   - **Change Email Address:** Email de cambio de dirección
   - **Reset Password:** Email de recuperación de contraseña

3. Personaliza con tu branding:
   - Cambia el remitente
   - Agrega tu logo
   - Personaliza el texto

## 🏢 Paso 8: Insertar Datos Iniciales

### Insertar Agente de Allstate

1. Ve a **Table Editor**
2. Selecciona la tabla `insurance_companies`
3. Busca la fila con name = "Allstate"
4. Copia el **id** (UUID)
5. Ve a **SQL Editor** y ejecuta:

```sql
insert into public.agents (company_id, name, agent_code, external_agent_id, is_active) values
('[PEGA_AQUI_EL_ID_DE_ALLSTATE]', 'Epicare Agent', 'EPIC-001', '159208', true);
```

6. Reemplaza `[PEGA_AQUI_EL_ID_DE_ALLSTATE]` con el UUID que copiaste
7. Haz clic en "Run"

## ✅ Paso 9: Verificar la Instalación

### Verificar Tablas

1. Ve a **Table Editor**
2. Deberías ver las siguientes tablas:
   - ✅ users
   - ✅ roles (con 5 roles insertados)
   - ✅ user_roles
   - ✅ insurance_companies (con Allstate)
   - ✅ agents (después de ejecutar el paso 8)
   - ✅ applications
   - ✅ applicants
   - ✅ coverages
   - ✅ beneficiaries
   - ✅ application_status_history

### Verificar RLS (Row Level Security)

1. Ve a **Authentication** > **Policies**
2. Cada tabla debería tener sus políticas configuradas
3. Verifica que RLS esté habilitado en todas las tablas

## 🧪 Paso 10: Probar la Autenticación

1. Inicia tu servidor de desarrollo:
```bash
npm run dev
```

2. Ve a [http://localhost:3000/login](http://localhost:3000/login)

3. Prueba registrarte con:
   - Email/Password
   - Google OAuth (si lo configuraste)
   - Facebook OAuth (si lo configuraste)

4. Después de registrarte, verifica en Supabase:
   - Ve a **Authentication** > **Users**
   - Deberías ver tu usuario nuevo
   - Ve a **Table Editor** > **users**
   - Deberías ver tu perfil creado automáticamente

## 🐛 Troubleshooting

### Error: "relation public.users does not exist"
- **Solución:** El schema SQL no se ejecutó correctamente. Vuelve al Paso 4.

### Error: "Invalid API key"
- **Solución:** Las variables de entorno no están configuradas correctamente. Verifica el Paso 3.

### Error de OAuth: "redirect_uri_mismatch"
- **Solución:** La Redirect URL en Google/Facebook no coincide con la de Supabase. Verifica el Paso 5.

### No se crea el perfil automáticamente
- **Solución:** El trigger `handle_new_user` no se ejecutó. Revisa que el schema SQL se haya ejecutado completamente.

### Error: "User not authenticated" en enrollment
- **Solución:** El middleware no está funcionando. Verifica que el archivo `middleware.ts` exista en la raíz del proyecto.

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Autenticación](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js con Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

## 🎉 ¡Listo!

Tu proyecto ahora está configurado con Supabase. Los usuarios pueden:
1. ✅ Registrarse e iniciar sesión
2. ✅ Completar el enrollment
3. ✅ Ver sus applications guardadas
4. ✅ Todos los datos están protegidos con RLS

Para el siguiente paso, necesitarás integrar el guardado de enrollment en el flujo de la aplicación.

