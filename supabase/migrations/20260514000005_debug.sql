-- Debug: check if profiles has stale recursive policies
-- Also test if auth.jwt() policies work correctly

-- Reset all profiles policies to simplest possible
DROP POLICY IF EXISTS "Admin select all" ON profiles;
DROP POLICY IF EXISTS "Trainers can select profiles" ON profiles;
DROP POLICY IF EXISTS "Own profile select" ON profiles;
DROP POLICY IF EXISTS "Own profile update" ON profiles;

-- Only allow users to see their own profile, nothing else
CREATE POLICY "Own profile select" ON profiles FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY "Own profile update" ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Reset membership_types to simple auth.role() check
DROP POLICY IF EXISTS "Authenticated can view membership types" ON membership_types;
CREATE POLICY "Authenticated can view membership types" ON membership_types FOR SELECT
  USING (auth.role() = 'authenticated');
