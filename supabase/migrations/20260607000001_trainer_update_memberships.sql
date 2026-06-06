-- Allow trainers to update memberships and payments (they can already view/insert)

DROP POLICY IF EXISTS "memberships_update" ON memberships;
CREATE POLICY "memberships_update" ON memberships FOR UPDATE
  USING (is_trainer_or_admin());

DROP POLICY IF EXISTS "payments_update" ON payments;
CREATE POLICY "payments_update" ON payments FOR UPDATE
  USING (is_trainer_or_admin());
