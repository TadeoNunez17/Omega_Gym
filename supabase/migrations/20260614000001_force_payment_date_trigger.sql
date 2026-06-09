-- Omega Gym — Forzar payment_date = membership start_date
-- =====================================================
-- El payment_date siempre debe coincidir con el start_date
-- de la membresía asociada, tanto en INSERT como en UPDATE.

CREATE OR REPLACE FUNCTION enforce_payment_date()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.payment_date := (
    SELECT start_date
    FROM memberships
    WHERE id = NEW.membership_id
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_payment_date ON payments;
CREATE TRIGGER trg_enforce_payment_date
  BEFORE INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION enforce_payment_date();

-- Corregir datos inconsistentes: payment_date debe coincidir con start_date
UPDATE payments p
SET payment_date = m.start_date
FROM memberships m
WHERE p.membership_id = m.id
  AND p.payment_date != m.start_date;
