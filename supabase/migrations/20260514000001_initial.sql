-- Omega Gym — Schema Inicial (idempotent)
-- ============================================
-- Perfiles
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'trainer', 'member')),
  is_active BOOLEAN DEFAULT TRUE,
  huella_template TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Tipos de membresía
-- ============================================
CREATE TABLE IF NOT EXISTS membership_types (
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
CREATE TABLE IF NOT EXISTS memberships (
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
CREATE TABLE IF NOT EXISTS payments (
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
CREATE TABLE IF NOT EXISTS training_plans (
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
CREATE TABLE IF NOT EXISTS check_ins (
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
-- Ejercicios del plan
-- ============================================
CREATE TABLE IF NOT EXISTS plan_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES training_plans(id),
  exercise_name TEXT NOT NULL,
  sets INTEGER,
  reps INTEGER,
  rest_seconds INTEGER,
  day INTEGER CHECK (day >= 0 AND day <= 6),
  notes TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
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

-- ============================================
-- RLS habilitado en todas las tablas
-- ============================================
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_types  ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships       ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans    ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_exercises    ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins         ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Políticas RLS (drop first for idempotency)
-- ============================================
DROP POLICY IF EXISTS "Own profile select"   ON profiles;
DROP POLICY IF EXISTS "Own profile update"   ON profiles;
DROP POLICY IF EXISTS "Admin select all"     ON profiles;
DROP POLICY IF EXISTS "Member sees own memberships" ON memberships;
DROP POLICY IF EXISTS "Admin manages memberships"   ON memberships;
DROP POLICY IF EXISTS "See own or assigned plans"   ON training_plans;
DROP POLICY IF EXISTS "Trainer creates plans"       ON training_plans;
DROP POLICY IF EXISTS "Member sees own check_ins"   ON check_ins;

CREATE POLICY "Own profile select"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Own profile update"   ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin select all"     ON profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Member sees own memberships" ON memberships FOR SELECT
  USING (member_id = auth.uid());
CREATE POLICY "Admin manages memberships"   ON memberships FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "See own or assigned plans" ON training_plans FOR SELECT
  USING (assigned_to = auth.uid() OR created_by = auth.uid());
CREATE POLICY "Trainer creates plans" ON training_plans FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','trainer')));

CREATE POLICY "Member sees own check_ins" ON check_ins FOR SELECT
  USING (member_id = auth.uid());

-- ============================================
-- Trigger: crear perfil automático al registrarse
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuario'),
    'member'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- Trigger updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
   SECURITY INVOKER
   SET search_path = '';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_training_plans_updated_at ON training_plans;
CREATE TRIGGER update_training_plans_updated_at
  BEFORE UPDATE ON training_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Trigger check_membership_active
-- ============================================
DROP TRIGGER IF EXISTS check_membership_active ON check_ins;
CREATE TRIGGER check_membership_active
  BEFORE INSERT ON check_ins
  FOR EACH ROW EXECUTE FUNCTION validate_active_membership();
