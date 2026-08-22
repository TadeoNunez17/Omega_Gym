-- TKT-OMEGYM-024 (SPEC_001 extensión): visibilidad de rutinas personales en "Mi plan"
-- true (default) = aparece como pestaña en Mi plan; false = solo en Mis rutinas.
-- Retrocompatible: rutinas existentes nacen visibles. Sin cambios RLS:
-- los miembros ya pueden actualizar sus propias rutinas personales.

ALTER TABLE public.training_plans
  ADD COLUMN IF NOT EXISTS show_in_plan BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN public.training_plans.show_in_plan IS
  'Solo rutinas kind=personal: control del miembro para mostrar u ocultar la rutina en su vista Mi plan';
