-- Omega Gym — Crear trigger on_auth_user_created faltante
-- =====================================================
-- El trigger se perdió en migraciones anteriores. Lo recreamos
-- apuntando a la función handle_new_user() ya existente.
-- Fecha: 2026-06-04

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
