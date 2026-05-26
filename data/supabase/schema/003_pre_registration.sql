-- Omega Gym — Pre-registro y vinculación de miembros
-- Estado: draft
-- Fecha: 2026-05-25
-- ============================================
-- Este migration permite:
-- 1. Admin/trainer crear perfiles sin auth.user (pre-registro)
-- 2. Enviar código de reclamación por SMS/email
-- 3. Usuario reclamar su cuenta y vincular datos
-- ============================================

-- ============================================
-- 1. Modificar tabla profiles
-- ============================================

-- Agregar columna auth_user_id (nullable) para separar id de perfil del auth.uid
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) DEFAULT NULL;

-- Estado de registro del perfil
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS registration_status TEXT DEFAULT 'registered'
  CHECK (registration_status IN ('pending', 'claimed', 'registered'));

-- Código de reclamación (6 dígitos, hasheado)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS claim_code_hash TEXT DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS claim_code_expires_at TIMESTAMPTZ DEFAULT NULL;

-- ============================================
-- 2. Backfill: perfiles existentes
-- ============================================

-- Los perfiles existentes se vinculan a sí mismos (auth_user_id = id)
UPDATE profiles SET auth_user_id = id WHERE auth_user_id IS NULL;
UPDATE profiles SET registration_status = 'registered' WHERE registration_status = 'registered' AND auth_user_id IS NOT NULL;

-- ============================================
-- 3. Cambiar PK de profiles
-- ============================================

-- Eliminar FK de id a auth.users (ahora auth_user_id tiene la referencia)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Establecer default UUID independiente para nuevos perfiles
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- ============================================
-- 4. Actualizar trigger handle_new_user
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  pending_profile public.profiles%ROWTYPE;
BEGIN
  -- Buscar si existe un perfil pending con este email
  SELECT * INTO pending_profile FROM public.profiles
  WHERE email = NEW.email AND registration_status = 'pending'
  LIMIT 1;

  IF FOUND THEN
    -- Vincular perfil existente
    UPDATE public.profiles
    SET auth_user_id = NEW.id,
        registration_status = 'claimed',
        updated_at = NOW()
    WHERE id = pending_profile.id;

    -- Copiar email de auth.users si el perfil no tenía email
    IF pending_profile.email IS NULL OR pending_profile.email = '' THEN
      UPDATE public.profiles
      SET email = NEW.email
      WHERE id = pending_profile.id;
    END IF;
  ELSE
    -- Crear nuevo perfil como antes
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
-- 5. Actualizar políticas RLS de profiles
-- ============================================

-- Reemplazar políticas que usaban id = auth.uid()
DROP POLICY IF EXISTS "Own profile select" ON profiles;
DROP POLICY IF EXISTS "Own profile update" ON profiles;
DROP POLICY IF EXISTS "Admin select all" ON profiles;
DROP POLICY IF EXISTS "Trainers can select profiles" ON profiles;

-- Miembro puede ver/editar su propio perfil por auth_user_id
CREATE POLICY "Own profile select" ON profiles FOR SELECT
  USING (auth_user_id = auth.uid());

CREATE POLICY "Own profile update" ON profiles FOR UPDATE
  USING (auth_user_id = auth.uid());

-- Admin puede ver/actualizar todos los perfiles (usando get_my_role para evitar RLS recursion)
CREATE POLICY "Admin select all" ON profiles FOR SELECT
  USING ((auth_user_id = auth.uid()) OR (get_my_role() = 'admin'));

-- Trainers pueden ver todos los perfiles
CREATE POLICY "Trainers can select profiles" ON profiles FOR SELECT
  USING ((auth_user_id = auth.uid()) OR (get_my_role() IN ('admin', 'trainer')));

-- Admin/trainer pueden insertar perfiles (pre-registro)
CREATE POLICY "Admin can insert profiles" ON profiles FOR INSERT
  WITH CHECK (get_my_role() IN ('admin', 'trainer'));

-- Admin/trainer pueden actualizar perfiles (enviar códigos, etc.)
CREATE POLICY "Admin can update profiles" ON profiles FOR UPDATE
  USING ((auth_user_id = auth.uid()) OR (get_my_role() IN ('admin', 'trainer')));
