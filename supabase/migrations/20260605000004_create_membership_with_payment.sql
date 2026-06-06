-- Omega Gym — Transacción atómica membresía + pago con validaciones
-- =====================================================
-- Reemplaza la lógica secuencial del lado cliente:
--   1. Valida que no haya membresía activa duplicada
--   2. Valida que Visita no use pago pendiente
--   3. Calcula end_date según duration_days si no se provee
--   4. Inserta membresía + pago en una sola transacción
-- Fecha: 2026-06-05

CREATE OR REPLACE FUNCTION create_membership_with_payment(
  p_member_id UUID,
  p_type_id UUID,
  p_start_date DATE,
  p_end_date DATE DEFAULT NULL,
  p_status TEXT DEFAULT 'active',
  p_payment_method TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_type_name TEXT;
  v_duration_days INT;
  v_price NUMERIC(10,2);
  v_end_date DATE;
  v_membership_id UUID;
  v_pay_method TEXT;
  v_pay_status TEXT;
  v_result JSON;
  v_existing_id UUID;
BEGIN
  -- === VALIDACIÓN 1: Obtener datos del tipo de membresía ===
  SELECT name, duration_days, price
  INTO v_type_name, v_duration_days, v_price
  FROM membership_types
  WHERE id = p_type_id;

  IF v_type_name IS NULL THEN
    RAISE EXCEPTION 'Tipo de membresía no encontrado: %', p_type_id;
  END IF;

  -- === VALIDACIÓN 2: No duplicar membresías activas (excluye Visita) ===
  SELECT m.id INTO v_existing_id
  FROM memberships m
  JOIN membership_types mt ON m.type_id = mt.id
  WHERE m.member_id = p_member_id
    AND m.status = 'active'
    AND mt.name != 'Visita'
    AND m.end_date >= p_start_date
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    RAISE EXCEPTION 'El miembro ya tiene una membresía activa (%). Cancélala primero.', v_existing_id;
  END IF;

  -- === VALIDACIÓN 3: Visita no permite pago pendiente ===
  IF v_type_name = 'Visita' AND p_payment_method = 'pending' THEN
    RAISE EXCEPTION 'Las membresías Visita no pueden tener pago pendiente. Selecciona un método de pago.';
  END IF;

  -- === Calcular end_date ===
  v_end_date := COALESCE(p_end_date, p_start_date + v_duration_days);

  -- === Insertar membresía ===
  INSERT INTO memberships (member_id, type_id, start_date, end_date, status)
  VALUES (p_member_id, p_type_id, p_start_date, v_end_date, p_status)
  RETURNING id INTO v_membership_id;

  -- === Insertar pago si hay método ===
  IF p_payment_method IS NOT NULL THEN
    v_pay_method := CASE WHEN p_payment_method = 'pending' THEN 'cash' ELSE p_payment_method END;
    v_pay_status := CASE WHEN p_payment_method = 'pending' THEN 'pending' ELSE 'paid' END;

    INSERT INTO payments (membership_id, amount, payment_date, method, status)
    VALUES (v_membership_id, v_price, p_start_date, v_pay_method, v_pay_status);
  END IF;

  -- === Devolver membresía creada ===
  SELECT json_build_object(
    'id', m.id,
    'member_id', m.member_id,
    'type_id', m.type_id,
    'start_date', m.start_date,
    'end_date', m.end_date,
    'status', m.status,
    'created_at', m.created_at
  ) INTO v_result
  FROM memberships m
  WHERE m.id = v_membership_id;

  RETURN v_result;
END;
$$;

-- Grant execute
GRANT EXECUTE ON FUNCTION create_membership_with_payment(UUID, UUID, DATE, DATE, TEXT, TEXT)
  TO anon, authenticated, service_role;
