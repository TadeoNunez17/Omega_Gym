# Tasks

## 1. Contrato y documentación previa

- [x] 1.1 Ajustar el delta `single-page-routine-builder` para que «sin días» signifique solo sin reparto por ejercicio y verificar que `plan_exercises.day = null` sigue documentado
- [x] 1.2 Añadir un addendum a `ai_work_flow/knowledge/local/11_plan_schedule_and_sessions_decisions.md` con el nuevo entry point desde el builder y verificar que no contradice `10_dayless_routines_decisions.md`

## 2. Modelo compartido y normalización

- [x] 2.1 Añadir `scheduled_days` a `EditPlanData` y verificar que TypeScript acepta la carga desde `routines.service.getDetail` y `trainingService.getById`
- [x] 2.2 Crear `normalizeDays()` en `src/lib/dates.ts`, reutilizarla en `trainingService.setSchedule` y verificar que duplicados/fuera de rango quedan ordenados y vacío se convierte en `null`

## 3. Builder y selector reutilizable

- [x] 3.1 Extraer `DayPills` desde `ScheduleSheet` y verificar que el sheet mantiene sus pastillas y `aria-pressed` actuales
- [x] 3.2 Renderizar `DÍAS PROGRAMADOS (OPCIONAL)` en el builder para `personal` y `trainer`, verificar semilla/snapshot en edición y que incluir días en los cambios active la confirmación al cancelar
- [x] 3.3 Persistir `scheduled_days` en `create`/`update`, devolver el resultado estructurado desde `onSave` y verificar que `day` sigue siendo `null` en los ejercicios

## 4. Prompt automático

- [x] 4.1 Añadir `promptMode` a `ScheduleSheet`: en modo prompt `Sin días` debe guardar `[]` y cerrar; en el menú debe seguir solo limpiando. Verificar ambos comportamientos
- [x] 4.2 Conectar `MyRoutines` con el resultado del builder y verificar que crear sin días abre `Programar días` con `initialDays=null`, que omitir persiste `null` y que editar nunca dispara el prompt
- [x] 4.3 Conectar `TrainingPlans` con el resultado del builder y verificar que crear un plan sin días abre el sheet tras recargar la lista, sin romper el menú existente ni la edición

## 5. Verificación

- [x] 5.1 Ejecutar `npm run build` y verificar que termina sin errores
- [x] 5.2 Ejecutar `npm run lint` y verificar que termina sin errores
- [x] 5.3 Verificar estáticamente crear/editar rutina y crear/editar plan con días, sin días con prompt, `Sin días`, y cierre del prompt; registrar resultado y limitación E2E en el espejo Obsidian

## Workflow follow-up

- Sincronizar la spec `routine-builder-scheduling` con `openspec sync`.
- Archivar el cambio con `openspec archive` y verificar el estado final.
- Escribir el resumen en el vault Obsidian del proyecto.
