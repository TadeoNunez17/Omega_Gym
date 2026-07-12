-- Omega Gym — Evitar duplicación: buscar pending por nombre cuando no hay match por email
-- =====================================================
-- El admin crea profiles pending SIN email. Cuando el usuario
-- se registra, handle_new_user no encontraba el profile porque
-- solo buscaba por email/phone. Ahora busca por full_name
-- como fallback para profiles pendientes.
-- Fecha: 2026-07-11

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_phone TEXT;
  user_name TEXT;
  existing_profile public.profiles%ROWTYPE;
BEGIN
  user_phone := COALESCE(NEW.phone, NEW.raw_user_meta_data ->> 'phone');
  user_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuario');

  -- Buscar perfil existente sin auth_user_id por email o phone
  SELECT * INTO existing_profile FROM public.profiles
  WHERE auth_user_id IS NULL
    AND (email = NEW.email OR (user_phone IS NOT NULL AND phone = user_phone))
  LIMIT 1;

  -- Si no se encontró, buscar por nombre en profiles pendientes
  IF NOT FOUND THEN
    SELECT * INTO existing_profile FROM public.profiles
    WHERE auth_user_id IS NULL
      AND full_name = user_name
      AND registration_status = 'pending'
    LIMIT 1;
  END IF;

  IF FOUND THEN
    UPDATE public.profiles
    SET auth_user_id = NEW.id,
        registration_status = 'registered',
        email = COALESCE(NULLIF(email, ''), NEW.email),
        phone = COALESCE(NULLIF(phone, ''), user_phone),
        full_name = CASE WHEN full_name = 'Usuario' OR full_name IS NULL THEN user_name ELSE full_name END,
        updated_at = NOW()
    WHERE id = existing_profile.id;
  ELSE
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
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
