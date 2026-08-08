-- Omega Gym — Borrado físico de un miembro (admin)
-- =====================================================
-- Elimina definitivamente un perfil y todo su historial:
--   profiles → memberships → payments, check_ins, plan_assignments,
--              workout_logs, auth_links (cascades existentes)
-- Adicionalmente borra la(s) cuenta(s) auth vinculada(s).
-- No se puede:
--   - Llamar sin ser admin
--   - Borrar la propia cuenta en sesión
--   - Borrar el último admin del sistema
-- Fecha: 2026-08-08

CREATE OR REPLACE FUNCTION public.hard_delete_member(p_profile_id UUID)
RETURNS void
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_role TEXT;
  v_admin_count INTEGER;
  v_auth_user_ids UUID[];
BEGIN
  -- 1. Solo admins
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden eliminar miembros';
  END IF;

  -- 2. Perfil existe
  SELECT role INTO v_role FROM public.profiles WHERE id = p_profile_id;
  IF v_role IS NULL THEN
    RAISE EXCEPTION 'Perfil no encontrado';
  END IF;

  -- 3. No auto-eliminación
  IF p_profile_id IN (
    SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No puedes eliminar tu propia cuenta';
  END IF;

  -- 4. No eliminar el último admin
  IF v_role = 'admin' THEN
    SELECT COUNT(*) INTO v_admin_count FROM public.profiles WHERE role = 'admin';
    IF v_admin_count <= 1 THEN
      RAISE EXCEPTION 'No se puede eliminar el último administrador';
    END IF;
  END IF;

  -- 5. Capturar cuentas auth vinculadas (auth_links + profiles.auth_user_id)
  SELECT ARRAY_AGG(DISTINCT u)
  INTO v_auth_user_ids
  FROM (
    SELECT auth_user_id AS u FROM public.auth_links WHERE profile_id = p_profile_id AND auth_user_id IS NOT NULL
    UNION
    SELECT auth_user_id FROM public.profiles WHERE id = p_profile_id AND auth_user_id IS NOT NULL
  ) x;

  -- 6. Borrar perfil (cascades: memberships→payments, check_ins,
  --    plan_assignments, workout_logs, auth_links, training_plans)
  DELETE FROM public.profiles WHERE id = p_profile_id;

  -- 7. Borrar cuentas auth huérfanas restantes
  IF v_auth_user_ids IS NOT NULL THEN
    DELETE FROM auth.users WHERE id = ANY(v_auth_user_ids);
  END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.hard_delete_member(UUID) TO authenticated;

COMMENT ON FUNCTION public.hard_delete_member(UUID) IS 'Elimina físicamente un perfil y todos sus datos asociados (membresías, pagos, planes, check-ins) más su cuenta de auth. Solo admin. No permite auto-eliminación ni borrar el último admin.';