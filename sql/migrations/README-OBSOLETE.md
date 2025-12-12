# ⚠️ Archivos SQL Obsoletos

## Estructura Antigua vs Nueva

### ❌ Estructura Antigua (NO USAR)

- **Tabla:** `agents` (ya no existe o no se usa)
- **Campo en users:** `agent_id` (obsoleto)
- **Búsqueda:** Por `agent_code = 'DEFAULT-ALLSTATE'`

### ✅ Estructura Nueva (USAR)

- **Tabla:** `agent_profiles`
- **Campo en users:** `agent_profile_id`
- **Búsqueda:** Por `is_default = true`

---

## 📁 Archivos Obsoletos en Esta Carpeta

Los siguientes archivos **NO deben ejecutarse** ya que usan la estructura antigua:

### 🗑️ `001-create-default-agent.sql`

**Problema:** Intenta crear registro en tabla `agents` que puede no existir o estar obsoleta

**Reemplazo:** Ver `context/asignacion-agentes.md` para configuración correcta

---

### 🗑️ `004-fix-assign-default-agent-trigger.sql`

**Problema:** 
- Usa campo `agent_id` que no existe en `users`
- Busca en tabla `agents` con `agent_code`

**Reemplazo:** 
- `epicare-admindashboard/sql/migrations/030-fix-agent-profile-assignment.sql`

---

### 🗑️ `006-diagnose-agent-assignment.sql`

**Problema:** Script de diagnóstico para estructura antigua con `agent_id`

**Reemplazo:** Usar queries de verificación en `context/asignacion-agentes.md`

---

### 🗑️ `007-assign-agent-to-existing-users.sql`

**Problema:** Asigna `agent_id` a usuarios existentes

**Reemplazo:** Ejecutar migración de datos en `context/asignacion-agentes.md`

```sql
UPDATE users
SET agent_profile_id = (
  SELECT id FROM agent_profiles WHERE is_default = true LIMIT 1
)
WHERE role = 'client' AND agent_profile_id IS NULL;
```

---

### 🗑️ `008-assign-agent-to-user-now.sql`

**Problema:** Similar al 007, usa estructura antigua

**Reemplazo:** Ver migración de datos arriba

---

### 🗑️ `999-remove-agent-trigger.sql`

**Estado:** ✅ Este archivo SÍ se debe ejecutar

**Propósito:** Limpia triggers viejos antes de aplicar los nuevos

**Cuándo ejecutar:** Antes de ejecutar la migración 030

---

## ✅ Archivos Correctos a Ejecutar

En el **admin dashboard** (`epicare-admindashboard/sql/migrations/`):

1. **029-ensure-default-agent-flag.sql** - Agregar columna `is_default`
2. **030-fix-agent-profile-assignment.sql** - Función del trigger actualizada

En la **raíz del proyecto**:

3. **VERIFICAR-AGENTE-DEFAULT.sql** - Ver agentes disponibles
4. **MARCAR-AGENTE-DEFAULT.sql** - Marcar un agente como default

---

## 🔄 Cómo Migrar de Estructura Antigua a Nueva

### Paso 1: Backup

```sql
-- Backup de datos importantes
CREATE TABLE users_backup AS 
SELECT * FROM users WHERE role = 'client';
```

### Paso 2: Ejecutar Migraciones Nuevas

```bash
# 1. Ejecutar 029 (agregar is_default)
# 2. Marcar un agente como default
# 3. Ejecutar 999 (limpiar triggers viejos)
# 4. Ejecutar 030 (trigger nuevo)
```

### Paso 3: Migrar Datos

Si existía un campo `agent_id` en users (viejo), convertir a `agent_profile_id`:

```sql
-- Solo si la columna agent_id existe
-- Verificar primero:
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name = 'agent_id';

-- Si existe, migrar datos (CUIDADO: revisar la relación correcta)
-- Este script es solo un ejemplo, ajustar según tu estructura
```

### Paso 4: Verificar

```sql
-- Todos los clientes deben tener agent_profile_id
SELECT COUNT(*) 
FROM users 
WHERE role = 'client' 
  AND agent_profile_id IS NULL;

-- Debe ser 0
```

---

## 📖 Documentación Completa

Ver: `context/asignacion-agentes.md`

Incluye:
- Explicación detallada de la lógica
- Diagramas de flujo
- Casos de prueba
- Troubleshooting
- Queries de verificación

---

## 🆘 Soporte

Si encuentras problemas con asignación de agentes:

1. **Verificar agente default existe:**
   ```sql
   SELECT * FROM agent_profiles WHERE is_default = true AND is_active = true;
   ```

2. **Ver logs del trigger:**
   - En Supabase → Logs → Postgres Logs
   - Buscar mensajes con "agente" o "agent_profile_id"

3. **Verificar permisos RLS:**
   - Policies en `agent_profiles` deben permitir SELECT
   - Ejecutar como admin client si es necesario

4. **Revisar código frontend:**
   - Verificar que `useAgents()` carga correctamente
   - Verificar que selector es visible cuando debe

---

Última actualización: 10 Diciembre 2025
