-- ============================================
-- Omega Gym — Seed Data Completo (Demo)
-- ============================================
-- Ejecutar en Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================
-- Credenciales:
--   admin@omega.com    / Admin123!
--   trainer@omega.com  / Trainer123!
--   (members)          / Member123!
-- ============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_admin_id       UUID;
  v_trainer_id     UUID;
  v_type_visita    UUID;
  v_type_mensual   UUID;
  v_type_trimestral UUID;
  v_type_anual     UUID;
  v_profile_id     UUID;
  v_mem_id         UUID;
  v_start          DATE := CURRENT_DATE;
  v_end            DATE;
BEGIN

  -- ============================================
  -- 1. Membership Types
  -- ============================================
  IF NOT EXISTS (SELECT 1 FROM public.membership_types WHERE name = 'Visita') THEN
    INSERT INTO public.membership_types (name, price, duration_days, description, is_active)
    VALUES ('Visita', 9.99, 1, 'Acceso por un dia', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.membership_types WHERE name = 'Mensual') THEN
    INSERT INTO public.membership_types (name, price, duration_days, description, is_active)
    VALUES ('Mensual', 49.99, 30, 'Acceso completo por 30 dias', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.membership_types WHERE name = 'Trimestral') THEN
    INSERT INTO public.membership_types (name, price, duration_days, description, is_active)
    VALUES ('Trimestral', 129.99, 90, 'Acceso completo por 90 dias', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.membership_types WHERE name = 'Anual') THEN
    INSERT INTO public.membership_types (name, price, duration_days, description, is_active)
    VALUES ('Anual', 399.99, 365, 'Acceso completo por 365 dias', true);
  END IF;

  SELECT id INTO v_type_visita     FROM public.membership_types WHERE name = 'Visita';
  SELECT id INTO v_type_mensual    FROM public.membership_types WHERE name = 'Mensual';
  SELECT id INTO v_type_trimestral FROM public.membership_types WHERE name = 'Trimestral';
  SELECT id INTO v_type_anual      FROM public.membership_types WHERE name = 'Anual';

  -- ============================================
  -- 2. Admin user
  -- ============================================
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@omega.com';
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

  -- ============================================
  -- 3. Trainer user
  -- ============================================
  SELECT id INTO v_trainer_id FROM auth.users WHERE email = 'trainer@omega.com';
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

  -- ============================================
  -- 4. Members (15 total)
  -- ============================================

  -- 01: Carlos Garcia — Mensual activo
  SELECT p.id INTO v_profile_id FROM public.profiles p
    JOIN auth.users u ON u.id = p.auth_user_id WHERE u.email = 'carlos@omega.com';
  IF v_profile_id IS NULL THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'carlos@omega.com',
      crypt('Member123!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Carlos Garcia","phone":"3001113301"}',
      now(), now(), 'authenticated', 'authenticated', '');
    SELECT id INTO v_profile_id FROM public.profiles WHERE auth_user_id = (SELECT id FROM auth.users WHERE email = 'carlos@omega.com');
  END IF;
  UPDATE public.profiles SET full_name = 'Carlos Garcia', phone = '3001113301', alias = 'Carlitos', is_active = true WHERE id = v_profile_id;
  IF NOT EXISTS (SELECT 1 FROM public.memberships WHERE member_id = v_profile_id AND status = 'active') THEN
    v_start := CURRENT_DATE - 15; v_end := v_start + 30;
    INSERT INTO public.memberships (member_id, type_id, start_date, end_date, status)
      VALUES (v_profile_id, v_type_mensual, v_start, v_end, 'active')
      RETURNING id INTO v_mem_id;
    INSERT INTO public.payments (membership_id, amount, payment_date, method, status)
      VALUES (v_mem_id, 49.99, v_start, 'card', 'paid');
  END IF;

  -- 02: Maria Martinez — Anual activo
  SELECT p.id INTO v_profile_id FROM public.profiles p JOIN auth.users u ON u.id = p.auth_user_id WHERE u.email = 'maria@omega.com';
  IF v_profile_id IS NULL THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'maria@omega.com', crypt('Member123!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Maria Martinez","phone":"3001113302"}', now(), now(), 'authenticated', 'authenticated', '');
    SELECT id INTO v_profile_id FROM public.profiles WHERE auth_user_id = (SELECT id FROM auth.users WHERE email = 'maria@omega.com');
  END IF;
  UPDATE public.profiles SET full_name = 'Maria Martinez', phone = '3001113302', alias = 'Mary', is_active = true WHERE id = v_profile_id;
  IF NOT EXISTS (SELECT 1 FROM public.memberships WHERE member_id = v_profile_id AND status = 'active') THEN
    v_start := CURRENT_DATE - 120; v_end := v_start + 365;
    INSERT INTO public.memberships (member_id, type_id, start_date, end_date, status) VALUES (v_profile_id, v_type_anual, v_start, v_end, 'active') RETURNING id INTO v_mem_id;
    INSERT INTO public.payments (membership_id, amount, payment_date, method, status) VALUES (v_mem_id, 399.99, v_start, 'transfer', 'paid');
  END IF;

  -- 03: Jose Lopez — Trimestral (vence en 5 dias)
  SELECT p.id INTO v_profile_id FROM public.profiles p JOIN auth.users u ON u.id = p.auth_user_id WHERE u.email = 'jose@omega.com';
  IF v_profile_id IS NULL THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'jose@omega.com', crypt('Member123!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Jose Lopez","phone":"3001113303"}', now(), now(), 'authenticated', 'authenticated', '');
    SELECT id INTO v_profile_id FROM public.profiles WHERE auth_user_id = (SELECT id FROM auth.users WHERE email = 'jose@omega.com');
  END IF;
  UPDATE public.profiles SET full_name = 'Jose Lopez', phone = '3001113303', alias = 'Pepe', is_active = true WHERE id = v_profile_id;
  IF NOT EXISTS (SELECT 1 FROM public.memberships WHERE member_id = v_profile_id AND status = 'active') THEN
    v_start := CURRENT_DATE - 85; v_end := CURRENT_DATE + 5;
    INSERT INTO public.memberships (member_id, type_id, start_date, end_date, status) VALUES (v_profile_id, v_type_trimestral, v_start, v_end, 'active') RETURNING id INTO v_mem_id;
    INSERT INTO public.payments (membership_id, amount, payment_date, method, status) VALUES (v_mem_id, 129.99, v_start, 'cash', 'paid');
  END IF;

  -- 04: Ana Hernandez — Mensual activo
  SELECT p.id INTO v_profile_id FROM public.profiles p JOIN auth.users u ON u.id = p.auth_user_id WHERE u.email = 'ana@omega.com';
  IF v_profile_id IS NULL THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'ana@omega.com', crypt('Member123!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Ana Hernandez","phone":"3001113304"}', now(), now(), 'authenticated', 'authenticated', '');
    SELECT id INTO v_profile_id FROM public.profiles WHERE auth_user_id = (SELECT id FROM auth.users WHERE email = 'ana@omega.com');
  END IF;
  UPDATE public.profiles SET full_name = 'Ana Hernandez', phone = '3001113304', alias = 'Anita', is_active = true WHERE id = v_profile_id;
  IF NOT EXISTS (SELECT 1 FROM public.memberships WHERE member_id = v_profile_id AND status = 'active') THEN
    v_start := CURRENT_DATE - 10; v_end := v_start + 30;
    INSERT INTO public.memberships (member_id, type_id, start_date, end_date, status) VALUES (v_profile_id, v_type_mensual, v_start, v_end, 'active') RETURNING id INTO v_mem_id;
    INSERT INTO public.payments (membership_id, amount, payment_date, method, status) VALUES (v_mem_id, 49.99, v_start, 'card', 'paid');
  END IF;

  -- 05: Luis Gonzalez — Trimestral (vence en 12 dias)
  SELECT p.id INTO v_profile_id FROM public.profiles p JOIN auth.users u ON u.id = p.auth_user_id WHERE u.email = 'luis@omega.com';
  IF v_profile_id IS NULL THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'luis@omega.com', crypt('Member123!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Luis Gonzalez","phone":"3001113305"}', now(), now(), 'authenticated', 'authenticated', '');
    SELECT id INTO v_profile_id FROM public.profiles WHERE auth_user_id = (SELECT id FROM auth.users WHERE email = 'luis@omega.com');
  END IF;
  UPDATE public.profiles SET full_name = 'Luis Gonzalez', phone = '3001113305', alias = 'Luisito', is_active = true WHERE id = v_profile_id;
  IF NOT EXISTS (SELECT 1 FROM public.memberships WHERE member_id = v_profile_id AND status = 'active') THEN
    v_start := CURRENT_DATE - 78; v_end := CURRENT_DATE + 12;
    INSERT INTO public.memberships (member_id, type_id, start_date, end_date, status) VALUES (v_profile_id, v_type_trimestral, v_start, v_end, 'active') RETURNING id INTO v_mem_id;
    INSERT INTO public.payments (membership_id, amount, payment_date, method, status) VALUES (v_mem_id, 129.99, v_start, 'card', 'paid');
  END IF;

  -- 06: Sofia Perez — Anual activo
  SELECT p.id INTO v_profile_id FROM public.profiles p JOIN auth.users u ON u.id = p.auth_user_id WHERE u.email = 'sofia@omega.com';
  IF v_profile_id IS NULL THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'sofia@omega.com', crypt('Member123!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Sofia Perez","phone":"3001113306"}', now(), now(), 'authenticated', 'authenticated', '');
    SELECT id INTO v_profile_id FROM public.profiles WHERE auth_user_id = (SELECT id FROM auth.users WHERE email = 'sofia@omega.com');
  END IF;
  UPDATE public.profiles SET full_name = 'Sofia Perez', phone = '3001113306', alias = 'Sofi', is_active = true WHERE id = v_profile_id;
  IF NOT EXISTS (SELECT 1 FROM public.memberships WHERE member_id = v_profile_id AND status = 'active') THEN
    v_start := CURRENT_DATE - 200; v_end := v_start + 365;
    INSERT INTO public.memberships (member_id, type_id, start_date, end_date, status) VALUES (v_profile_id, v_type_anual, v_start, v_end, 'active') RETURNING id INTO v_mem_id;
    INSERT INTO public.payments (membership_id, amount, payment_date, method, status) VALUES (v_mem_id, 399.99, v_start, 'transfer', 'paid');
  END IF;

  -- 07: Pedro Rodriguez — Vencido
  SELECT p.id INTO v_profile_id FROM public.profiles p JOIN auth.users u ON u.id = p.auth_user_id WHERE u.email = 'pedro@omega.com';
  IF v_profile_id IS NULL THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'pedro@omega.com', crypt('Member123!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Pedro Rodriguez","phone":"3001113307"}', now(), now(), 'authenticated', 'authenticated', '');
    SELECT id INTO v_profile_id FROM public.profiles WHERE auth_user_id = (SELECT id FROM auth.users WHERE email = 'pedro@omega.com');
  END IF;
  UPDATE public.profiles SET full_name = 'Pedro Rodriguez', phone = '3001113307', alias = 'Pedrito', is_active = true WHERE id = v_profile_id;
  IF NOT EXISTS (SELECT 1 FROM public.memberships WHERE member_id = v_profile_id) THEN
    v_start := CURRENT_DATE - 60; v_end := CURRENT_DATE - 30;
    INSERT INTO public.memberships (member_id, type_id, start_date, end_date, status) VALUES (v_profile_id, v_type_mensual, v_start, v_end, 'expired') RETURNING id INTO v_mem_id;
    INSERT INTO public.payments (membership_id, amount, payment_date, method, status) VALUES (v_mem_id, 49.99, v_start, 'cash', 'paid');
  END IF;

  -- 08: Elena Sanchez — Mensual activo
  SELECT p.id INTO v_profile_id FROM public.profiles p JOIN auth.users u ON u.id = p.auth_user_id WHERE u.email = 'elena@omega.com';
  IF v_profile_id IS NULL THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'elena@omega.com', crypt('Member123!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Elena Sanchez","phone":"3001113308"}', now(), now(), 'authenticated', 'authenticated', '');
    SELECT id INTO v_profile_id FROM public.profiles WHERE auth_user_id = (SELECT id FROM auth.users WHERE email = 'elena@omega.com');
  END IF;
  UPDATE public.profiles SET full_name = 'Elena Sanchez', phone = '3001113308', alias = 'Lena', is_active = true WHERE id = v_profile_id;
  IF NOT EXISTS (SELECT 1 FROM public.memberships WHERE member_id = v_profile_id AND status = 'active') THEN
    v_start := CURRENT_DATE - 8; v_end := v_start + 30;
    INSERT INTO public.memberships (member_id, type_id, start_date, end_date, status) VALUES (v_profile_id, v_type_mensual, v_start, v_end, 'active') RETURNING id INTO v_mem_id;
    INSERT INTO public.payments (membership_id, amount, payment_date, method, status) VALUES (v_mem_id, 49.99, v_start, 'card', 'paid');
  END IF;

  -- 09: Jorge Ramirez — Vencido
  SELECT p.id INTO v_profile_id FROM public.profiles p JOIN auth.users u ON u.id = p.auth_user_id WHERE u.email = 'jorge@omega.com';
  IF v_profile_id IS NULL THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'jorge@omega.com', crypt('Member123!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Jorge Ramirez","phone":"3001113309"}', now(), now(), 'authenticated', 'authenticated', '');
    SELECT id INTO v_profile_id FROM public.profiles WHERE auth_user_id = (SELECT id FROM auth.users WHERE email = 'jorge@omega.com');
  END IF;
  UPDATE public.profiles SET full_name = 'Jorge Ramirez', phone = '3001113309', alias = 'Jorgito', is_active = true WHERE id = v_profile_id;
  IF NOT EXISTS (SELECT 1 FROM public.memberships WHERE member_id = v_profile_id) THEN
    v_start := CURRENT_DATE - 90; v_end := CURRENT_DATE - 60;
    INSERT INTO public.memberships (member_id, type_id, start_date, end_date, status) VALUES (v_profile_id, v_type_mensual, v_start, v_end, 'expired') RETURNING id INTO v_mem_id;
    INSERT INTO public.payments (membership_id, amount, payment_date, method, status) VALUES (v_mem_id, 49.99, v_start, 'cash', 'paid');
  END IF;

  -- 10: Laura Cruz — Trimestral (vence en 3 dias)
  SELECT p.id INTO v_profile_id FROM public.profiles p JOIN auth.users u ON u.id = p.auth_user_id WHERE u.email = 'laura@omega.com';
  IF v_profile_id IS NULL THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'laura@omega.com', crypt('Member123!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Laura Cruz","phone":"3001113310"}', now(), now(), 'authenticated', 'authenticated', '');
    SELECT id INTO v_profile_id FROM public.profiles WHERE auth_user_id = (SELECT id FROM auth.users WHERE email = 'laura@omega.com');
  END IF;
  UPDATE public.profiles SET full_name = 'Laura Cruz', phone = '3001113310', alias = 'Lau', is_active = true WHERE id = v_profile_id;
  IF NOT EXISTS (SELECT 1 FROM public.memberships WHERE member_id = v_profile_id AND status = 'active') THEN
    v_start := CURRENT_DATE - 87; v_end := CURRENT_DATE + 3;
    INSERT INTO public.memberships (member_id, type_id, start_date, end_date, status) VALUES (v_profile_id, v_type_trimestral, v_start, v_end, 'active') RETURNING id INTO v_mem_id;
    INSERT INTO public.payments (membership_id, amount, payment_date, method, status) VALUES (v_mem_id, 129.99, v_start, 'transfer', 'paid');
  END IF;

  -- 11: Miguel Morales — Mensual activo
  SELECT p.id INTO v_profile_id FROM public.profiles p JOIN auth.users u ON u.id = p.auth_user_id WHERE u.email = 'miguel@omega.com';
  IF v_profile_id IS NULL THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'miguel@omega.com', crypt('Member123!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Miguel Morales","phone":"3001113311"}', now(), now(), 'authenticated', 'authenticated', '');
    SELECT id INTO v_profile_id FROM public.profiles WHERE auth_user_id = (SELECT id FROM auth.users WHERE email = 'miguel@omega.com');
  END IF;
  UPDATE public.profiles SET full_name = 'Miguel Morales', phone = '3001113311', alias = 'Migue', is_active = true WHERE id = v_profile_id;
  IF NOT EXISTS (SELECT 1 FROM public.memberships WHERE member_id = v_profile_id AND status = 'active') THEN
    v_start := CURRENT_DATE - 5; v_end := v_start + 30;
    INSERT INTO public.memberships (member_id, type_id, start_date, end_date, status) VALUES (v_profile_id, v_type_mensual, v_start, v_end, 'active') RETURNING id INTO v_mem_id;
    INSERT INTO public.payments (membership_id, amount, payment_date, method, status) VALUES (v_mem_id, 49.99, v_start, 'card', 'paid');
  END IF;

  -- 12: Carmen Ortega — Anual activo
  SELECT p.id INTO v_profile_id FROM public.profiles p JOIN auth.users u ON u.id = p.auth_user_id WHERE u.email = 'carmen@omega.com';
  IF v_profile_id IS NULL THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'carmen@omega.com', crypt('Member123!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Carmen Ortega","phone":"3001113312"}', now(), now(), 'authenticated', 'authenticated', '');
    SELECT id INTO v_profile_id FROM public.profiles WHERE auth_user_id = (SELECT id FROM auth.users WHERE email = 'carmen@omega.com');
  END IF;
  UPDATE public.profiles SET full_name = 'Carmen Ortega', phone = '3001113312', alias = 'Carmencita', is_active = true WHERE id = v_profile_id;
  IF NOT EXISTS (SELECT 1 FROM public.memberships WHERE member_id = v_profile_id AND status = 'active') THEN
    v_start := CURRENT_DATE - 60; v_end := v_start + 365;
    INSERT INTO public.memberships (member_id, type_id, start_date, end_date, status) VALUES (v_profile_id, v_type_anual, v_start, v_end, 'active') RETURNING id INTO v_mem_id;
    INSERT INTO public.payments (membership_id, amount, payment_date, method, status) VALUES (v_mem_id, 399.99, v_start, 'card', 'paid');
  END IF;

  -- 13: Diego Torres — Sin membresia
  SELECT p.id INTO v_profile_id FROM public.profiles p JOIN auth.users u ON u.id = p.auth_user_id WHERE u.email = 'diego@omega.com';
  IF v_profile_id IS NULL THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'diego@omega.com', crypt('Member123!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Diego Torres","phone":"3001113313"}', now(), now(), 'authenticated', 'authenticated', '');
    SELECT id INTO v_profile_id FROM public.profiles WHERE auth_user_id = (SELECT id FROM auth.users WHERE email = 'diego@omega.com');
  END IF;
  UPDATE public.profiles SET full_name = 'Diego Torres', phone = '3001113313', alias = 'Dieguito', is_active = true WHERE id = v_profile_id;

  -- 14: Andrea Flores — Mensual (vence manana)
  SELECT p.id INTO v_profile_id FROM public.profiles p JOIN auth.users u ON u.id = p.auth_user_id WHERE u.email = 'andrea@omega.com';
  IF v_profile_id IS NULL THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'andrea@omega.com', crypt('Member123!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Andrea Flores","phone":"3001113314"}', now(), now(), 'authenticated', 'authenticated', '');
    SELECT id INTO v_profile_id FROM public.profiles WHERE auth_user_id = (SELECT id FROM auth.users WHERE email = 'andrea@omega.com');
  END IF;
  UPDATE public.profiles SET full_name = 'Andrea Flores', phone = '3001113314', alias = 'Drea', is_active = true WHERE id = v_profile_id;
  IF NOT EXISTS (SELECT 1 FROM public.memberships WHERE member_id = v_profile_id AND status = 'active') THEN
    v_start := CURRENT_DATE - 29; v_end := CURRENT_DATE + 1;
    INSERT INTO public.memberships (member_id, type_id, start_date, end_date, status) VALUES (v_profile_id, v_type_mensual, v_start, v_end, 'active') RETURNING id INTO v_mem_id;
    INSERT INTO public.payments (membership_id, amount, payment_date, method, status) VALUES (v_mem_id, 49.99, v_start, 'cash', 'paid');
  END IF;

  -- 15: Ricardo Vargas — Sin membresia
  SELECT p.id INTO v_profile_id FROM public.profiles p JOIN auth.users u ON u.id = p.auth_user_id WHERE u.email = 'ricardo@omega.com';
  IF v_profile_id IS NULL THEN
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_token)
    VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'ricardo@omega.com', crypt('Member123!', gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{"full_name":"Ricardo Vargas","phone":"3001113315"}', now(), now(), 'authenticated', 'authenticated', '');
    SELECT id INTO v_profile_id FROM public.profiles WHERE auth_user_id = (SELECT id FROM auth.users WHERE email = 'ricardo@omega.com');
  END IF;
  UPDATE public.profiles SET full_name = 'Ricardo Vargas', phone = '3001113315', alias = 'Ricky', is_active = true WHERE id = v_profile_id;

  -- ============================================
  -- 5. Update roles
  -- ============================================
  UPDATE public.profiles SET role = 'admin' WHERE auth_user_id = v_admin_id;
  UPDATE public.profiles SET role = 'trainer' WHERE auth_user_id = v_trainer_id;

  RAISE NOTICE 'Seed completado. % miembros creados', 15;
END $$;
