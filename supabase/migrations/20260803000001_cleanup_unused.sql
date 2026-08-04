-- Omega Gym — Cleanup de datos y tablas sin uso
-- Fecha: 2026-08-03

-- 1. Drop tabla workout_logs (sin uso en la app; servicio eliminado)
DROP TABLE IF EXISTS workout_logs;

-- 2. Drop columna is_template de training_plans (sin uso en la app)
ALTER TABLE training_plans DROP COLUMN IF EXISTS is_template;

-- 3. Borrar plan de prueba "si" (0 asignaciones; borra ejercicios/asignaciones en cascada)
DELETE FROM training_plans
WHERE id = 'a97caf44-a145-49ec-ad44-7fe01b5a0b01'
  AND name = 'si';

-- 4. Borrar tipos de membresía inactivos sin membresías asociadas
DELETE FROM membership_types
WHERE name IN ('Anual', 'Trimestral')
  AND is_active = FALSE
  AND NOT EXISTS (
    SELECT 1 FROM memberships WHERE memberships.type_id = membership_types.id
  );