-- Omega Gym — Preservar email/phone del usuario al desvincular
-- =====================================================
-- Al desvincular, el perfil del usuario recupera su
-- auth_user_id pero NO debe perder su email/phone.
-- Fecha: 2026-06-11

CREATE OR REPLACE FUNCTION public.unlink_profile_auth(p_profile_id UUID)
RETURNS void
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_profile_id UUID;
  v_auth_user_id UUID;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden desvincular perfiles';
  END IF;

  SELECT al.registered_profile_id, al.auth_user_id
  INTO v_user_profile_id, v_auth_user_id
  FROM public.auth_links al
  WHERE al.profile_id = p_profile_id AND al.status = 'linked';

  UPDATE public.profiles
  SET auth_user_id = NULL,
      alias = NULL,
      registration_status = 'pending'
  WHERE id = p_profile_id;

  IF v_user_profile_id IS NOT NULL THEN
    UPDATE public.profiles
    SET auth_user_id = v_auth_user_id,
        registration_status = 'registered'
    WHERE id = v_user_profile_id;
  END IF;

  UPDATE public.auth_links
  SET status = 'unlinked', unlinked_at = NOW()
  WHERE profile_id = p_profile_id AND status = 'linked';
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.unlink_profile_auth(UUID) TO authenticated;
