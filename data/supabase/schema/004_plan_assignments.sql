-- Tabla de asignaciones múltiples: un plan puede asignarse a N miembros
CREATE TABLE plan_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES training_plans(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plan_id, member_id)
);

-- Migrar asignaciones existentes (legacy assigned_to)
INSERT INTO plan_assignments (plan_id, member_id, assigned_at)
SELECT id, assigned_to, created_at
FROM training_plans
WHERE assigned_to IS NOT NULL;

-- Índices
CREATE INDEX idx_plan_assignments_plan ON plan_assignments(plan_id);
CREATE INDEX idx_plan_assignments_member ON plan_assignments(member_id);

-- RLS
ALTER TABLE plan_assignments ENABLE ROW LEVEL SECURITY;

-- Admins pueden gestionar todas las asignaciones
CREATE POLICY "Admins can manage all assignments"
ON plan_assignments FOR ALL
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Miembros pueden ver sus propias asignaciones
CREATE POLICY "Members can view own assignments"
ON plan_assignments FOR SELECT
USING (member_id = auth.uid());

-- Entrenadores pueden ver todas las asignaciones
CREATE POLICY "Trainers can view all assignments"
ON plan_assignments FOR SELECT
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'trainer')
);
