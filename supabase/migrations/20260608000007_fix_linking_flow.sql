-- Omega Gym — Invertir flujo de vinculación
-- =====================================================
-- Ahora el perfil registrado (con auth_user_id) conserva
-- su auth y recibe el nombre del admin como alias.
-- El perfil pendiente pasa a 'claimed' (oculto).
-- Fecha: 2026-06-08

-- =====================================================
-- 1. RPC para arreglar vinculaciones existentes
-- =====================================================
-- Recorre auth_links donde status = 'linked' y:
--   - Copia full_name del pendiente → alias del registrado
--   - Transfiere auth_user_id del pendiente al registrado
--   - Transfiere FK data (memberships, payments, planes, check_ins)
--   - Marca pendiente como claimed
--   - Actualiza auth_links.profile_id

CREATE OR REPLACE FUNCTION public.fix_existing_links()
RETURNS TABLE(processed_id UUID, result_status TEXT)
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  rec RECORD;
  v_count INT := 0;
BEGIN
  FOR rec IN
    SELECT al.profile_id AS old_active_id,
           al.registered_profile_id AS old_registered_id,
           p_a.full_name AS active_name,
           p_r.alias AS registered_alias,
           p_a.auth_user_id AS active_auth_id
    FROM public.auth_links al
    JOIN public.profiles p_a ON p_a.id = al.profile_id
    JOIN public.profiles p_r ON p_r.id = al.registered_profile_id
    WHERE al.status = 'linked'
      AND al.registered_profile_id IS NOT NULL
      AND al.profile_id != al.registered_profile_id
  LOOP
    -- 1. Copy admin's full_name as alias on the registered profile
    IF rec.registered_alias IS NULL THEN
      UPDATE public.profiles SET alias = rec.active_name WHERE id = rec.old_registered_id;
    END IF;

    -- 2. Transfer FK data from old_active (pending) to old_registered (user)
    -- payments se vinculan a través de memberships (membership_id), no directamente
    UPDATE public.memberships SET member_id = rec.old_registered_id WHERE member_id = rec.old_active_id;
    UPDATE public.training_plans SET assigned_to = rec.old_registered_id WHERE assigned_to = rec.old_active_id;
    UPDATE public.check_ins SET member_id = rec.old_registered_id WHERE member_id = rec.old_active_id;

    -- 3. Transfer auth_user_id from old_active to old_registered
    UPDATE public.profiles SET auth_user_id = rec.active_auth_id WHERE id = rec.old_registered_id;

    -- 4. Clear old_active and mark as claimed
    UPDATE public.profiles SET auth_user_id = NULL, registration_status = 'claimed' WHERE id = rec.old_active_id;

    -- 5. Update auth_links to point to registered profile as active
    UPDATE public.auth_links
    SET profile_id = rec.old_registered_id,
        registered_profile_id = rec.old_active_id
    WHERE profile_id = rec.old_active_id AND status = 'linked';

    processed_id := rec.old_active_id;
    result_status := 'fixed';
    RETURN NEXT;
    v_count := v_count + 1;
  END LOOP;

  IF v_count = 0 THEN
    processed_id := NULL;
    result_status := 'no_links_to_fix';
    RETURN NEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.fix_existing_links() TO authenticated;

-- =====================================================
-- 2. Actualizar RPC de desvinculación
-- =====================================================
-- Ahora el perfil activo es el registrado (tiene auth_user_id).
-- Al desvincular:
--   - Limpia alias del perfil activo
--   - Restaura perfil pendiente (claimed → pending)
--   - Marca link como unlinked
-- El perfil registrado conserva su auth_user_id (el usuario
-- sigue pudiendo iniciar sesión).

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
    SET registration_status = 'pending'
    WHERE id = v_pending_id;
  END IF;

  UPDATE public.auth_links
  SET status = 'unlinked', unlinked_at = NOW()
  WHERE profile_id = p_profile_id AND status = 'linked';
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.unlink_profile_auth(UUID) TO authenticated;

-- =====================================================
-- 3. Actualizar trigger al eliminar auth.users
-- =====================================================
-- Limpia el perfil que tenía el auth_user_id (registrado)
-- y restaura el perfil pendiente asociado.

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
      phone = NULL
  WHERE auth_user_id = OLD.id;

  UPDATE public.profiles p
  SET registration_status = 'pending'
  FROM public.auth_links al
  WHERE al.auth_user_id = OLD.id
    AND al.registered_profile_id = p.id
    AND p.registration_status = 'claimed';

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. Ejecutar fix para pares existentes
-- =====================================================
SELECT public.fix_existing_links();
