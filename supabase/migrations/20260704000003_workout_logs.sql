-- Omega Gym — Workout logs: registro de series completadas por el miembro
-- ============================================
CREATE TABLE workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES plan_exercises(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  set_number INTEGER NOT NULL,
  weight NUMERIC(6,2),
  reps INTEGER,
  completed BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, exercise_id, logged_date, set_number)
);

CREATE INDEX idx_workout_logs_member_date ON workout_logs(member_id, logged_date);
CREATE INDEX idx_workout_logs_exercise ON workout_logs(exercise_id);

ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

-- Miembros: CRUD completo sobre sus propios logs
CREATE POLICY "Members manage own logs" ON workout_logs FOR ALL
USING (
  member_id IN (SELECT id FROM profiles WHERE profiles.auth_user_id = auth.uid())
);

-- Staff: solo lectura
CREATE POLICY "Staff view all logs" ON workout_logs FOR SELECT
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'trainer'))
);
