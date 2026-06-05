-- Omega Gym — Alias como sobrenombre (nickname)
-- =====================================================
-- Alias ya no se auto-genera: solo se llena si el admin
-- lo edita manualmente como sobrenombre del miembro.
-- Fecha: 2026-06-04

-- =====================================================
-- 1. Limpiar alias redundantes
-- =====================================================
-- Si alias es igual al full_name, email o phone, se limpia
UPDATE profiles SET alias = NULL
WHERE alias IS NOT NULL
  AND (alias = full_name OR alias = email OR alias = phone);

-- =====================================================
-- 2. Trigger handle_new_user — alias ya no se inserta
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_phone TEXT;
  user_name TEXT;
BEGIN
  user_phone := COALESCE(NEW.phone, NEW.raw_user_meta_data ->> 'phone');
  user_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuario');

  INSERT INTO public.profiles (id, auth_user_id, email, phone, full_name, role, registration_status)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    NEW.email,
    user_phone,
    user_name,
    'member',
    'registered'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
