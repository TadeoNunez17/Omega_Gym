# Tasks

## 1. Precarga y caché

- [x] 1.1 Extender el estado de `WorkoutSession` con un mapa por `exercise_id` resuelto en una sola carga con `getByIds`; verificar que abrir una rutina con varios ejercicios no bloquea la sesión ni lanza una consulta por tarjeta.
- [x] 1.2 Reutilizar ese mapa en `openDetail` con `getById` como respaldo; verificar que abrir la ficha después de la precarga no muestra el esqueleto de carga.

## 2. Miniatura en la tarjeta

- [x] 2.1 Sustituir el círculo numerado por una miniatura fija en el encabezado de cada ejercicio; verificar que el número desaparece y que el orden se conserva por la posición de la tarjeta.
- [x] 2.2 Resolver la fuente visual como `image_url` → `gif_url` → `reference_link` → placeholder; verificar en 360 px los casos con JPG, sin JPG pero con GIF y sin recursos, sin imágenes rotas.

## 3. No regresión

- [x] 3.1 Confirmar que la tabla `SERIE/KGS/REPS`, el marcado de series y el guardado al tocar `Finalizar` permanecen iguales; verificar con un recorrido manual completo de una sesión.
- [x] 3.2 Ejecutar `npm run lint` y `npm run build` sin errores; verificar que ambos comandos terminan correctamente.

## 4. Cierre

- [x] 4.1 Crear y actualizar `TKT-OMEGYM-054` con la evidencia de implementación y validación; verificar que el estado refleja `Review` hasta la validación del dueño.
- [x] 4.2 Ejecutar `openspec validate workout-session-thumbnails --strict` y `openspec validate --specs`; verificar que no hay errores.

## Workflow follow-up

- Sincronizar la spec viviente `workout-session-media` y archivar el change; la QA visual del dueño queda registrada en `TKT-OMEGYM-054`.
- Escribir el espejo en Obsidian bajo `Omega_Gym/historial/`.
