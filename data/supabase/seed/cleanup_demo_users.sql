-- ============================================
-- Omega Gym — Eliminar usuarios de prueba
-- ============================================
-- Ejecutar en Supabase SQL Editor
-- ============================================

DO $$
DECLARE
  v_emails TEXT[] := ARRAY[
    'carlos@omega.com', 'maria@omega.com', 'jose@omega.com',
    'ana@omega.com', 'luis@omega.com', 'sofia@omega.com',
    'pedro@omega.com', 'elena@omega.com', 'jorge@omega.com',
    'laura@omega.com', 'miguel@omega.com', 'carmen@omega.com',
    'diego@omega.com', 'andrea@omega.com', 'ricardo@omega.com'
  ];
  v_email TEXT;
  v_auth_id UUID;
BEGIN
  FOREACH v_email IN ARRAY v_emails LOOP
    SELECT id INTO v_auth_id FROM auth.users WHERE email = v_email;
    IF v_auth_id IS NOT NULL THEN
      DELETE FROM public.profiles WHERE auth_user_id = v_auth_id;
      -- trigger delete_orphan_auth_user borra auth.users automaticamente
      RAISE NOTICE 'Eliminado: %', v_email;
    ELSE
      RAISE NOTICE 'No existe: %', v_email;
    END IF;
  END LOOP;
END $$;
