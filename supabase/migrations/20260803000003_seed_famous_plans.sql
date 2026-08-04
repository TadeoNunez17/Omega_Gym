-- Omega Gym — Migración 010: Seed Famous Training Plans
-- Planes famosos de entrenamiento (catálogo enlazado por external_id)
-- Fecha: 2026-08-03
-- Creados por: Admin Omega
-- Idempotente: re-ejecutable sin duplicar
-- ============================================
-- Push / Pull / Legs (19 ejercicios)
INSERT INTO training_plans (name, description, created_by)
SELECT 'Push / Pull / Legs', 'Rutina clásica de volumen 3 días por semana: empuje, jalón y pierna.', 'aa4450d2-cdcd-47cc-9103-85872759d2e0'
WHERE NOT EXISTS (SELECT 1 FROM training_plans WHERE name = 'Push / Pull / Legs');

INSERT INTO plan_exercises (plan_id, exercise_id, exercise_name, muscle, sets, reps, rest_seconds, day, order_index)
SELECT tp.id, e.id, v.exercise_name, v.muscle, v.sets, v.reps, v.rest, v.day, v.ord
FROM training_plans tp
CROSS JOIN (VALUES
  ('0025', 'Press de banca con barra', 'Pecho', 4, 10, 120, 0, 0),
  ('0314', 'Press inclinado con mancuernas', 'Pecho', 3, 10, 90, 0, 1),
  ('0308', 'Aperturas con mancuernas', 'Pecho', 3, 12, 60, 0, 2),
  ('0091', 'Press militar sentado', 'Hombro', 3, 10, 90, 0, 3),
  ('0334', 'Elevaciones laterales', 'Hombro', 3, 15, 60, 0, 4),
  ('0814', 'Fondos de tríceps', 'Tríceps', 3, 10, 60, 0, 5),
  ('0201', 'Extensión de tríceps en polea', 'Tríceps', 3, 12, 60, 0, 6),
  ('0652', 'Dominadas', 'Espalda', 3, 8, 120, 1, 0),
  ('2330', 'Jalón al pecho', 'Espalda', 3, 10, 90, 1, 1),
  ('0027', 'Remo con barra', 'Espalda', 4, 10, 90, 1, 2),
  ('0861', 'Remo sentado en polea', 'Espalda', 3, 10, 90, 1, 3),
  ('0031', 'Curl con barra', 'Bíceps', 3, 10, 90, 1, 4),
  ('0313', 'Curl martillo', 'Bíceps', 3, 12, 60, 1, 5),
  ('0043', 'Sentadilla con barra', 'Pierna', 4, 10, 120, 2, 0),
  ('0032', 'Peso muerto', 'Pierna', 3, 8, 180, 2, 1),
  ('0739', 'Prensa de pierna 45°', 'Pierna', 3, 12, 90, 2, 2),
  ('0599', 'Curl femoral sentado', 'Pierna', 3, 12, 60, 2, 3),
  ('0585', 'Extensión de pierna', 'Pierna', 3, 12, 60, 2, 4),
  ('1372', 'Elevación de pantorrilla de pie', 'Pantorrilla', 4, 15, 45, 2, 5)
) AS v(external_id, exercise_name, muscle, sets, reps, rest, day, ord)
JOIN exercises e ON e.external_id = v.external_id
WHERE tp.name = 'Push / Pull / Legs'
  AND NOT EXISTS (
    SELECT 1 FROM plan_exercises pe
    WHERE pe.plan_id = tp.id AND pe.exercise_name = v.exercise_name AND pe.day = v.day
  );

-- Upper / Lower (22 ejercicios)
INSERT INTO training_plans (name, description, created_by)
SELECT 'Upper / Lower', 'División de 4 días: dos de tren superior y dos de tren inferior. Día 3 es descanso.', 'aa4450d2-cdcd-47cc-9103-85872759d2e0'
WHERE NOT EXISTS (SELECT 1 FROM training_plans WHERE name = 'Upper / Lower');

INSERT INTO plan_exercises (plan_id, exercise_id, exercise_name, muscle, sets, reps, rest_seconds, day, order_index)
SELECT tp.id, e.id, v.exercise_name, v.muscle, v.sets, v.reps, v.rest, v.day, v.ord
FROM training_plans tp
CROSS JOIN (VALUES
  ('0025', 'Press de banca con barra', 'Pecho', 4, 8, 120, 0, 0),
  ('0027', 'Remo con barra', 'Espalda', 4, 8, 120, 0, 1),
  ('0091', 'Press militar sentado', 'Hombro', 3, 8, 90, 0, 2),
  ('0652', 'Dominadas', 'Espalda', 3, 8, 90, 0, 3),
  ('0031', 'Curl con barra', 'Bíceps', 3, 10, 60, 0, 4),
  ('0814', 'Fondos de tríceps', 'Tríceps', 3, 10, 60, 0, 5),
  ('0043', 'Sentadilla con barra', 'Pierna', 4, 8, 120, 1, 0),
  ('0085', 'Peso muerto rumano', 'Pierna', 3, 10, 120, 1, 1),
  ('0739', 'Prensa de pierna 45°', 'Pierna', 3, 12, 90, 1, 2),
  ('0599', 'Curl femoral sentado', 'Pierna', 3, 12, 60, 1, 3),
  ('1372', 'Elevación de pantorrilla de pie', 'Pantorrilla', 4, 15, 45, 1, 4),
  ('0314', 'Press inclinado con mancuernas', 'Pecho', 3, 10, 90, 3, 0),
  ('2330', 'Jalón al pecho', 'Espalda', 3, 10, 90, 3, 1),
  ('0334', 'Elevaciones laterales', 'Hombro', 3, 12, 60, 3, 2),
  ('0861', 'Remo sentado en polea', 'Espalda', 3, 10, 90, 3, 3),
  ('0313', 'Curl martillo', 'Bíceps', 3, 12, 60, 3, 4),
  ('0201', 'Extensión de tríceps en polea', 'Tríceps', 3, 12, 60, 3, 5),
  ('0032', 'Peso muerto', 'Pierna', 4, 6, 180, 4, 0),
  ('0042', 'Sentadilla frontal', 'Pierna', 3, 10, 120, 4, 1),
  ('0585', 'Extensión de pierna', 'Pierna', 3, 12, 60, 4, 2),
  ('0599', 'Curl femoral sentado', 'Pierna', 3, 12, 60, 4, 3),
  ('1372', 'Elevación de pantorrilla de pie', 'Pantorrilla', 4, 15, 45, 4, 4)
) AS v(external_id, exercise_name, muscle, sets, reps, rest, day, ord)
JOIN exercises e ON e.external_id = v.external_id
WHERE tp.name = 'Upper / Lower'
  AND NOT EXISTS (
    SELECT 1 FROM plan_exercises pe
    WHERE pe.plan_id = tp.id AND pe.exercise_name = v.exercise_name AND pe.day = v.day
  );

-- Full Body (15 ejercicios)
INSERT INTO training_plans (name, description, created_by)
SELECT 'Full Body', 'Cuerpo completo 3 días por semana (Lun, Mié, Vie). Ideal para principiantes y fuerza.', 'aa4450d2-cdcd-47cc-9103-85872759d2e0'
WHERE NOT EXISTS (SELECT 1 FROM training_plans WHERE name = 'Full Body');

INSERT INTO plan_exercises (plan_id, exercise_id, exercise_name, muscle, sets, reps, rest_seconds, day, order_index)
SELECT tp.id, e.id, v.exercise_name, v.muscle, v.sets, v.reps, v.rest, v.day, v.ord
FROM training_plans tp
CROSS JOIN (VALUES
  ('0043', 'Sentadilla con barra', 'Pierna', 3, 10, 120, 0, 0),
  ('0025', 'Press de banca con barra', 'Pecho', 3, 10, 120, 0, 1),
  ('0027', 'Remo con barra', 'Espalda', 3, 10, 120, 0, 2),
  ('0091', 'Press militar sentado', 'Hombro', 3, 10, 90, 0, 3),
  ('0085', 'Peso muerto rumano', 'Pierna', 3, 10, 120, 0, 4),
  ('0032', 'Peso muerto', 'Pierna', 3, 5, 180, 2, 0),
  ('0314', 'Press inclinado con mancuernas', 'Pecho', 3, 10, 90, 2, 1),
  ('2330', 'Jalón al pecho', 'Espalda', 3, 10, 90, 2, 2),
  ('0031', 'Curl con barra', 'Bíceps', 3, 10, 60, 2, 3),
  ('0814', 'Fondos de tríceps', 'Tríceps', 3, 10, 60, 2, 4),
  ('0042', 'Sentadilla frontal', 'Pierna', 3, 10, 120, 4, 0),
  ('0405', 'Press militar con mancuernas', 'Hombro', 3, 10, 90, 4, 1),
  ('0861', 'Remo sentado en polea', 'Espalda', 3, 10, 90, 4, 2),
  ('0334', 'Elevaciones laterales', 'Hombro', 3, 12, 60, 4, 3),
  ('0313', 'Curl martillo', 'Bíceps', 3, 12, 60, 4, 4)
) AS v(external_id, exercise_name, muscle, sets, reps, rest, day, ord)
JOIN exercises e ON e.external_id = v.external_id
WHERE tp.name = 'Full Body'
  AND NOT EXISTS (
    SELECT 1 FROM plan_exercises pe
    WHERE pe.plan_id = tp.id AND pe.exercise_name = v.exercise_name AND pe.day = v.day
  );

-- Bro Split (28 ejercicios)
INSERT INTO training_plans (name, description, created_by)
SELECT 'Bro Split', 'Split clásico de 5 días por grupo muscular: pecho, espalda, pierna, hombro y brazo.', 'aa4450d2-cdcd-47cc-9103-85872759d2e0'
WHERE NOT EXISTS (SELECT 1 FROM training_plans WHERE name = 'Bro Split');

INSERT INTO plan_exercises (plan_id, exercise_id, exercise_name, muscle, sets, reps, rest_seconds, day, order_index)
SELECT tp.id, e.id, v.exercise_name, v.muscle, v.sets, v.reps, v.rest, v.day, v.ord
FROM training_plans tp
CROSS JOIN (VALUES
  ('0025', 'Press de banca con barra', 'Pecho', 4, 10, 90, 0, 0),
  ('0314', 'Press inclinado con mancuernas', 'Pecho', 3, 10, 90, 0, 1),
  ('0308', 'Aperturas con mancuernas', 'Pecho', 3, 12, 60, 0, 2),
  ('0188', 'Aperturas en polea media', 'Pecho', 3, 12, 60, 0, 3),
  ('0251', 'Fondos de pecho', 'Pecho', 3, 10, 60, 0, 4),
  ('0652', 'Dominadas', 'Espalda', 4, 8, 120, 1, 0),
  ('2330', 'Jalón al pecho', 'Espalda', 3, 10, 90, 1, 1),
  ('0027', 'Remo con barra', 'Espalda', 4, 10, 90, 1, 2),
  ('0861', 'Remo sentado en polea', 'Espalda', 3, 10, 90, 1, 3),
  ('0293', 'Remo con mancuerna', 'Espalda', 3, 10, 90, 1, 4),
  ('0031', 'Curl con barra', 'Bíceps', 3, 10, 60, 1, 5),
  ('0043', 'Sentadilla con barra', 'Pierna', 4, 10, 120, 2, 0),
  ('0032', 'Peso muerto', 'Pierna', 3, 8, 180, 2, 1),
  ('0739', 'Prensa de pierna 45°', 'Pierna', 3, 12, 90, 2, 2),
  ('0599', 'Curl femoral sentado', 'Pierna', 3, 12, 60, 2, 3),
  ('0585', 'Extensión de pierna', 'Pierna', 3, 12, 60, 2, 4),
  ('1372', 'Elevación de pantorrilla de pie', 'Pantorrilla', 4, 15, 45, 2, 5),
  ('0091', 'Press militar sentado', 'Hombro', 4, 10, 90, 3, 0),
  ('0334', 'Elevaciones laterales', 'Hombro', 3, 15, 60, 3, 1),
  ('0310', 'Elevaciones frontales', 'Hombro', 3, 12, 60, 3, 2),
  ('0120', 'Remo al mentón con barra', 'Hombro', 3, 12, 60, 3, 3),
  ('0380', 'Pájaros (elev. posteriores)', 'Hombro', 3, 12, 60, 3, 4),
  ('0031', 'Curl con barra', 'Bíceps', 4, 10, 60, 4, 0),
  ('0313', 'Curl martillo', 'Bíceps', 3, 12, 60, 4, 1),
  ('0297', 'Curl concentrado', 'Bíceps', 3, 12, 60, 4, 2),
  ('0201', 'Extensión de tríceps en polea', 'Tríceps', 4, 12, 60, 4, 3),
  ('0814', 'Fondos de tríceps', 'Tríceps', 3, 10, 60, 4, 4),
  ('0333', 'Patada de tríceps', 'Tríceps', 3, 12, 60, 4, 5)
) AS v(external_id, exercise_name, muscle, sets, reps, rest, day, ord)
JOIN exercises e ON e.external_id = v.external_id
WHERE tp.name = 'Bro Split'
  AND NOT EXISTS (
    SELECT 1 FROM plan_exercises pe
    WHERE pe.plan_id = tp.id AND pe.exercise_name = v.exercise_name AND pe.day = v.day
  );

-- StrongLifts 5x5 (6 ejercicios)
INSERT INTO training_plans (name, description, created_by)
SELECT 'StrongLifts 5x5', 'Programa de fuerza para principiantes: ejercicios compuestos en días A/B, 3 veces por semana.', 'aa4450d2-cdcd-47cc-9103-85872759d2e0'
WHERE NOT EXISTS (SELECT 1 FROM training_plans WHERE name = 'StrongLifts 5x5');

INSERT INTO plan_exercises (plan_id, exercise_id, exercise_name, muscle, sets, reps, rest_seconds, day, order_index)
SELECT tp.id, e.id, v.exercise_name, v.muscle, v.sets, v.reps, v.rest, v.day, v.ord
FROM training_plans tp
CROSS JOIN (VALUES
  ('0043', 'Sentadilla con barra', 'Pierna', 5, 5, 180, 0, 0),
  ('0025', 'Press de banca con barra', 'Pecho', 5, 5, 180, 0, 1),
  ('0027', 'Remo con barra', 'Espalda', 5, 5, 120, 0, 2),
  ('0043', 'Sentadilla con barra', 'Pierna', 5, 5, 180, 2, 0),
  ('0091', 'Press militar sentado', 'Hombro', 5, 5, 180, 2, 1),
  ('0032', 'Peso muerto', 'Pierna', 1, 5, 300, 2, 2)
) AS v(external_id, exercise_name, muscle, sets, reps, rest, day, ord)
JOIN exercises e ON e.external_id = v.external_id
WHERE tp.name = 'StrongLifts 5x5'
  AND NOT EXISTS (
    SELECT 1 FROM plan_exercises pe
    WHERE pe.plan_id = tp.id AND pe.exercise_name = v.exercise_name AND pe.day = v.day
  );

