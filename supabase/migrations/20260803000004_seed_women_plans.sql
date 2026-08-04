-- Omega Gym — Migración 011: Seed Women Training Plans
-- Rutinas de entrenamiento para mujeres (catálogo enlazado por external_id)
-- Fecha: 2026-08-03
-- Creados por: Admin Omega
-- Idempotente: re-ejecutable sin duplicar
-- ============================================
-- Strong Curves (18 ejercicios)
INSERT INTO training_plans (name, description, created_by)
SELECT 'Strong Curves', 'Rutina de glúteos de Bret Contreras: 3 días a la semana (A, B, C) con enfoque en glúteo y tren inferior.', 'aa4450d2-cdcd-47cc-9103-85872759d2e0'
WHERE NOT EXISTS (SELECT 1 FROM training_plans WHERE name = 'Strong Curves');

INSERT INTO plan_exercises (plan_id, exercise_id, exercise_name, muscle, sets, reps, rest_seconds, day, order_index)
SELECT tp.id, e.id, v.exercise_name, v.muscle, v.sets, v.reps, v.rest, v.day, v.ord
FROM training_plans tp
CROSS JOIN (VALUES
  ('1409', 'Glute bridge con barra', 'Glúteo', 3, 15, 60, 0, 0),
  ('1760', 'Sentadilla goblet', 'Pierna', 3, 12, 60, 0, 1),
  ('0196', 'Cable pull-through', 'Glúteo', 3, 15, 60, 0, 2),
  ('0130', 'Bench hip extension', 'Glúteo', 3, 12, 60, 0, 3),
  ('0597', 'Silla abductora', 'Glúteo', 3, 15, 45, 0, 4),
  ('3236', 'Hip thrust con banda', 'Glúteo', 3, 15, 60, 0, 5),
  ('0289', 'Press de banca con mancuernas', 'Pecho', 3, 10, 60, 2, 0),
  ('0293', 'Remo con mancuerna', 'Espalda', 3, 10, 60, 2, 1),
  ('2330', 'Jalón al pecho', 'Espalda', 3, 12, 60, 2, 2),
  ('0405', 'Press de hombros con mancuernas', 'Hombro', 3, 10, 60, 2, 3),
  ('0294', 'Curl de bíceps con mancuernas', 'Bíceps', 3, 12, 45, 2, 4),
  ('0201', 'Extensión de tríceps en polea', 'Tríceps', 3, 12, 45, 2, 5),
  ('3562', 'Glute bridge en banco con barra', 'Glúteo', 3, 12, 60, 4, 0),
  ('0739', 'Prensa de pierna 45°', 'Pierna', 3, 12, 60, 4, 1),
  ('3645', 'Single leg bridge', 'Glúteo', 3, 12, 45, 4, 2),
  ('0599', 'Curl femoral sentado', 'Pierna', 3, 12, 45, 4, 3),
  ('0597', 'Silla abductora', 'Glúteo', 3, 15, 45, 4, 4),
  ('0276', 'Dead bug', 'Core', 3, 12, 30, 4, 5)
) AS v(external_id, exercise_name, muscle, sets, reps, rest, day, ord)
JOIN exercises e ON e.external_id = v.external_id
WHERE tp.name = 'Strong Curves'
  AND NOT EXISTS (
    SELECT 1 FROM plan_exercises pe
    WHERE pe.plan_id = tp.id AND pe.exercise_name = v.exercise_name AND pe.day = v.day
  );

-- Glute Focus (16 ejercicios)
INSERT INTO training_plans (name, description, created_by)
SELECT 'Glute Focus', 'Énfasis intenso en glúteo estilo Glute Lab: 3 días con abducciones, hip thrusts, puentes y core.', 'aa4450d2-cdcd-47cc-9103-85872759d2e0'
WHERE NOT EXISTS (SELECT 1 FROM training_plans WHERE name = 'Glute Focus');

INSERT INTO plan_exercises (plan_id, exercise_id, exercise_name, muscle, sets, reps, rest_seconds, day, order_index)
SELECT tp.id, e.id, v.exercise_name, v.muscle, v.sets, v.reps, v.rest, v.day, v.ord
FROM training_plans tp
CROSS JOIN (VALUES
  ('1409', 'Glute bridge con barra', 'Glúteo', 4, 15, 60, 0, 0),
  ('0196', 'Cable pull-through', 'Glúteo', 4, 15, 60, 0, 1),
  ('0130', 'Bench hip extension', 'Glúteo', 3, 12, 45, 0, 2),
  ('3236', 'Hip thrust con banda', 'Glúteo', 3, 15, 60, 0, 3),
  ('0597', 'Silla abductora', 'Glúteo', 3, 15, 45, 0, 4),
  ('0710', 'Side hip abduction', 'Glúteo', 3, 12, 30, 0, 5),
  ('1760', 'Sentadilla goblet', 'Pierna', 3, 12, 60, 2, 0),
  ('0085', 'Peso muerto rumano', 'Pierna', 3, 12, 60, 2, 1),
  ('0739', 'Prensa de pierna 45°', 'Pierna', 3, 12, 60, 2, 2),
  ('0599', 'Curl femoral sentado', 'Pierna', 3, 12, 45, 2, 3),
  ('1372', 'Elevación de pantorrilla de pie', 'Pantorrilla', 4, 15, 45, 2, 4),
  ('3561', 'Glute bridge march', 'Glúteo', 3, 12, 45, 4, 0),
  ('3645', 'Single leg bridge', 'Glúteo', 3, 12, 45, 4, 1),
  ('0228', 'Extensión de cadera en polea', 'Glúteo', 3, 12, 45, 4, 2),
  ('0464', 'Plancha con twist', 'Core', 3, 1, 45, 4, 3),
  ('0630', 'Mountain climber', 'Core', 3, 20, 30, 4, 4)
) AS v(external_id, exercise_name, muscle, sets, reps, rest, day, ord)
JOIN exercises e ON e.external_id = v.external_id
WHERE tp.name = 'Glute Focus'
  AND NOT EXISTS (
    SELECT 1 FROM plan_exercises pe
    WHERE pe.plan_id = tp.id AND pe.exercise_name = v.exercise_name AND pe.day = v.day
  );

-- Thinner Leaner Stronger (24 ejercicios)
INSERT INTO training_plans (name, description, created_by)
SELECT 'Thinner Leaner Stronger', 'Upper/Lower de Mike Matthews para mujeres: 4 días con volumen moderado para tonificar y fortalecer.', 'aa4450d2-cdcd-47cc-9103-85872759d2e0'
WHERE NOT EXISTS (SELECT 1 FROM training_plans WHERE name = 'Thinner Leaner Stronger');

INSERT INTO plan_exercises (plan_id, exercise_id, exercise_name, muscle, sets, reps, rest_seconds, day, order_index)
SELECT tp.id, e.id, v.exercise_name, v.muscle, v.sets, v.reps, v.rest, v.day, v.ord
FROM training_plans tp
CROSS JOIN (VALUES
  ('0289', 'Press de banca con mancuernas', 'Pecho', 4, 10, 60, 0, 0),
  ('2330', 'Jalón al pecho', 'Espalda', 4, 10, 60, 0, 1),
  ('0405', 'Press de hombros con mancuernas', 'Hombro', 3, 10, 60, 0, 2),
  ('0293', 'Remo con mancuerna', 'Espalda', 3, 10, 60, 0, 3),
  ('0334', 'Elevaciones laterales', 'Hombro', 3, 15, 45, 0, 4),
  ('0294', 'Curl de bíceps con mancuernas', 'Bíceps', 3, 12, 45, 0, 5),
  ('1760', 'Sentadilla goblet', 'Pierna', 4, 10, 60, 1, 0),
  ('0085', 'Peso muerto rumano', 'Pierna', 4, 10, 60, 1, 1),
  ('0739', 'Prensa de pierna 45°', 'Pierna', 3, 12, 60, 1, 2),
  ('0585', 'Extensión de pierna', 'Pierna', 3, 12, 45, 1, 3),
  ('0599', 'Curl femoral sentado', 'Pierna', 3, 12, 45, 1, 4),
  ('0597', 'Silla abductora', 'Glúteo', 3, 15, 45, 1, 5),
  ('0314', 'Press inclinado con mancuernas', 'Pecho', 4, 10, 60, 3, 0),
  ('0027', 'Remo con barra', 'Espalda', 4, 10, 60, 3, 1),
  ('0091', 'Press militar sentado', 'Hombro', 3, 10, 60, 3, 2),
  ('0017', 'Dominadas asistidas', 'Espalda', 3, 10, 60, 3, 3),
  ('0313', 'Curl martillo', 'Bíceps', 3, 12, 45, 3, 4),
  ('0201', 'Extensión de tríceps en polea', 'Tríceps', 3, 12, 45, 3, 5),
  ('0043', 'Sentadilla con barra', 'Pierna', 4, 10, 90, 4, 0),
  ('0032', 'Peso muerto', 'Pierna', 3, 8, 120, 4, 1),
  ('1409', 'Glute bridge con barra', 'Glúteo', 3, 15, 60, 4, 2),
  ('0597', 'Silla abductora', 'Glúteo', 3, 15, 45, 4, 3),
  ('0599', 'Curl femoral sentado', 'Pierna', 3, 12, 45, 4, 4),
  ('1372', 'Elevación de pantorrilla de pie', 'Pantorrilla', 4, 15, 45, 4, 5)
) AS v(external_id, exercise_name, muscle, sets, reps, rest, day, ord)
JOIN exercises e ON e.external_id = v.external_id
WHERE tp.name = 'Thinner Leaner Stronger'
  AND NOT EXISTS (
    SELECT 1 FROM plan_exercises pe
    WHERE pe.plan_id = tp.id AND pe.exercise_name = v.exercise_name AND pe.day = v.day
  );

