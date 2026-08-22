-- ============================================================
-- Omega Gym — Rutinas personales de miembros compartibles por código
-- SPEC_001 · TKT-OMEGYM-019
--
-- Aditiva y retrocompatible:
--   * kind DEFAULT 'trainer' → los planes existentes no cambian
--   * Políticas RLS nuevas (no se dropean las existentes)
--   * RPCs SECURITY DEFINER (patrón is_admin / hard_delete_member)
-- Flujo: dueño genera código XXXX-XXXX → receptor importa → recibe
-- COPIA independiente (modificar la copia jamás afecta la original).
-- ============================================================

-- ------------------------------------------------------------
-- 1. Columnas nuevas en training_plans
-- ------------------------------------------------------------
ALTER TABLE public.training_plans
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'trainer';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'training_plans_kind_check'
      AND conrelid = 'public.training_plans'::regclass
  ) THEN
    ALTER TABLE public.training_plans
      ADD CONSTRAINT training_plans_kind_check
      CHECK (kind IN ('trainer', 'personal'));
  END IF;
END $$;

ALTER TABLE public.training_plans
  ADD COLUMN IF NOT EXISTS share_code TEXT;

-- Un código solo puede pertenecer a una rutina; NULL (sin compartir) excluido
CREATE UNIQUE INDEX IF NOT EXISTS idx_training_plans_share_code
  ON public.training_plans (share_code)
  WHERE share_code IS NOT NULL;

-- Listado eficiente de rutinas propias por kind
CREATE INDEX IF NOT EXISTS idx_training_plans_created_by_kind
  ON public.training_plans (created_by, kind);

-- ------------------------------------------------------------
-- 2. Generador de códigos (Base32 sin caracteres ambiguos: sin I O 0 1)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._share_code_random()
RETURNS text
LANGUAGE plpgsql VOLATILE
AS $$
DECLARE
  v_alphabet CONSTANT text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_code text := '';
  g int;
  i int;
BEGIN
  FOR g IN 1 .. 2 LOOP
    FOR i IN 1 .. 4 LOOP
      v_code := v_code || substr(v_alphabet, floor(random() * 32)::int + 1, 1);
    END LOOP;
    IF g = 1 THEN
      v_code := v_code || '-';
    END IF;
  END LOOP;
  RETURN v_code;
END;
$$;

REVOKE ALL ON FUNCTION public._share_code_random() FROM PUBLIC;

-- ------------------------------------------------------------
-- 3. RLS: miembros gestionan SOLO sus rutinas personales
--    (traducción auth_user_id → profiles.id, patrón 20260616000001;
--     corrige de paso las políticas viejas que comparaban
--     created_by = auth.uid(), roto para miembros vinculados)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "members_personal_routines_insert" ON public.training_plans;
CREATE POLICY "members_personal_routines_insert" ON public.training_plans
  FOR INSERT
  WITH CHECK (
    kind = 'personal'
    AND created_by IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS "members_personal_routines_update" ON public.training_plans;
CREATE POLICY "members_personal_routines_update" ON public.training_plans
  FOR UPDATE
  USING (
    kind = 'personal'
    AND created_by IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
  )
  WITH CHECK (
    kind = 'personal'
    AND created_by IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
  );

DROP POLICY IF EXISTS "members_personal_routines_delete" ON public.training_plans;
CREATE POLICY "members_personal_routines_delete" ON public.training_plans
  FOR DELETE
  USING (
    kind = 'personal'
    AND created_by IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
  );

-- Ejercicios de rutinas personales propias
DROP POLICY IF EXISTS "members_personal_exercises_insert" ON public.plan_exercises;
CREATE POLICY "members_personal_exercises_insert" ON public.plan_exercises
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.training_plans tp
    WHERE tp.id = plan_exercises.plan_id
      AND tp.kind = 'personal'
      AND tp.created_by IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
  ));

DROP POLICY IF EXISTS "members_personal_exercises_update" ON public.plan_exercises;
CREATE POLICY "members_personal_exercises_update" ON public.plan_exercises
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.training_plans tp
    WHERE tp.id = plan_exercises.plan_id
      AND tp.kind = 'personal'
      AND tp.created_by IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.training_plans tp
    WHERE tp.id = plan_exercises.plan_id
      AND tp.kind = 'personal'
      AND tp.created_by IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
  ));

DROP POLICY IF EXISTS "members_personal_exercises_delete" ON public.plan_exercises;
CREATE POLICY "members_personal_exercises_delete" ON public.plan_exercises
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.training_plans tp
    WHERE tp.id = plan_exercises.plan_id
      AND tp.kind = 'personal'
      AND tp.created_by IN (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
  ));

-- ------------------------------------------------------------
-- 4. RPC: generar (o regenerar) el código de compartición
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_share_code(
  p_plan_id uuid,
  p_regenerate boolean DEFAULT false
)
RETURNS text
LANGUAGE plpgsql VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_profile_id uuid;
  v_owner uuid;
  v_kind text;
  v_existing text;
  v_attempts int := 0;
BEGIN
  SELECT id INTO v_profile_id
  FROM public.profiles WHERE auth_user_id = auth.uid();

  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'Perfil no encontrado para el usuario actual';
  END IF;

  SELECT created_by, kind, share_code INTO v_owner, v_kind, v_existing
  FROM public.training_plans WHERE id = p_plan_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Rutina no encontrada';
  END IF;

  IF v_owner <> v_profile_id THEN
    RAISE EXCEPTION 'Solo el dueño puede compartir esta rutina';
  END IF;

  IF v_kind <> 'personal' THEN
    RAISE EXCEPTION 'Solo las rutinas personales se pueden compartir por código';
  END IF;

  -- Idempotente: devolver el código vigente salvo regeneración explícita
  IF v_existing IS NOT NULL AND NOT COALESCE(p_regenerate, false) THEN
    RETURN v_existing;
  END IF;

  LOOP
    BEGIN
      UPDATE public.training_plans
         SET share_code = public._share_code_random(),
             updated_at = now()
       WHERE id = p_plan_id
      RETURNING share_code INTO v_existing;
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      v_attempts := v_attempts + 1;
      IF v_attempts >= 5 THEN
        RAISE EXCEPTION 'No fue posible generar un código único, intenta de nuevo';
      END IF;
    END;
  END LOOP;

  RETURN v_existing;
END;
$$;

-- ------------------------------------------------------------
-- 5. RPC: revocar código (queda inutilizable para importar)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.revoke_share_code(p_plan_id uuid)
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

  UPDATE public.training_plans
     SET share_code = NULL,
         updated_at = now()
   WHERE id = p_plan_id
     AND created_by = v_profile_id
     AND kind = 'personal';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Rutina no encontrada o no te pertenece';
  END IF;
END;
$$;

-- ------------------------------------------------------------
-- 6. RPC: importar por código → COPIA independiente para el llamador
--    El código actúa como credencial: NO se abre SELECT público.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.import_routine_by_code(p_code text)
RETURNS uuid
LANGUAGE plpgsql VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_profile_id uuid;
  v_norm text;
  v_source public.training_plans%ROWTYPE;
  v_new_id uuid;
BEGIN
  SELECT id INTO v_profile_id
  FROM public.profiles WHERE auth_user_id = auth.uid();

  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'Perfil no encontrado para el usuario actual';
  END IF;

  -- Normalizar entrada: acepta minúsculas, espacios o falta de guion
  v_norm := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));

  SELECT * INTO v_source
  FROM public.training_plans
  WHERE share_code IS NOT NULL
    AND replace(share_code, '-', '') = v_norm
    AND kind = 'personal';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Código inválido o ya revocado';
  END IF;

  IF v_source.created_by = v_profile_id THEN
    RAISE EXCEPTION 'Esta rutina ya es tuya, no puedes importarla';
  END IF;

  -- Fork completo: plan + ejercicios como rutina privada del receptor
  INSERT INTO public.training_plans (name, description, kind, created_by)
  VALUES (v_source.name || ' (copia)', v_source.description, 'personal', v_profile_id)
  RETURNING id INTO v_new_id;

  INSERT INTO public.plan_exercises (
    plan_id, exercise_id, exercise_name, sets, reps,
    rest_seconds, day, notes, order_index, muscle, reference_link
  )
  SELECT
    v_new_id, pe.exercise_id, pe.exercise_name, pe.sets, pe.reps,
    pe.rest_seconds, pe.day, pe.notes, pe.order_index, pe.muscle, pe.reference_link
  FROM public.plan_exercises pe
  WHERE pe.plan_id = v_source.id;

  RETURN v_new_id;
END;
$$;

-- ------------------------------------------------------------
-- 7. Permisos de ejecución (solo usuarios autenticados)
-- ------------------------------------------------------------
REVOKE ALL ON FUNCTION public.generate_share_code(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_share_code(uuid, boolean) TO authenticated;

REVOKE ALL ON FUNCTION public.revoke_share_code(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.revoke_share_code(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.import_routine_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.import_routine_by_code(text) TO authenticated;

COMMENT ON COLUMN public.training_plans.kind IS
  'trainer = creado por entrenador/admin (flujo original); personal = rutina propia del miembro';
COMMENT ON COLUMN public.training_plans.share_code IS
  'Codigo de comparticion XXXX-XXXX; NULL = no compartida. Importar crea copia independiente.';
