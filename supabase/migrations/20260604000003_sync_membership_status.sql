CREATE OR REPLACE FUNCTION sync_membership_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE memberships
  SET status = 'expired'
  WHERE status = 'active'
    AND end_date < CURRENT_DATE;
END;
$$;

-- Grant execute so the anon/key can call it
GRANT EXECUTE ON FUNCTION sync_membership_status() TO anon, authenticated, service_role;
