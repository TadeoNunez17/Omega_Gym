-- Omega Gym — Evitar duplicación de perfiles en handle_new_user
-- Cuando un usuario se registra vía web, busca un perfil pendiente
-- existente por email/phone antes de crear uno nuevo.
-- Fecha: 2026-06-11

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

  -- Buscar perfil existente sin auth_user_id (pendiente o sin vincular)
  SELECT * INTO existing_profile FROM public.profiles
  WHERE auth_user_id IS NULL
    AND (email = NEW.email OR (user_phone IS NOT NULL AND phone = user_phone))
  LIMIT 1;

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
