-- Debug: use `true` policy on profiles instead of auth.uid() = id
DROP POLICY IF EXISTS "Own profile select" ON profiles;
DROP POLICY IF EXISTS "Own profile update" ON profiles;
CREATE POLICY "Own profile select" ON profiles FOR SELECT USING (true);
CREATE POLICY "Own profile update" ON profiles FOR UPDATE USING (true);
