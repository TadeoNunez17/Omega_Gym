-- Omega Gym — RLS para auth_links
-- =====================================================
ALTER TABLE auth_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_links_select" ON auth_links;
CREATE POLICY "auth_links_select" ON auth_links FOR SELECT
  USING (is_trainer_or_admin());

DROP POLICY IF EXISTS "auth_links_insert" ON auth_links;
CREATE POLICY "auth_links_insert" ON auth_links FOR INSERT
  WITH CHECK (is_trainer_or_admin());

DROP POLICY IF EXISTS "auth_links_update" ON auth_links;
CREATE POLICY "auth_links_update" ON auth_links FOR UPDATE
  USING (is_trainer_or_admin());

DROP POLICY IF EXISTS "auth_links_delete" ON auth_links;
CREATE POLICY "auth_links_delete" ON auth_links FOR DELETE
  USING (is_admin());
