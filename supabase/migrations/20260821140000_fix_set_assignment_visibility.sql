-- FIX TKT-OMEGYM-025: el RPC original comparaba member_id/assigned_to contra auth.uid(),
-- pero en este proyecto profiles.id NO siempre coincide con el UUID de auth (cuentas
-- vinculadas/pre-registradas). Se aplica la traducción estándar del proyecto:
--   profiles.id IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
-- Convención: search_path='' + esquemas explícitos, control de flujo con FOUND.

CREATE OR REPLACE FUNCTION public.set_assignment_visibility(p_plan_id uuid, p_visible boolean)
RETURNS void
LANGUAGE plpgsql VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_profile_id uuid;
BEGIN
  SELECT id INTO v_profile_id
  FROM public.profiles WHERE auth_user_id = auth.uid();

  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'Perfil no encontrado para el usuario actual';
  END IF;

  -- Preferencia por miembro: solo su propia fila de asignación
  UPDATE public.plan_assignments
     SET visible = p_visible
   WHERE plan_id = p_plan_id
     AND member_id = v_profile_id;

  IF NOT FOUND THEN
    -- Fallback legacy: asignación única vía training_plans.assigned_to
    -- (sin fila en plan_assignments). show_in_plan sigue siendo por-miembro ahí.
    UPDATE public.training_plans
       SET show_in_plan = p_visible
     WHERE id = p_plan_id
       AND kind = 'trainer'
       AND assigned_to = v_profile_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'No autorizado para cambiar la visibilidad de este plan';
    END IF;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.set_assignment_visibility(uuid, boolean) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.set_assignment_visibility(uuid, boolean) TO authenticated;
