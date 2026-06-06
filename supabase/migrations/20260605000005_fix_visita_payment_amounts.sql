-- Omega Gym — Reparar pagos de Visita con monto incorrecto
-- =====================================================
-- Corrige payments donde el monto no coincide con el
-- precio del tipo de membresía (ej. Visita cobrada a $320
-- en vez de $30).
-- Fecha: 2026-06-05

UPDATE payments
SET amount = mt.price
FROM memberships m
JOIN membership_types mt ON m.type_id = mt.id
WHERE payments.membership_id = m.id
  AND mt.name = 'Visita'
  AND payments.amount != mt.price;
