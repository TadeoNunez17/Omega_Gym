-- Omega Gym — Invertir prioridad: perfil del admin es el activo
-- =====================================================
-- Antes: al vincular, el perfil registrado (usuario) se quedaba
-- activo y el del admin (pendiente) se ocultaba como 'claimed'.
-- Ahora: el perfil del admin absorbe el auth_user_id y se vuelve
-- el activo; el perfil del usuario pasa a 'claimed'.
-- Los datos de negocio (memberships, planes, check-ins) se
-- transfieren al perfil del admin.
-- Fecha: 2026-06-10

-- =====================================================
-- 1. Actualizar unlink_profile_auth
-- =====================================================
-- p_profile_id ahora es el perfil del admin (el activo).
-- Le quitamos el auth y lo devolvemos a pending.
-- Restauramos el auth al perfil del usuario (registered_profile_id).
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
        email = NULL,
        phone = NULL,
        registration_status = 'registered'
    WHERE id = v_user_profile_id;
  END IF;

  UPDATE public.auth_links
  SET status = 'unlinked', unlinked_at = NOW()
  WHERE profile_id = p_profile_id AND status = 'linked';
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.unlink_profile_auth(UUID) TO authenticated;

-- =====================================================
-- 2. Actualizar trigger revert_profile_on_auth_user_delete
-- =====================================================
-- Ahora el auth_user_id está en el perfil del admin.
-- Al borrar el auth user, revertimos ese perfil a pending.
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
      email = NULL,
      phone = NULL,
      registration_status = 'pending'
  WHERE auth_user_id = OLD.id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. RPC para corregir pares vinculados con la lógica vieja
-- =====================================================
-- Recorre auth_links activos donde el profile_id apuntaba al
-- perfil registrado (usuario) en vez del perfil del admin.
-- Transfiere auth_user_id y datos de negocio al perfil del admin
-- y actualiza auth_links para que profile_id sea el admin.
CREATE OR REPLACE FUNCTION public.fix_linking_priority()
RETURNS void
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT al.id, al.profile_id, al.registered_profile_id, al.auth_user_id
    FROM public.auth_links al
    WHERE al.status = 'linked'
      AND al.registered_profile_id IS NOT NULL
      AND al.profile_id != al.registered_profile_id
      AND EXISTS (SELECT 1 FROM public.profiles WHERE id = al.profile_id AND auth_user_id IS NOT NULL)
  LOOP
    -- Transferir datos de negocio del perfil registrado → perfil del admin
    UPDATE public.memberships SET member_id = rec.registered_profile_id
    WHERE member_id = rec.profile_id;

    UPDATE public.training_plans SET assigned_to = rec.registered_profile_id
    WHERE assigned_to = rec.profile_id;

    UPDATE public.check_ins SET member_id = rec.registered_profile_id
    WHERE member_id = rec.profile_id;

    -- Transferir auth_user_id al perfil del admin
    UPDATE public.profiles
    SET auth_user_id = rec.auth_user_id,
        registration_status = 'registered'
    WHERE id = rec.registered_profile_id;

    -- Marcar perfil del usuario como claimed
    UPDATE public.profiles
    SET auth_user_id = NULL,
        registration_status = 'claimed'
    WHERE id = rec.profile_id;

    -- Intercambiar en auth_links: profile_id ahora es el admin
    UPDATE public.auth_links
    SET profile_id = rec.registered_profile_id,
        registered_profile_id = rec.profile_id
    WHERE id = rec.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.fix_linking_priority() TO authenticated;
