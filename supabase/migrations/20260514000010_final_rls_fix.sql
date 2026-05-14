-- Omega Gym — Fix RLS recursion (final)
--
-- Problema: el starter template dejó políticas recursivas (ej: "Admin all profiles"
-- hace subquery a profiles). Mis migraciones nunca las borraron porque tenían
-- nombres diferentes a las mías.
--
-- Solución:
--   1. Sync role a raw_user_meta_data (get_my_role() lo lee de ahí)
--   2. Dropear TODAS las políticas (template + mías) de todas las tablas
--   3. Crear políticas limpias usando get_my_role() + auth.uid()

-- ============================================
-- 1. Sync role to raw_user_meta_data (get_my_role lo usa)
-- ============================================
CREATE OR REPLACE FUNCTION public.sync_role_to_meta()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data =
    COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_role_trigger ON profiles;
CREATE TRIGGER sync_role_trigger
  AFTER INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_role_to_meta();

-- Backfill existing profiles
UPDATE auth.users u
SET raw_user_meta_data =
  COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', p.role)
FROM public.profiles p
WHERE u.id = p.id
  AND (raw_user_meta_data ->> 'role') IS DISTINCT FROM p.role;

-- ============================================
-- 2. Dropear TODAS las políticas de TODAS las tablas
-- ============================================

-- profiles
DROP POLICY IF EXISTS "Admin all profiles" ON profiles;
DROP POLICY IF EXISTS "Trainer read members" ON profiles;
DROP POLICY IF EXISTS "Admin select all" ON profiles;
DROP POLICY IF EXISTS "Trainers can select profiles" ON profiles;
DROP POLICY IF EXISTS "Own profile select" ON profiles;
DROP POLICY IF EXISTS "Own profile update" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_delete" ON profiles;

-- membership_types
DROP POLICY IF EXISTS "Admin manages membership types" ON membership_types;
DROP POLICY IF EXISTS "Admin write membership_types" ON membership_types;
DROP POLICY IF EXISTS "Anyone can view membership types" ON membership_types;
DROP POLICY IF EXISTS "Read membership_types" ON membership_types;
DROP POLICY IF EXISTS "Authenticated can view membership types" ON membership_types;

-- memberships
DROP POLICY IF EXISTS "Admin all memberships" ON memberships;
DROP POLICY IF EXISTS "Trainer read memberships" ON memberships;
DROP POLICY IF EXISTS "Admin manages memberships" ON memberships;
DROP POLICY IF EXISTS "Admin manages all memberships" ON memberships;
DROP POLICY IF EXISTS "Member sees own memberships" ON memberships;
DROP POLICY IF EXISTS "memberships_insert" ON memberships;
DROP POLICY IF EXISTS "memberships_select" ON memberships;
DROP POLICY IF EXISTS "memberships_update" ON memberships;

-- payments
DROP POLICY IF EXISTS "Admin all payments" ON payments;
DROP POLICY IF EXISTS "Admin manages payments" ON payments;
DROP POLICY IF EXISTS "Admin can manage payments" ON payments;
DROP POLICY IF EXISTS "Member own payments" ON payments;
DROP POLICY IF EXISTS "Member sees own payments" ON payments;
DROP POLICY IF EXISTS "payments_select" ON payments;

-- training_plans
DROP POLICY IF EXISTS "Admin trainer write plans" ON training_plans;
DROP POLICY IF EXISTS "Creator can update plan" ON training_plans;
DROP POLICY IF EXISTS "Read own or assigned" ON training_plans;
DROP POLICY IF EXISTS "See assigned or own plans" ON training_plans;
DROP POLICY IF EXISTS "Trainer or admin creates plans" ON training_plans;
DROP POLICY IF EXISTS "training_plans_select" ON training_plans;
DROP POLICY IF EXISTS "See own or assigned plans" ON training_plans;
DROP POLICY IF EXISTS "Trainer creates plans" ON training_plans;
DROP POLICY IF EXISTS "Trainers can update plans" ON training_plans;
DROP POLICY IF EXISTS "Trainers can delete plans" ON training_plans;

-- plan_exercises
DROP POLICY IF EXISTS "Creator manages exercises" ON plan_exercises;
DROP POLICY IF EXISTS "Read exercises" ON plan_exercises;
DROP POLICY IF EXISTS "See exercises of accessible plans" ON plan_exercises;
DROP POLICY IF EXISTS "Write exercises" ON plan_exercises;
DROP POLICY IF EXISTS "See own plan exercises" ON plan_exercises;
DROP POLICY IF EXISTS "Trainers can manage exercises" ON plan_exercises;
DROP POLICY IF EXISTS "Trainers can update exercises" ON plan_exercises;
DROP POLICY IF EXISTS "Trainers can delete exercises" ON plan_exercises;

-- check_ins
DROP POLICY IF EXISTS "Admin all check_ins" ON check_ins;
DROP POLICY IF EXISTS "Member own check_ins" ON check_ins;
DROP POLICY IF EXISTS "Member sees own check_ins" ON check_ins;
DROP POLICY IF EXISTS "Admin can insert check_ins" ON check_ins;
DROP POLICY IF EXISTS "Admin can view all check_ins" ON check_ins;

-- ============================================
-- 3. Recrear políticas limpias (sin recursión)
-- ============================================

-- profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  USING (id = auth.uid() OR get_my_role() IN ('admin', 'trainer'));
CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  USING (id = auth.uid() OR get_my_role() = 'admin');
CREATE POLICY "profiles_delete" ON profiles FOR DELETE
  USING (get_my_role() = 'admin');

-- membership_types: cualquiera autenticado puede leer; admin/trainer escriben
CREATE POLICY "membership_types_select" ON membership_types FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "membership_types_insert" ON membership_types FOR INSERT
  WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "membership_types_update" ON membership_types FOR UPDATE
  USING (get_my_role() = 'admin');
CREATE POLICY "membership_types_delete" ON membership_types FOR DELETE
  USING (get_my_role() = 'admin');

-- memberships
CREATE POLICY "memberships_select" ON memberships FOR SELECT
  USING (member_id = auth.uid() OR get_my_role() IN ('admin', 'trainer'));
CREATE POLICY "memberships_insert" ON memberships FOR INSERT
  WITH CHECK (get_my_role() IN ('admin', 'trainer'));
CREATE POLICY "memberships_update" ON memberships FOR UPDATE
  USING (get_my_role() = 'admin');
CREATE POLICY "memberships_delete" ON memberships FOR DELETE
  USING (get_my_role() = 'admin');

-- payments
CREATE POLICY "payments_select" ON payments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM memberships m WHERE m.id = payments.membership_id AND m.member_id = auth.uid())
    OR get_my_role() IN ('admin', 'trainer')
  );
CREATE POLICY "payments_insert" ON payments FOR INSERT
  WITH CHECK (get_my_role() IN ('admin', 'trainer'));
CREATE POLICY "payments_update" ON payments FOR UPDATE
  USING (get_my_role() = 'admin');
CREATE POLICY "payments_delete" ON payments FOR DELETE
  USING (get_my_role() = 'admin');

-- training_plans
CREATE POLICY "training_plans_select" ON training_plans FOR SELECT
  USING (assigned_to = auth.uid() OR created_by = auth.uid() OR get_my_role() IN ('admin', 'trainer'));
CREATE POLICY "training_plans_insert" ON training_plans FOR INSERT
  WITH CHECK (get_my_role() IN ('admin', 'trainer'));
CREATE POLICY "training_plans_update" ON training_plans FOR UPDATE
  USING (get_my_role() IN ('admin', 'trainer'));
CREATE POLICY "training_plans_delete" ON training_plans FOR DELETE
  USING (get_my_role() IN ('admin', 'trainer'));

-- plan_exercises
CREATE POLICY "plan_exercises_select" ON plan_exercises FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM training_plans tp
    WHERE tp.id = plan_exercises.plan_id
    AND (tp.assigned_to = auth.uid() OR tp.created_by = auth.uid() OR get_my_role() IN ('admin', 'trainer'))
  ));
CREATE POLICY "plan_exercises_insert" ON plan_exercises FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM training_plans tp
    WHERE tp.id = plan_exercises.plan_id
    AND (tp.created_by = auth.uid() OR get_my_role() IN ('admin', 'trainer'))
  ));
CREATE POLICY "plan_exercises_update" ON plan_exercises FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM training_plans tp
    WHERE tp.id = plan_exercises.plan_id
    AND (tp.created_by = auth.uid() OR get_my_role() IN ('admin', 'trainer'))
  ));
CREATE POLICY "plan_exercises_delete" ON plan_exercises FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM training_plans tp
    WHERE tp.id = plan_exercises.plan_id
    AND (tp.created_by = auth.uid() OR get_my_role() IN ('admin', 'trainer'))
  ));

-- check_ins
CREATE POLICY "check_ins_select" ON check_ins FOR SELECT
  USING (member_id = auth.uid() OR get_my_role() IN ('admin', 'trainer'));
CREATE POLICY "check_ins_insert" ON check_ins FOR INSERT
  WITH CHECK (get_my_role() IN ('admin', 'trainer'));
CREATE POLICY "check_ins_update" ON check_ins FOR UPDATE
  USING (get_my_role() = 'admin');
CREATE POLICY "check_ins_delete" ON check_ins FOR DELETE
  USING (get_my_role() = 'admin');

-- ============================================
-- 4. Limpiar funciones obsoletas
-- ============================================
DROP FUNCTION IF EXISTS public.is_admin_or_trainer();
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_same_user(UUID);
DROP FUNCTION IF EXISTS public.sync_role_to_app_meta();
