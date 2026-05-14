-- Debug: drop ALL policies, ALL custom functions, ALL triggers on public tables.
-- Then enable RLS with minimal policies.

-- Drop ALL triggers on public tables first (before functions they depend on)
DROP TRIGGER IF EXISTS sync_profile_role_trigger ON profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS check_membership_active ON check_ins;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_training_plans_updated_at ON training_plans;

-- Drop ALL custom functions
DROP FUNCTION IF EXISTS public.is_admin_or_trainer();
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_same_user(UUID);
DROP FUNCTION IF EXISTS public.sync_role_to_app_meta();

-- Drop ALL policies on all tables
DROP POLICY IF EXISTS "Own profile select" ON profiles;
DROP POLICY IF EXISTS "Own profile update" ON profiles;
DROP POLICY IF EXISTS "Admin select all" ON profiles;
DROP POLICY IF EXISTS "Trainers can select profiles" ON profiles;

DROP POLICY IF EXISTS "Member sees own memberships" ON memberships;
DROP POLICY IF EXISTS "Admin manages memberships" ON memberships;
DROP POLICY IF EXISTS "Admin manages all memberships" ON memberships;

DROP POLICY IF EXISTS "Authenticated can view membership types" ON membership_types;

DROP POLICY IF EXISTS "Admin can manage payments" ON payments;
DROP POLICY IF EXISTS "Member sees own payments" ON payments;

DROP POLICY IF EXISTS "See own or assigned plans" ON training_plans;
DROP POLICY IF EXISTS "Trainer creates plans" ON training_plans;
DROP POLICY IF EXISTS "Trainers can update plans" ON training_plans;
DROP POLICY IF EXISTS "Trainers can delete plans" ON training_plans;

DROP POLICY IF EXISTS "Member sees own check_ins" ON check_ins;
DROP POLICY IF EXISTS "Admin can insert check_ins" ON check_ins;
DROP POLICY IF EXISTS "Admin can view all check_ins" ON check_ins;

DROP POLICY IF EXISTS "See own plan exercises" ON plan_exercises;
DROP POLICY IF EXISTS "Trainers can manage exercises" ON plan_exercises;
DROP POLICY IF EXISTS "Trainers can update exercises" ON plan_exercises;
DROP POLICY IF EXISTS "Trainers can delete exercises" ON plan_exercises;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Minimal policies: only own-profile access
CREATE POLICY "Own profile select" ON profiles FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY "Own profile update" ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- For other tables, no policies (all rows denied)
