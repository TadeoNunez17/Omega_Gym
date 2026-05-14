-- Grant execute on get_my_role to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_my_role() TO anon, authenticated;
