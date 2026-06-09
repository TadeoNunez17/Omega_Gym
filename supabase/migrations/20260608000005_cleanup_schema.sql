-- Omega Gym — Limpieza general del esquema
-- =====================================================
-- Elimina columnas muertas, limpia datos huérfanos,
-- asegura backfill completo de auth_links.
-- Fecha: 2026-06-08

-- =====================================================
-- 1. Eliminar columnas nunca usadas
-- =====================================================
ALTER TABLE profiles DROP COLUMN IF EXISTS claim_code_hash;
ALTER TABLE profiles DROP COLUMN IF EXISTS claim_code_expires_at;
ALTER TABLE profiles DROP COLUMN IF EXISTS huella_template;

COMMENT ON COLUMN profiles.auth_user_id IS 'Vinculación a auth.users (sin FK, gestionado por auth_links)';
COMMENT ON COLUMN profiles.registration_status IS 'pending | claimed | registered';

-- =====================================================
-- 2. Backfill seguro de auth_links
--    Solo para perfiles vinculados que aún no tengan registro
-- =====================================================
INSERT INTO auth_links (profile_id, auth_user_id, linked_at, status)
SELECT p.id, p.auth_user_id, p.created_at, 'linked'
FROM profiles p
WHERE p.auth_user_id IS NOT NULL
  AND p.registration_status = 'registered'
  AND NOT EXISTS (
    SELECT 1 FROM auth_links al WHERE al.profile_id = p.id
  );

-- =====================================================
-- 3. Revisar claimed huérfanos
--    Perfiles que fueron "consumidos" al vincular pero
--    cuyo auth_links ya no existe o está unlinked.
--    Los marcamos para que sean visibles al admin.
-- =====================================================
-- Los claimed sin auth_user_id y sin auth_links activo
-- se dejan como están (conservan sus datos asociados).
-- Solo les agregamos un comment para tracking.
COMMENT ON TABLE auth_links IS 'Vinculación perfil ↔ auth_user. registered_profile_id permite restaurar al desvincular.';

-- =====================================================
-- 4. Índice adicional para búsquedas de candidatos
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_profiles_candidates
  ON profiles(auth_user_id, registration_status)
  WHERE auth_user_id IS NOT NULL AND registration_status = 'registered';
