-- Omega Gym — Pre-registro y vinculación de miembros
-- ============================================
-- Fecha: 2026-05-25

-- ============================================
-- 1. Modificar tabla profiles
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS registration_status TEXT DEFAULT 'registered' CHECK (registration_status IN ('pending', 'claimed', 'registered'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS claim_code_hash TEXT DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS claim_code_expires_at TIMESTAMPTZ DEFAULT NULL;

-- ============================================
-- 2. Backfill
-- ============================================
UPDATE profiles SET auth_user_id = id WHERE auth_user_id IS NULL;
UPDATE profiles SET registration_status = 'registered' WHERE registration_status = 'registered' AND auth_user_id IS NOT NULL;

-- ============================================
-- 3. PK independiente
-- ============================================
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- ============================================
-- 4. Trigger handle_new_user actualizado
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  pending_profile public.profiles%ROWTYPE;
BEGIN
  SELECT * INTO pending_profile FROM public.profiles
  WHERE email = NEW.email AND registration_status = 'pending'
  LIMIT 1;

  IF FOUND THEN
    UPDATE public.profiles
    SET auth_user_id = NEW.id,
        registration_status = 'claimed',
        updated_at = NOW()
    WHERE id = pending_profile.id;

    IF pending_profile.email IS NULL OR pending_profile.email = '' THEN
      UPDATE public.profiles
      SET email = NEW.email
      WHERE id = pending_profile.id;
    END IF;
  ELSE
    INSERT INTO public.profiles (id, auth_user_id, email, full_name, role, registration_status)
    VALUES (
      gen_random_uuid(),
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuario'),
      'member',
      'registered'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. RLS policies actualizadas
-- ============================================
DROP POLICY IF EXISTS "Own profile select" ON profiles;
DROP POLICY IF EXISTS "Own profile update" ON profiles;
DROP POLICY IF EXISTS "Admin select all" ON profiles;
DROP POLICY IF EXISTS "Trainers can select profiles" ON profiles;

CREATE POLICY "Own profile select" ON profiles FOR SELECT
  USING (auth_user_id = auth.uid());

CREATE POLICY "Own profile update" ON profiles FOR UPDATE
  USING (auth_user_id = auth.uid());

CREATE POLICY "Admin select all" ON profiles FOR SELECT
  USING ((auth_user_id = auth.uid()) OR (get_my_role() = 'admin'));

CREATE POLICY "Trainers can select profiles" ON profiles FOR SELECT
  USING ((auth_user_id = auth.uid()) OR (get_my_role() IN ('admin', 'trainer')));

CREATE POLICY "Admin can insert profiles" ON profiles FOR INSERT
  WITH CHECK (get_my_role() IN ('admin', 'trainer'));

CREATE POLICY "Admin can update profiles" ON profiles FOR UPDATE
  USING ((auth_user_id = auth.uid()) OR (get_my_role() IN ('admin', 'trainer')));
