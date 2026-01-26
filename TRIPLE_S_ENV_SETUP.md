# Triple S Environment Variables Setup

## Required Environment Variables

Add the following variables to your `.env.local` file:

```env
# ============================================
# TRIPLE S API CONFIGURATION
# ============================================
TRIPLE_S_BASE_URL=https://www.tsvapi.com:9443
TRIPLE_S_USERNAME=tsv_test_agt@live.com
TRIPLE_S_PASSWORD=Cambio01*
TRIPLE_S_PROCESS_ID=4

# ============================================
# SSL CONFIGURATION (Development Only)
# ============================================
# IMPORTANTE: Solo usar en desarrollo para certificados no confiables
# NUNCA usar en producción
NODE_TLS_REJECT_UNAUTHORIZED=0
```

⚠️ **ADVERTENCIA DE SEGURIDAD:** 
- `NODE_TLS_REJECT_UNAUTHORIZED=0` deshabilita la validación de certificados SSL
- Solo debe usarse en **ambiente de desarrollo** con el servidor de test de Triple S
- **NUNCA** usar en producción
- Remover o comentar esta línea al pasar a producción

## Environment-Specific Configuration

### Development / Testing
```env
TRIPLE_S_USERNAME=tsv_test_agt@live.com
TRIPLE_S_PASSWORD=Cambio01*
TRIPLE_S_PROCESS_ID=4
```

### Production
```env
TRIPLE_S_USERNAME=[PRODUCTION_USERNAME]
TRIPLE_S_PASSWORD=[PRODUCTION_PASSWORD]
TRIPLE_S_PROCESS_ID=3
```

## Important Notes

1. **Never commit** `.env.local` files to version control
2. **Process ID**: 
   - Use `4` for development/testing
   - Use `3` for production
3. **Credentials**: Request production credentials from Triple S IT department
4. **Base URL**: Same for both environments (`https://www.tsvapi.com:9443`)

## Verification

After setting up the environment variables, restart your Next.js server:

```bash
npm run dev
```

Check console logs for:
- `✅ Triple S: Token refreshed successfully` - Authentication working
- `✅ Triple S: Catalog loaded - X profiles` - Product catalog loaded
- `✅ Triple S: X plans quoted` - Quotes working

## Troubleshooting

If you see errors:
- `⚠️ Triple S credentials not configured` - Check variable names
- `❌ Triple S: Login failed` - Verify username/password
- `❌ Triple S: Error loading product catalog` - Check network/credentials
