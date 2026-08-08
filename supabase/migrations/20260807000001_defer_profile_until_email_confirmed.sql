-- Omega Gym — Crear perfil solo después de confirmar el email
-- =====================================================
-- Antes: el trigger on_auth_user_created (AFTER INSERT) creaba el
-- perfil en profiles inmediatamente, sin importar si el email había
-- sido confirmado. Además era solo INSERT, por lo que no se disparaba
-- cuando Supabase actualizaba email_confirmed_at.
-- Ahora:
--   1. handle_new_user() devuelve sin acción si el email aún no está
--      confirmado (email_confirmed_at IS NULL).
--   2. El trigger se dispara en INSERT (usuarios autoconfirmados o
--      creados por admin) y en UPDATE OF email_confirmed_at (cuando el
--      usuario confirma el correo). Ese UPDATE es el momento en que se
--      crea/vincula el perfil.
-- Fecha: 2026-08-07

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
  -- 1. Guarda: si es un signup por email aún no confirmado, no crear
  --    ni vincular perfil todavía. Se hará al confirmar el correo.
  IF NEW.email IS NOT NULL AND NEW.email_confirmed_at IS NULL THEN
    RETURN NEW;
  END IF;

  -- 2. Guarda anti-duplicado: si el perfil ya está vinculado a este auth user.
  IF EXISTS (SELECT 1 FROM public.profiles WHERE auth_user_id = NEW.id) THEN
    RETURN NEW;
  END IF;

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

-- Trigger: disparar también cuando Supabase marca el email como confirmado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- Purga de cuentas sin confirmar (24 h)
-- =====================================================
-- Las cuentas que se registren y nunca confirmen su email quedan
-- huérfanas en auth.users (sin perfil). Este job las elimina después
-- de 24 horas. Se ejecuta cada 30 minutos.
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid)
    FROM cron.job
    WHERE jobname = 'purge-unconfirmed-users';

    PERFORM cron.schedule(
      'purge-unconfirmed-users',
      '*/30 * * * *',
      $cron$
      DELETE FROM auth.users u
      WHERE u.email_confirmed_at IS NULL
        AND u.email IS NOT NULL
        AND u.created_at < NOW() - INTERVAL '24 hours'
        AND NOT EXISTS (
          SELECT 1 FROM public.profiles p WHERE p.auth_user_id = u.id
        );
      $cron$
    );
  END IF;
END;
$$;
