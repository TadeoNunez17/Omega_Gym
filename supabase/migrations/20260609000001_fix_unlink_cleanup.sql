-- Omega Gym — Limpiar datos del perfil pendiente al desvincular
-- =====================================================
-- Al desvincular, el perfil pendiente restaurado debe
-- quedar sin email/phone/alias (solo el nombre).
-- Fecha: 2026-06-09

CREATE OR REPLACE FUNCTION public.unlink_profile_auth(p_profile_id UUID)
RETURNS void
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_pending_id UUID;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden desvincular perfiles';
  END IF;

  SELECT al.registered_profile_id INTO v_pending_id
  FROM public.auth_links al
  WHERE al.profile_id = p_profile_id AND al.status = 'linked';

  UPDATE public.profiles
  SET alias = NULL
  WHERE id = p_profile_id;

  IF v_pending_id IS NOT NULL THEN
    UPDATE public.profiles
    SET registration_status = 'pending',
        email = NULL,
        phone = NULL,
        alias = NULL
    WHERE id = v_pending_id;
  END IF;

  UPDATE public.auth_links
  SET status = 'unlinked', unlinked_at = NOW()
  WHERE profile_id = p_profile_id AND status = 'linked';
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.unlink_profile_auth(UUID) TO authenticated;
