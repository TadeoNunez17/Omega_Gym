-- Omega Gym — Trigger revert: alias reemplaza full_name al borrar auth user
-- =====================================================
-- Cuando un miembro se borra a sí mismo (delete_my_account)
-- o el admin limpia huérfanos, el alias reemplaza el nombre
-- para que el profile pendiente tenga identificador visible.
-- Patrón idéntico a unlink_profile_auth().
-- Fecha: 2026-07-11

CREATE OR REPLACE FUNCTION public.revert_profile_on_auth_user_delete()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.auth_links
  SET status = 'unlinked', unlinked_at = NOW()
  WHERE auth_user_id = OLD.id AND status = 'linked';

  UPDATE public.profiles
  SET auth_user_id = NULL,
      full_name = COALESCE(alias, full_name),
      alias = NULL,
      email = NULL,
      phone = NULL,
      registration_status = 'pending'
  WHERE auth_user_id = OLD.id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;
