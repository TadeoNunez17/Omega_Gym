import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = resolve(root, 'diccionario_ejercicios.json')
const seedPaths = [
  resolve(root, 'data/seed/008_exercises_seed.sql'),
  resolve(root, 'data/seed/009_exercises_full_seed.sql'),
]
const outputPath = resolve(root, 'supabase/migrations/20261125000001_exercise_names_es.sql')
const expectedCount = 1324
const requiredFields = [
  'id',
  'nombre_original_en',
  'nombre_es',
  'categoria_en',
  'parte_del_cuerpo',
  'documento',
]
const categoryMap = {
  chest: 'Pecho',
  back: 'Espalda',
  shoulders: 'Hombro',
  neck: 'Cuello',
  'upper arms': 'Brazo',
  'lower arms': 'Antebrazo',
  waist: 'Core',
  'upper legs': 'Pierna',
  'lower legs': 'Pantorrilla',
  cardio: 'Cardio',
}

const dictionary = JSON.parse(readFileSync(sourcePath, 'utf8'))
const seedText = seedPaths.map(path => readFileSync(path, 'utf8')).join('\n')
const seedNames = new Map()
const rowPattern = /\('(\d{4})',\s*'((?:[^']|'')*)'/g
let match

while ((match = rowPattern.exec(seedText))) {
  seedNames.set(match[1], match[2].replace(/''/g, "'"))
}

const seenIds = new Set()
let duplicateIds = 0
let emptyFields = 0
let invalidIds = 0
let unknownCategories = 0
let missingInSeeds = 0
let nameMismatches = 0

for (const row of dictionary) {
  if (!/^\d{4}$/.test(row.id)) invalidIds += 1
  if (seenIds.has(row.id)) duplicateIds += 1
  seenIds.add(row.id)

  for (const field of requiredFields) {
    if (typeof row[field] !== 'string' || row[field].trim() === '') emptyFields += 1
  }

  if (!(row.categoria_en in categoryMap)) unknownCategories += 1

  if (!seedNames.has(row.id)) missingInSeeds += 1
  else if (seedNames.get(row.id) !== row.nombre_original_en) nameMismatches += 1
}

const summary = {
  registros: dictionary.length,
  idsDuplicados: duplicateIds,
  camposVacios: emptyFields,
  idsInvalidos: invalidIds,
  faltantesEnSeeds: missingInSeeds,
  diferenciasDeNombre: nameMismatches,
  categoriasDesconocidas: unknownCategories,
}

const problems = []
if (!Array.isArray(dictionary)) problems.push('el diccionario no es un arreglo')
if (dictionary.length !== expectedCount) problems.push(`se esperaban ${expectedCount} registros`)
for (const [key, value] of Object.entries(summary)) {
  if (key !== 'registros' && value !== 0) problems.push(`${key}: ${value}`)
}

if (problems.length > 0) {
  console.error('Validación fallida:')
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}

console.log(JSON.stringify(summary, null, 2))

if (process.argv.includes('--check')) process.exit(0)

const quote = value => `'${String(value).replace(/'/g, "''")}'`
const values = dictionary
  .map(row => `  (${quote(row.id)}, ${quote(row.nombre_es)}, ${quote(row.categoria_en)}, ${quote(row.parte_del_cuerpo)})`)
  .join(',\n')
const categoryCases = Object.entries(categoryMap)
  .map(([source, label]) => `      WHEN '${source}' THEN '${label}'`)
  .join('\n')

const sql = `-- Omega Gym — Nombres localizados del catálogo de ejercicios
-- Fuente: diccionario_ejercicios.json (${dictionary.length} registros)
-- Ticket: TKT-OMEGYM-053

DROP TABLE IF EXISTS exercise_name_migration;

CREATE TEMP TABLE exercise_name_migration (
  external_id TEXT PRIMARY KEY,
  name_es TEXT NOT NULL,
  categoria_en TEXT NOT NULL,
  parte_del_cuerpo TEXT NOT NULL
);

INSERT INTO exercise_name_migration (external_id, name_es, categoria_en, parte_del_cuerpo) VALUES
${values};

UPDATE exercises e
SET name_es = m.name_es,
    category = CASE m.categoria_en
${categoryCases}
      ELSE e.category
    END,
    body_part = m.categoria_en,
    muscle_group = m.parte_del_cuerpo
FROM exercise_name_migration m
WHERE e.external_id = m.external_id;

UPDATE plan_exercises pe
SET exercise_name = e.name_es
FROM exercises e
WHERE pe.exercise_id = e.id
  AND e.external_id IS NOT NULL
  AND pe.exercise_name IS DISTINCT FROM e.name_es;

UPDATE workout_sets ws
SET exercise_name = e.name_es
FROM exercises e
WHERE ws.exercise_id = e.id
  AND e.external_id IS NOT NULL
  AND ws.exercise_name IS DISTINCT FROM e.name_es;

CREATE INDEX IF NOT EXISTS idx_exercises_name_es_trgm
  ON exercises USING gin(name_es gin_trgm_ops);

NOTIFY pgrst, 'reload schema';
`

writeFileSync(outputPath, sql, 'utf8')
console.log(`✓ Generado ${outputPath} con ${dictionary.length} filas`)
