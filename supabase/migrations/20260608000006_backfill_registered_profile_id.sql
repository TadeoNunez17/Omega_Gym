-- Omega Gym — Backfill registered_profile_id en auth_links
-- =====================================================
-- Los links viejos (backfill o linkPendingProfile antes de
-- guardar registered_profile_id) no tienen referencia al
-- perfil que fue huérfano -> la RPC no puede restaurarlo
-- al desvincular -> el candidato nunca reaparece.
-- Fecha: 2026-06-08

-- =====================================================
-- 1. Backfill registered_profile_id
--    Empareja cada auth_links con el perfil claimed
--    cuyo email coincida con el del auth.user.
-- =====================================================
UPDATE auth_links al
SET registered_profile_id = (
  SELECT p.id
  FROM profiles p
  WHERE p.registration_status = 'claimed'
    AND p.auth_user_id IS NULL
    AND p.id != al.profile_id
    AND p.email = (SELECT email FROM auth.users WHERE id = al.auth_user_id)
    AND p.created_at <= al.linked_at
  LIMIT 1
)
WHERE al.registered_profile_id IS NULL
  AND EXISTS (SELECT 1 FROM auth.users WHERE id = al.auth_user_id);

-- =====================================================
-- 2. Restaurar perfiles huérfanos por desvinculaciones
--    previas (cuando la RPC no encontró registered_profile_id
--    y dejó el perfil claimed sin restaurar).
-- =====================================================
UPDATE profiles p
SET auth_user_id = al.auth_user_id,
    registration_status = 'registered',
    email = COALESCE(p.email, (SELECT email FROM auth.users WHERE id = al.auth_user_id)),
    phone = COALESCE(p.phone, NULL)
FROM auth_links al
WHERE p.id = al.registered_profile_id
  AND al.status = 'unlinked'
  AND al.registered_profile_id IS NOT NULL
  AND p.registration_status = 'claimed'
  AND p.auth_user_id IS NULL;
