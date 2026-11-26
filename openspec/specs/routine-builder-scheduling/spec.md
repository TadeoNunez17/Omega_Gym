# routine-builder-scheduling Specification

## Purpose

Define la programación semanal a nivel de plan desde el builder compartido y la confirmación guiada de días cuando una rutina o plan nuevo se guarda sin programación.

## Requirements

### Requirement: Días programados en el builder

El builder SHALL ofrecer una sección opcional de días de la semana para rutinas personales y planes del staff, y SHALL guardar esa selección con la entidad.

#### Scenario: Crear con días seleccionados

- **WHEN** el usuario marca uno o más días antes de guardar una rutina o plan
- **THEN** la entidad se crea con `scheduled_days` con esos días ordenados de lunes a domingo
- **AND** los ejercicios se almacenan sin día asignado (`day = null`)

#### Scenario: Editar la programación

- **WHEN** el usuario abre una rutina o plan con días programados y cambia la selección
- **THEN** `scheduled_days` se actualiza al guardar
- **AND** quitar todos los días deja la entidad sin programación (`null`)

### Requirement: Prompt al crear sin días

El sistema SHALL abrir el selector de días existente después de guardar una entidad nueva sin días, sin deshacer el guardado.

#### Scenario: Guardar una rutina nueva sin días

- **WHEN** el usuario guarda una rutina personal nueva con la selección de días vacía
- **THEN** la rutina queda creada sin programación
- **AND** se abre `Programar días` con ningún día preseleccionado

#### Scenario: Guardar un plan nuevo sin días

- **WHEN** el staff guarda un plan nuevo con la selección de días vacía
- **THEN** el plan queda creado sin programación
- **AND** se abre `Programar días` con ningún día preseleccionado

#### Scenario: Crear con días ya elegidos

- **WHEN** el usuario guarda una entidad nueva con al menos un día seleccionado en el builder
- **THEN** la entidad se guarda con esos días
- **AND** no se abre el prompt automático

#### Scenario: Descartar el prompt

- **WHEN** el usuario cierra el `Programar días` abierto automáticamente sin guardar
- **THEN** la entidad permanece creada
- **AND** continúa sin días programados

### Requirement: Confirmación explícita de «Sin días»

Cuando el selector se abrió automáticamente tras la creación, el botón `Sin días` SHALL confirmar la ausencia de programación y cerrar el selector.

#### Scenario: Omitir la programación desde el prompt

- **WHEN** el usuario pulsa `Sin días` en el selector abierto automáticamente
- **THEN** la entidad queda sin `scheduled_days`
- **AND** el selector se cierra

#### Scenario: «Sin días» desde el menú existente

- **WHEN** el usuario pulsa `Sin días` desde el menú `Programar días` de una entidad ya guardada
- **THEN** la selección se limpia sin cerrar el selector
- **AND** el usuario debe pulsar `Guardar` para aplicar el cambio
