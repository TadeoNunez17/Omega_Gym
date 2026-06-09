-- Omega Gym — registered_profile_id en auth_links
-- =====================================================
-- Permite restaurar el perfil registrado original al desvincular,
-- para que pueda ser vinculado de nuevo con otro perfil pendiente.
-- Fecha: 2026-06-08

-- =====================================================
-- 1. Agregar columna
-- =====================================================
ALTER TABLE auth_links ADD COLUMN IF NOT EXISTS registered_profile_id UUID;

-- =====================================================
-- 2. Actualizar RPC de desvinculación
-- =====================================================
CREATE OR REPLACE FUNCTION public.unlink_profile_auth(p_profile_id UUID)
RETURNS void
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_registered_profile_id UUID;
  v_auth_user_id UUID;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo administradores pueden desvincular perfiles';
  END IF;

  SELECT al.registered_profile_id, al.auth_user_id
  INTO v_registered_profile_id, v_auth_user_id
  FROM public.auth_links al
  WHERE al.profile_id = p_profile_id AND al.status = 'linked';

  -- Limpiar perfil principal primero (libera el auth_user_id)
  UPDATE public.profiles
  SET auth_user_id = NULL,
      email = NULL,
      phone = NULL,
      registration_status = 'pending'
  WHERE id = p_profile_id;

  -- Restaurar perfil registrado original (si aún existe)
  IF v_registered_profile_id IS NOT NULL AND v_auth_user_id IS NOT NULL THEN
    UPDATE public.profiles
    SET auth_user_id = v_auth_user_id,
        registration_status = 'registered'
    WHERE id = v_registered_profile_id;
  END IF;

  -- Marcar link como desvinculado
  UPDATE public.auth_links
  SET status = 'unlinked', unlinked_at = NOW()
  WHERE profile_id = p_profile_id AND status = 'linked';
END;
$$ LANGUAGE plpgsql;
