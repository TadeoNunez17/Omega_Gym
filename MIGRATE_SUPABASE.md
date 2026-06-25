# Migración a nuevo proyecto Supabase (producción)

## Requisitos

- Supabase CLI instalada (`npm install -g supabase` o `brew install supabase/tap/supabase`)
- Acceso al nuevo proyecto Supabase (dueño/owner del proyecto)
- Variables de entorno del nuevo proyecto (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)

## Pasos

### 1. Obtener las credenciales del nuevo proyecto

Desde el dashboard de Supabase > Settings > API:

```
URL:    https://<ref>.supabase.co
Anon:   <anon-key>
```

### 2. Enlazar el proyecto local

```bash
supabase link --project-ref <ref-del-nuevo-proyecto>
```

Te pedirá la DB password (la que configuraste al crear el proyecto).

### 3. Aplicar migraciones

```bash
supabase db push
```

Esto ejecuta las migraciones en orden secuencial creando:

- Tablas y relaciones
- Tipos ENUM y constraints
- Triggers y funciones (incluyendo `handle_new_user`, `sync_membership_status`, etc.)
- Políticas RLS por tabla y rol
- Funciones SECURITY DEFINER (`is_admin`, `is_trainer_or_admin`)
- Índices

### 4. Verificar que el schema se aplicó correctamente

```bash
# Opcional: comparar schema actual vs nuevo
supabase db dump --schema-only > schema_actual.sql
supabase db dump --schema-only --db-url="postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres" > schema_nuevo.sql

# Revisar diferencias (solo debe diferir en datos, no en estructura)
```

O entra al SQL Editor del nuevo proyecto y revisa que las tablas existan.

### 5. Actualizar variables de entorno

En Vercel (o donde tengas desplegado):

| Variable | Valor |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://<ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `<anon-key>` |

### 6. Probar

```bash
npm run build
```

Luego despliega y verifica que login + funcionalidades principales funcionen.

---

## Notas

- El proyecto nuevo arranca **sin datos** (sin usuarios, membresías, pagos, etc.)
- Las migraciones no incluyen seed data
- Si necesitas un usuario admin inicial, créalo desde el Sign-Up del dashboard y luego cambia su rol a `'admin'` en la tabla `profiles` desde el SQL Editor
- Auth del nuevo proyecto también arranca vacío — los usuarios existentes no se migran automáticamente

## Referencias

- [Supabase CLI — db push](https://supabase.com/docs/reference/cli/supabase-db-push)
- [Supabase CLI — link](https://supabase.com/docs/reference/cli/supabase-link)
