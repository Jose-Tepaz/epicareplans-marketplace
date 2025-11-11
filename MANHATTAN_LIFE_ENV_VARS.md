# Manhattan Life - Variables de Entorno Requeridas

⚠️ **IMPORTANTE**: Sin estas variables configuradas, Manhattan Life no funcionará y verás errores en la consola.

Para integrar Manhattan Life en el proyecto, necesitas agregar las siguientes variables de entorno a tu archivo `.env.local`:

```bash
# Manhattan Life API Configuration
MANHATTAN_LIFE_API_URL=https://api.manhattanlife.com/EnrollmentService.QA
MANHATTAN_LIFE_USERNAME=your_manhattan_life_username
MANHATTAN_LIFE_PASSWORD=your_manhattan_life_password
MANHATTAN_LIFE_AGENT_NUMBER=99999990000
```

## Descripción de las Variables

- **MANHATTAN_LIFE_API_URL**: URL base de la API de Manhattan Life (QA o Production)
- **MANHATTAN_LIFE_USERNAME**: Usuario para autenticación OAuth 2.0
- **MANHATTAN_LIFE_PASSWORD**: Contraseña para autenticación OAuth 2.0
- **MANHATTAN_LIFE_AGENT_NUMBER**: Número de agente asignado

## Notas

1. Estas variables son necesarias para que el sistema de quoting de Manhattan Life funcione correctamente
2. El sistema usa OAuth 2.0 Password Grant Type para autenticación
3. Los tokens se cachean automáticamente en el servidor y se renuevan cuando expiran
4. Asegúrate de usar las credenciales correctas según el ambiente (QA vs Production)

## Ejemplo Completo de .env.local

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Allstate API Configuration
ALLSTATE_API_URL=https://api.allstate.com
ALLSTATE_AUTH_TOKEN=your_allstate_auth_token

# Manhattan Life API Configuration
MANHATTAN_LIFE_API_URL=https://api.manhattanlife.com/EnrollmentService.QA
MANHATTAN_LIFE_USERNAME=your_manhattan_life_username
MANHATTAN_LIFE_PASSWORD=your_manhattan_life_password
MANHATTAN_LIFE_AGENT_NUMBER=99999990000

# Other API Keys
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

