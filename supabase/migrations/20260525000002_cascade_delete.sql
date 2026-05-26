-- Omega Gym — CASCADE delete para FK que referencian profiles(id)
-- Permite borrar un perfil y que la BD elimine en cascada:
--   memberships → payments, training_plans → plan_exercises, check_ins

ALTER TABLE memberships DROP CONSTRAINT IF EXISTS memberships_member_id_fkey;
ALTER TABLE memberships ADD CONSTRAINT memberships_member_id_fkey
  FOREIGN KEY (member_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_membership_id_fkey;
ALTER TABLE payments ADD CONSTRAINT payments_membership_id_fkey
  FOREIGN KEY (membership_id) REFERENCES memberships(id) ON DELETE CASCADE;

ALTER TABLE check_ins DROP CONSTRAINT IF EXISTS check_ins_member_id_fkey;
ALTER TABLE check_ins ADD CONSTRAINT check_ins_member_id_fkey
  FOREIGN KEY (member_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE training_plans DROP CONSTRAINT IF EXISTS training_plans_assigned_to_fkey;
ALTER TABLE training_plans ADD CONSTRAINT training_plans_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE training_plans DROP CONSTRAINT IF EXISTS training_plans_created_by_fkey;
ALTER TABLE training_plans ADD CONSTRAINT training_plans_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE plan_exercises DROP CONSTRAINT IF EXISTS plan_exercises_plan_id_fkey;
ALTER TABLE plan_exercises ADD CONSTRAINT plan_exercises_plan_id_fkey
  FOREIGN KEY (plan_id) REFERENCES training_plans(id) ON DELETE CASCADE;
