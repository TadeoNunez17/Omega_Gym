-- Omega Gym — Schema Inicial
-- Estado: draft
-- Fecha: 2026-05-01
-- ============================================
-- Perfiles
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'trainer', 'member')),
  huella_template TEXT, -- Template de huella (base64 o formato del lector)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Tipos de membresía
-- ============================================
CREATE TABLE membership_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  duration_days INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Membresías
-- ============================================
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES profiles(id) NOT NULL,
  type_id UUID REFERENCES membership_types(id) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Pagos
-- ============================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID REFERENCES memberships(id) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('cash', 'card', 'transfer')),
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Planes de entrenamiento
-- ============================================
CREATE TABLE training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id) NOT NULL,
  is_template BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Registros de entrada (huella)
-- ============================================
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES profiles(id) NOT NULL,
  membership_id UUID REFERENCES memberships(id),
  check_in_time TIMESTAMPTZ DEFAULT NOW(),
  check_out_time TIMESTAMPTZ,
  method TEXT NOT NULL DEFAULT 'fingerprint' CHECK (method IN ('fingerprint', 'manual', 'card')),
  device_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Función: validar membresía activa al registrar entrada
-- ============================================
CREATE OR REPLACE FUNCTION validate_active_membership()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.membership_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM memberships
      WHERE id = NEW.membership_id
        AND status = 'active'
        AND start_date <= CURRENT_DATE
        AND end_date >= CURRENT_DATE
    ) THEN
      RAISE EXCEPTION 'La membresía no está activa o ha expirado';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_membership_active
  BEFORE INSERT ON check_ins
  FOR EACH ROW EXECUTE FUNCTION validate_active_membership();

-- ============================================
-- Ejercicios del plan
-- ============================================
CREATE TABLE plan_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES training_plans(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  sets INTEGER,
  reps INTEGER,
  rest_seconds INTEGER,
  notes TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS habilitado en todas las tablas (Fix #2 y #3)
-- ============================================
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_types  ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships       ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans    ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_exercises    ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins         ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Políticas RLS básicas
-- ============================================

-- profiles: cada quien ve/edita lo suyo; admin ve todo
CREATE POLICY "Own profile select"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Own profile update"   ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin select all"     ON profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- memberships: el miembro ve las suyas; admin ve todas
CREATE POLICY "Member sees own memberships" ON memberships FOR SELECT
  USING (member_id = auth.uid());
CREATE POLICY "Admin manages memberships"   ON memberships FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- training_plans: trainer/admin gestionan; miembro ve los suyos
CREATE POLICY "See own or assigned plans" ON training_plans FOR SELECT
  USING (assigned_to = auth.uid() OR created_by = auth.uid());
CREATE POLICY "Trainer creates plans" ON training_plans FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','trainer')));

-- check_ins: cada miembro ve sus propias entradas
CREATE POLICY "Member sees own check_ins" ON check_ins FOR SELECT
  USING (member_id = auth.uid());

-- ============================================
-- Trigger updated_at (Fix #1: search_path fijo)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
   SECURITY INVOKER
   SET search_path = '';      -- ← Fix vulnerabilidad search path

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_plans_updated_at
  BEFORE UPDATE ON training_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();