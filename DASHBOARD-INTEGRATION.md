# Variables de Entorno Requeridas para Marketplace

Para que la integración funcione correctamente, necesitas agregar la siguiente variable al archivo `.env.local` del marketplace:

```bash
# URL del Dashboard
NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3001
```

## Instrucciones:

1. **En el marketplace (`epicareplans-marketplace/`):**
   - Agregar `NEXT_PUBLIC_DASHBOARD_URL=http://localhost:3001` al `.env.local`
   - En producción: `NEXT_PUBLIC_DASHBOARD_URL=https://dashboard.epicare.com`

2. **En el dashboard (`epicare-dashboard/`):**
   - Crear `.env.local` con las credenciales de Supabase del marketplace
   - Agregar `NEXT_PUBLIC_MARKETPLACE_URL=http://localhost:3000`
   - En producción: `NEXT_PUBLIC_MARKETPLACE_URL=https://epicare.com`

## Funcionalidad:
- El link "Mi Dashboard" en el header del marketplace llevará al dashboard
- El botón "Back to Marketplace" en el dashboard llevará al marketplace
- Las cookies de autenticación se compartirán entre ambos dominios en producción
