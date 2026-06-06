-- Omega Gym — Auto-eliminar auth.users cuando se borra un perfil
-- =====================================================
-- Cada vez que se borra un profile con auth_user_id,
-- se elimina también la cuenta de auth.users.
-- Fecha: 2026-06-05

CREATE OR REPLACE FUNCTION public.delete_auth_user_on_profile_delete()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF OLD.auth_user_id IS NOT NULL THEN
    DELETE FROM auth.users WHERE id = OLD.auth_user_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_delete_auth_user_on_profile_delete ON public.profiles;
CREATE TRIGGER trg_delete_auth_user_on_profile_delete
  AFTER DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.delete_auth_user_on_profile_delete();

COMMENT ON FUNCTION public.delete_auth_user_on_profile_delete() IS 'Borra auth.users cuando se elimina un profile vinculado';
