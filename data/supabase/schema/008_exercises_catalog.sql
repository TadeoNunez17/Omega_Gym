-- Omega Gym — Migracion 008: Tabla exercises (catalogo de ejercicios)
-- Estado: active
-- Fecha: 2026-07-14
-- ============================================
-- Tabla: exercises (catalogo de ejercicios del gym)
-- ============================================
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  body_part TEXT NOT NULL,
  equipment TEXT NOT NULL,
  target TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  secondary_muscles TEXT[],
  instructions_es TEXT,
  gif_url TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS: todos leen, solo admin escribe
-- ============================================
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read exercises"
  ON exercises FOR SELECT
  USING (true);

CREATE POLICY "Admin manages exercises"
  ON exercises FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- Columna exercise_id en plan_exercises
-- ============================================
ALTER TABLE plan_exercises
  ADD COLUMN exercise_id UUID REFERENCES exercises(id);

-- ============================================
-- Indices para busquedas frecuentes
-- ============================================
CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX idx_exercises_equipment ON exercises(equipment);
CREATE INDEX idx_exercises_name_trgm ON exercises USING gin(name gin_trgm_ops);
CREATE INDEX idx_plan_exercises_exercise_id ON plan_exercises(exercise_id);

-- ============================================
-- Extension pg_trgm para busquedas ilike
-- ============================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;
