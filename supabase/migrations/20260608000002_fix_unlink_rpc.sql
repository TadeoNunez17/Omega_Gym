-- Omega Gym — Fix: qualificar is_admin con public.
-- =====================================================
CREATE OR REPLACE FUNCTION public.unlink_profile_auth(p_profile_id UUID)
RETURNS void
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden desvincular perfiles';
  END IF;

  UPDATE public.auth_links
  SET status = 'unlinked', unlinked_at = NOW()
  WHERE profile_id = p_profile_id AND status = 'linked';

  UPDATE public.profiles
  SET auth_user_id = NULL,
      email = NULL,
      phone = NULL,
      registration_status = 'pending'
  WHERE id = p_profile_id;
END;
$$ LANGUAGE plpgsql;
