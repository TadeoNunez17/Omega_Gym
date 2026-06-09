-- Omega Gym — Tabla auth_links + desvinculación segura
-- =====================================================
-- Separa el vínculo auth del perfil de negocio.
-- Si se borra auth.users, el perfil vuelve a pending sin perder datos.
-- Fecha: 2026-06-08

-- =====================================================
-- 1. Crear tabla auth_links
-- =====================================================
CREATE TABLE IF NOT EXISTS auth_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  auth_user_id UUID NOT NULL,
  registered_profile_id UUID,
  linked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unlinked_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'linked' CHECK (status IN ('linked', 'unlinked'))
);

CREATE INDEX IF NOT EXISTS idx_auth_links_profile_id ON auth_links(profile_id);
CREATE INDEX IF NOT EXISTS idx_auth_links_auth_user_id ON auth_links(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_auth_links_status ON auth_links(status);

ALTER TABLE auth_links ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. Quitar FK y UNIQUE de profiles.auth_user_id
-- =====================================================
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_auth_user_id_fkey;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_auth_user_id_key;

-- =====================================================
-- 3. Migrar links existentes a auth_links
-- =====================================================
INSERT INTO auth_links (profile_id, auth_user_id, linked_at, status)
SELECT id, auth_user_id, created_at, 'linked'
FROM profiles
WHERE auth_user_id IS NOT NULL
  AND registration_status = 'registered'
  AND NOT EXISTS (
    SELECT 1 FROM auth_links al WHERE al.profile_id = profiles.id
  );

-- =====================================================
-- 4. Eliminar trigger viejo que borraba auth.users
-- =====================================================
DROP TRIGGER IF EXISTS trg_delete_auth_user_on_profile_delete ON public.profiles;
DROP FUNCTION IF EXISTS public.delete_auth_user_on_profile_delete;

-- =====================================================
-- 5. Trigger: cuando se borra auth.users, revertir perfil
-- =====================================================
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

DROP TRIGGER IF EXISTS trg_revert_on_auth_user_delete ON auth.users;
CREATE TRIGGER trg_revert_on_auth_user_delete
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.revert_profile_on_auth_user_delete();

-- =====================================================
-- 6. RPC para desvinculación manual (admin)
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

  UPDATE public.profiles
  SET auth_user_id = NULL,
      email = NULL,
      phone = NULL,
      registration_status = 'pending'
  WHERE id = p_profile_id;

  IF v_registered_profile_id IS NOT NULL AND v_auth_user_id IS NOT NULL THEN
    UPDATE public.profiles
    SET auth_user_id = v_auth_user_id,
        registration_status = 'registered'
    WHERE id = v_registered_profile_id;
  END IF;

  UPDATE public.auth_links
  SET status = 'unlinked', unlinked_at = NOW()
  WHERE profile_id = p_profile_id AND status = 'linked';
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.unlink_profile_auth(UUID) TO authenticated;

-- =====================================================
-- 7. RLS policies para auth_links
-- =====================================================
CREATE POLICY "auth_links_select" ON auth_links FOR SELECT
  USING (is_trainer_or_admin());

CREATE POLICY "auth_links_insert" ON auth_links FOR INSERT
  WITH CHECK (is_trainer_or_admin());

CREATE POLICY "auth_links_update" ON auth_links FOR UPDATE
  USING (is_trainer_or_admin());

CREATE POLICY "auth_links_delete" ON auth_links FOR DELETE
  USING (is_admin());
