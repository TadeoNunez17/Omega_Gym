-- ============================================
-- Omega Gym — Usuarios de prueba (Demo)
-- ============================================
-- Ejecutar en Supabase SQL Editor (Dashboard > SQL Editor)
-- O via: supabase db reset (local)
-- ============================================
-- Credenciales:
--   admin@omega.com   / Admin123!
--   trainer@omega.com / Trainer123!
--   member@omega.com  / Member123!
-- ============================================

-- Extensión necesaria para hashear contraseñas
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- 1. Crear usuarios en auth.users
-- ============================================
DO $$
DECLARE
  v_admin_id    UUID;
  v_trainer_id  UUID;
  v_member_id   UUID;
BEGIN
  -- Solo insertar si no existen
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@omega.com';
  SELECT id INTO v_trainer_id FROM auth.users WHERE email = 'trainer@omega.com';
  SELECT id INTO v_member_id FROM auth.users WHERE email = 'member@omega.com';

  -- Admin
  IF v_admin_id IS NULL THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'admin@omega.com',
      crypt('Admin123!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Admin Principal","phone":"3001112233"}',
      now(), now(), 'authenticated', 'authenticated', '')
    RETURNING id INTO v_admin_id;
  END IF;

  -- Trainer
  IF v_trainer_id IS NULL THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'trainer@omega.com',
      crypt('Trainer123!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Trainer Demo","phone":"3001112244"}',
      now(), now(), 'authenticated', 'authenticated', '')
    RETURNING id INTO v_trainer_id;
  END IF;

  -- Member
  IF v_member_id IS NULL THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'member@omega.com',
      crypt('Member123!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Miembro Demo","phone":"3001112255"}',
      now(), now(), 'authenticated', 'authenticated', '')
    RETURNING id INTO v_member_id;
  END IF;

  -- ============================================
  -- 2. Actualizar roles (trigger los creó como 'member')
  -- ============================================
  IF v_admin_id IS NOT NULL THEN
    UPDATE public.profiles SET role = 'admin' WHERE auth_user_id = v_admin_id;
  END IF;

  IF v_trainer_id IS NOT NULL THEN
    UPDATE public.profiles SET role = 'trainer' WHERE auth_user_id = v_trainer_id;
  END IF;

  -- member se queda como 'member' (default)
END $$;
