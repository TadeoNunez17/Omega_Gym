# Spec Delta

## Purpose

Define la gobernanza de los nombres canónicos y localizados del catálogo de ejercicios, sus etiquetas de categoría y parte del cuerpo, y la consistencia de las copias desnormalizadas usadas por rutinas y sesiones.

## ADDED Requirements

### Requirement: Nombre localizado por identificador externo

El catálogo SHALL conservar el nombre original en `name` y SHALL poblar `name_es` desde el diccionario autoritativo, usando `external_id` como única clave de correspondencia.

#### Scenario: Ejercicio del diccionario

- **WHEN** un ejercicio tiene `external_id` presente en el diccionario de 1.324 entradas
- **THEN** `name_es` contiene exactamente el nombre en español del diccionario
- **AND** `name` sigue conteniendo exactamente el nombre original en inglés

#### Scenario: Traducción previa diferente

- **WHEN** el ejercicio ya tenía un `name_es` traducido antes de la migración
- **THEN** el valor del diccionario reemplaza al valor anterior
- **AND** no se modifica el `external_id`

### Requirement: Categorización normalizada

Cada ejercicio del diccionario SHALL expose categorías ES amplias, `body_part` en inglés y `muscle_group` con la parte del cuerpo en español, sin introducir etiquetas nuevas.

#### Scenario: Categoría y parte del cuerpo

- **WHEN** un ejercicio tiene `categoria_en = 'upper legs'` y `parte_del_cuerpo = 'Muslos y glúteos'`
- **THEN** `category` es `Pierna`
- **AND** `body_part` es `upper legs`
- **AND** `muscle_group` es `Muslos y glúteos`

#### Scenario: Cuello y cardio

- **WHEN** `categoria_en` es `neck` o `cardio`
- **THEN** `category` es `Cuello` o `Cardio` respectivamente
- **AND** `muscle_group` conserva el valor de `parte_del_cuerpo` del diccionario

### Requirement: Copias de nombre consistentes

Las copias desnormalizadas `exercise_name` de rutinas y sesiones SHALL reflejar `name_es` cuando existe un `exercise_id` válido, y MUST NOT reescribir texto histórico sin esa referencia.

#### Scenario: Ejercicio en una rutina

- **WHEN** una fila de `plan_exercises` tiene `exercise_id` apuntando a un ejercicio migrado
- **THEN** su `exercise_name` es igual a `exercises.name_es`
- **AND** el resto de la serie se conserva

#### Scenario: Serie de entrenamiento guardada

- **WHEN** una fila de `workout_sets` tiene `exercise_id` apuntando a un ejercicio migrado
- **THEN** su `exercise_name` es igual a `exercises.name_es`

#### Scenario: Fila heredada sin referencia

- **WHEN** una fila histórica tiene `exercise_name` pero `exercise_id IS NULL`
- **THEN** la migración no modifica esa fila
- **AND** el texto original permanece legible

### Requirement: Búsqueda por nombre español

El catálogo SHALL permitir localizar ejercicios por el nombre localizado con la misma experiencia que por el nombre original.

#### Scenario: Buscar por nombre localizado

- **WHEN** el usuario busca `Press de banca con barra`
- **THEN** el catálogo devuelve el ejercicio con `external_id = '0025'`
- **AND** la búsqueda por `barbell bench press` continúa devolviendo el mismo ejercicio

#### Scenario: Ejercicio sin nombre localizado

- **WHEN** un ejercicio personalizado no tiene `name_es`
- **THEN** la búsqueda por su nombre original continúa funcionando
- **AND** no se inventa un nombre traducido
