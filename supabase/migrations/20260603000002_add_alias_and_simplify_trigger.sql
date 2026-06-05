-- Omega Gym — Agrega columna alias + trigger simplificado
-- =====================================================
-- Admin crea con solo nombre, usuario se registra con email/phone,
-- vinculación manual posterior.
-- Fecha: 2026-06-03

-- =====================================================
-- 1. Agregar columna alias a profiles
-- =====================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alias TEXT;

-- Backfill: para los existentes, alias = email (si hay), sino full_name, sino phone
UPDATE profiles SET alias = COALESCE(email, full_name, phone) WHERE alias IS NULL;

-- =====================================================
-- 2. Trigger handle_new_user — siempre crea perfil nuevo
-- =====================================================
-- Ya no busca pending profiles por email/phone.
-- Alias se setea como el email (o phone si no hay email).
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_phone TEXT;
  user_name TEXT;
  user_alias TEXT;
BEGIN
  user_phone := COALESCE(NEW.phone, NEW.raw_user_meta_data ->> 'phone');
  user_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuario');
  user_alias := COALESCE(NEW.email, user_phone);

  INSERT INTO public.profiles (id, auth_user_id, email, phone, full_name, alias, role, registration_status)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    NEW.email,
    user_phone,
    user_name,
    user_alias,
    'member',
    'registered'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
