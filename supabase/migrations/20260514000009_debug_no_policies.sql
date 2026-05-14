-- Debug: enable RLS with zero policies
-- With RLS on and no policies, all rows are denied (should return empty [], not 500)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Own profile select" ON profiles;
DROP POLICY IF EXISTS "Own profile update" ON profiles;
