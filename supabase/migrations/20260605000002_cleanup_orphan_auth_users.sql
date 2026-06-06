-- Omega Gym — Limpiar cuentas auth huérfanas (sin perfil)
-- =====================================================
-- Los perfiles borrados desde la UI dejan cuentas auth
-- huérfanas en auth.users. Esta migración las elimina.
-- Fecha: 2026-06-05

-- 1. Función para limpiar cuentas auth sin perfil asociado
CREATE OR REPLACE FUNCTION public.cleanup_orphan_auth_users()
RETURNS TABLE(deleted_id uuid, deleted_email text)
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  DELETE FROM auth.users u
  WHERE u.id NOT IN (
    SELECT p.auth_user_id FROM public.profiles p WHERE p.auth_user_id IS NOT NULL
  )
  RETURNING u.id, u.email;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.cleanup_orphan_auth_users() IS 'Elimina cuentas auth sin perfil asociado';

-- 2. Ejecutar limpieza inmediata
SELECT public.cleanup_orphan_auth_users();
