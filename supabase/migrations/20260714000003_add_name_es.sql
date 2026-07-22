-- Omega Gym — Migration: Add name_es to exercises
-- Traduce los 50 ejercicios del catálogo a español
-- Fecha: 2026-07-21

-- 1. Agregar columna name_es
ALTER TABLE exercises ADD COLUMN name_es TEXT NOT NULL DEFAULT '';

-- 2. Traducir los 50 ejercicios
-- Pecho
UPDATE exercises SET name_es = 'Press de banca con barra' WHERE external_id = '0025';
UPDATE exercises SET name_es = 'Press de banca con mancuernas' WHERE external_id = '0289';
UPDATE exercises SET name_es = 'Aperturas con mancuerna' WHERE external_id = '0308';
UPDATE exercises SET name_es = 'Aperturas con mancuerna en balon' WHERE external_id = '1277';
UPDATE exercises SET name_es = 'Pullover con mancuerna' WHERE external_id = '0375';
UPDATE exercises SET name_es = 'Pullover con extension de cadera en balon' WHERE external_id = '1294';
UPDATE exercises SET name_es = 'Pullover con mancuerna en balon' WHERE external_id = '1295';

-- Espalda
UPDATE exercises SET name_es = 'Dominada arquero' WHERE external_id = '3293';
UPDATE exercises SET name_es = 'Remo con barra' WHERE external_id = '0027';
UPDATE exercises SET name_es = 'Encogimientos con barra' WHERE external_id = '0095';
UPDATE exercises SET name_es = 'Jalon al pecho en polea' WHERE external_id = '2330';
UPDATE exercises SET name_es = 'Encogimientos con mancuernas' WHERE external_id = '0406';
UPDATE exercises SET name_es = 'Plancha lateral con apertura posterior' WHERE external_id = '3664';
UPDATE exercises SET name_es = 'Dominada con agarre neutro' WHERE external_id = '0651';

-- Pierna
UPDATE exercises SET name_es = 'Peso muerto con barra' WHERE external_id = '0032';
UPDATE exercises SET name_es = 'Sentadilla con barra' WHERE external_id = '0043';
UPDATE exercises SET name_es = 'Sentadilla con barra (vista posterior)' WHERE external_id = '1461';
UPDATE exercises SET name_es = 'Sentadilla con barra (vista lateral)' WHERE external_id = '1462';
UPDATE exercises SET name_es = 'Peso muerto rumano con barra' WHERE external_id = '0085';
UPDATE exercises SET name_es = 'Curl femoral asistido en polea' WHERE external_id = '3235';
UPDATE exercises SET name_es = 'Peso muerto rumano con mancuernas' WHERE external_id = '1459';
UPDATE exercises SET name_es = 'Curl femoral inverso en banco' WHERE external_id = '0496';

-- Hombro
UPDATE exercises SET name_es = 'Elevaciones frontales con mancuernas' WHERE external_id = '0310';
UPDATE exercises SET name_es = 'Elevaciones frontales con mancuernas v.2' WHERE external_id = '0309';
UPDATE exercises SET name_es = 'Elevaciones laterales con mancuernas' WHERE external_id = '0334';
UPDATE exercises SET name_es = 'Elevaciones frontales con banda' WHERE external_id = '0977';
UPDATE exercises SET name_es = 'Elevaciones frontales con banda' WHERE external_id = '0978';
UPDATE exercises SET name_es = 'Aperturas inversas con banda' WHERE external_id = '0993';

-- Brazo
UPDATE exercises SET name_es = 'Curl de biceps con barra' WHERE external_id = '0031';
UPDATE exercises SET name_es = 'Press inclinado agarre cerrado con barra' WHERE external_id = '1719';
UPDATE exercises SET name_es = 'Curl predicador tumbado con barra' WHERE external_id = '0059';
UPDATE exercises SET name_es = 'Curl predicador con barra' WHERE external_id = '0070';
UPDATE exercises SET name_es = 'Curl predicador inverso con barra' WHERE external_id = '0081';
UPDATE exercises SET name_es = 'Extension de triceps sentado con barra' WHERE external_id = '0092';
UPDATE exercises SET name_es = 'Extension de triceps de pie con barra' WHERE external_id = '0109';
UPDATE exercises SET name_es = 'Curl martillo en polea con cuerda' WHERE external_id = '0165';

-- Core
UPDATE exercises SET name_es = 'Rotacion rusa asistida' WHERE external_id = '0014';
UPDATE exercises SET name_es = 'Plancha lateral inclinada' WHERE external_id = '3544';
UPDATE exercises SET name_es = 'Rotacion rusa en polea sobre balon' WHERE external_id = '0211';
UPDATE exercises SET name_es = 'Insecto muerto' WHERE external_id = '0276';
UPDATE exercises SET name_es = 'Plancha frontal con rotacion' WHERE external_id = '0464';
UPDATE exercises SET name_es = 'Elevacion de piernas colgado' WHERE external_id = '0472';

-- Pantorrilla
UPDATE exercises SET name_es = 'Elevacion de pantorrillas sentado con barra' WHERE external_id = '0088';
UPDATE exercises SET name_es = 'Elevacion de pantorrillas sentado con barra v.2' WHERE external_id = '1371';
UPDATE exercises SET name_es = 'Elevacion de pantorrillas de pie con barra' WHERE external_id = '1372';

-- Antebrazo
UPDATE exercises SET name_es = 'Curl de muneca con barra' WHERE external_id = '0126';
UPDATE exercises SET name_es = 'Curl de muneca con barra v.2' WHERE external_id = '0125';

-- Cardio
UPDATE exercises SET name_es = 'Burpee' WHERE external_id = '1160';
UPDATE exercises SET name_es = 'Saltar la cuerda' WHERE external_id = '2612';

-- Cuello
UPDATE exercises SET name_es = 'Estiramiento lateral de cuello' WHERE external_id = '1403';
