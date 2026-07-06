-- Omega Gym — Auto-eliminar cuenta (solo miembros)
-- =====================================================
-- Borra auth.users del miembro actual. El trigger
-- revert_profile_on_auth_user_delete se encarga de:
--   - Desvincular auth_links
--   - Limpiar auth_user_id, email, phone del profile
--   - Poner registration_status = 'pending'
-- Los datos de negocio (membresías, pagos, check-ins, etc.)
-- se conservan intactos para que el admin pueda re-vincular.
-- Fecha: 2026-07-06

CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- Solo miembros pueden autoborrarse
  SELECT role INTO v_role FROM public.profiles WHERE auth_user_id = auth.uid();

  IF v_role IS NULL THEN
    RAISE EXCEPTION 'Perfil no encontrado';
  END IF;

  IF v_role <> 'member' THEN
    RAISE EXCEPTION 'Solo los miembros pueden eliminar su propia cuenta';
  END IF;

  -- Borrar auth.users → el trigger revert_profile_on_auth_user_delete
  -- se encarga de desvincular el perfil sin perder datos de negocio
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;

COMMENT ON FUNCTION public.delete_my_account() IS 'Elimina la cuenta de auth del miembro actual. El perfil vuelve a pending. Membresías, pagos y demás datos se conservan.';
