-- Omega Gym — Limpiar alias (ref. interna solo para admin)
-- =====================================================
-- El alias es solo referencia interna del admin para
-- identificar pre-registros. No es sobrenombre del miembro.
-- Se limpia todo; el admin lo asigna manualmente si desea.
-- Fecha: 2026-06-05

UPDATE profiles SET alias = NULL;
