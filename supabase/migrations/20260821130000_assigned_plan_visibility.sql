-- TKT-OMEGYM-025 (SPEC_001 extensión): visibilidad por miembro de planes asignados en "Mi plan"
-- plan_assignments.visible: preferencia individual; ocultar un plan NO afecta a otros miembros
-- asignados al mismo plan. Fallback legacy para planes con assigned_to (un solo miembro):
-- ahí se reutiliza training_plans.show_in_plan, que sigue siendo por-miembro.

ALTER TABLE public.plan_assignments
  ADD COLUMN IF NOT EXISTS visible BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN public.plan_assignments.visible IS
  'Preferencia del miembro: muestra u oculta este plan asignado en su vista Mi plan (por miembro, no global)';

CREATE OR REPLACE FUNCTION public.set_assignment_visibility(p_plan_id uuid, p_visible boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated integer;
BEGIN
  UPDATE public.plan_assignments
     SET visible = p_visible
   WHERE plan_id = p_plan_id
     AND member_id = auth.uid();

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  IF v_updated = 0 THEN
    -- Fallback legacy: asignación vía training_plans.assigned_to sin fila en plan_assignments.
    -- assigned_to apunta a UN solo miembro, así que show_in_plan sigue siendo una preferencia por-miembro.
    IF EXISTS (
      SELECT 1 FROM public.training_plans
      WHERE id = p_plan_id
        AND kind = 'trainer'
        AND assigned_to = auth.uid()
    ) THEN
      UPDATE public.training_plans
         SET show_in_plan = p_visible
       WHERE id = p_plan_id;
    ELSE
      RAISE EXCEPTION 'No autorizado para cambiar la visibilidad de este plan';
    END IF;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_assignment_visibility(uuid, boolean) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.set_assignment_visibility(uuid, boolean) TO authenticated;
