-- Eliminar duplicado de tipo Visita en membership_types
-- Se identificó un registro huérfano (sin membresías ni pagos asociados)
DELETE FROM membership_types WHERE id = '4a741e3f-175e-4c40-8b7b-4c50fa51179a';
