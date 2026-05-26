-- Omega Gym — Fix get_my_role() para leer role desde user_metadata del JWT
-- El trigger sync_role_to_meta sincroniza profiles.role → raw_user_meta_data,
-- pero la función get_my_role() del starter template solo lee auth.jwt() ->> 'role'
-- que siempre retorna 'authenticated'. Se corrige para leer también
-- auth.jwt() -> 'user_metadata' ->> 'role'.

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  SELECT COALESCE(
    NULLIF(auth.jwt() -> 'user_metadata' ->> 'role', ''),
    NULLIF(auth.jwt() ->> 'role', 'authenticated'),
    'member'
  );
$$;
