-- Omega Gym — Simplificación del flujo de autenticación
-- =====================================================
-- Elimina claim codes, vincula por email + phone en el trigger
-- Fecha: 2026-06-03

-- =====================================================
-- 1. Trigger handle_new_user actualizado (busca por email OR phone)
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  pending_profile public.profiles%ROWTYPE;
  user_phone TEXT;
BEGIN
  user_phone := NEW.raw_user_meta_data ->> 'phone';

  SELECT * INTO pending_profile FROM public.profiles
  WHERE registration_status = 'pending'
    AND (email = NEW.email OR (user_phone IS NOT NULL AND phone = user_phone))
  LIMIT 1;

  IF FOUND THEN
    UPDATE public.profiles
    SET auth_user_id = NEW.id,
        registration_status = 'claimed',
        updated_at = NOW()
    WHERE id = pending_profile.id;

    IF pending_profile.email IS NULL OR pending_profile.email = '' THEN
      UPDATE public.profiles SET email = NEW.email WHERE id = pending_profile.id;
    END IF;

    IF user_phone IS NOT NULL AND (pending_profile.phone IS NULL OR pending_profile.phone = '') THEN
      UPDATE public.profiles SET phone = user_phone WHERE id = pending_profile.id;
    END IF;
  ELSE
    INSERT INTO public.profiles (id, auth_user_id, email, phone, full_name, role, registration_status)
    VALUES (
      gen_random_uuid(),
      NEW.id,
      NEW.email,
      user_phone,
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuario'),
      'member',
      'registered'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
