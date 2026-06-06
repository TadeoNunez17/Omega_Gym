CREATE OR REPLACE FUNCTION sync_membership_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Mark expired memberships where end_date has passed
  UPDATE memberships
  SET status = 'expired'
  WHERE status = 'active'
    AND end_date < CURRENT_DATE;

  -- Revert memberships incorrectly marked as expired
  UPDATE memberships
  SET status = 'active'
  WHERE status = 'expired'
    AND end_date >= CURRENT_DATE;
END;
$$;

-- Grant execute so the anon/key can call it
GRANT EXECUTE ON FUNCTION sync_membership_status() TO anon, authenticated, service_role;
