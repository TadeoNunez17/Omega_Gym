# workout-session-media Specification

## Purpose

Define cómo se muestra la demostración visual de cada ejercicio durante una sesión de entrenamiento, con prioridad de imagen estática, fallbacks claros y continuidad con la ficha de técnica.

## Requirements

### Requirement: Miniatura en cada ejercicio de la sesión

La sesión SHALL mostrar una miniatura de tamaño fijo en lugar del indicador numérico circular de cada ejercicio, sin impedir la marcación de series ni degradar la legibilidad en pantallas de 360 px.

#### Scenario: Rutina con varios ejercicios

- **WHEN** el miembro inicia una rutina con varios ejercicios
- **THEN** cada tarjeta de la sesión muestra una miniatura en el lugar del número del ejercicio
- **AND** la lista de series sigue disponible y utilizable

#### Scenario: Sin círculo numerado

- **WHEN** el miembro ve una tarjeta de la sesión
- **THEN** la tarjeta no muestra el indicador numérico circular
- **AND** el orden de los ejercicios se conserva por la posición de las tarjetas

#### Scenario: Carga de la miniatura

- **WHEN** la imagen de un ejercicio termina de cargar
- **THEN** el tamaño de la tarjeta permanece estable
- **AND** el nombre del ejercicio continúa legible en una sola línea

### Requirement: Prioridad de la demostración visual

El sistema MUST usar `image_url` del catálogo como primera fuente y SHALL caer a `gif_url`, `reference_link` y un placeholder, en ese orden, cuando la fuente anterior no esté disponible.

#### Scenario: Ejercicio con imagen estática

- **WHEN** el ejercicio tiene `image_url` en el catálogo
- **THEN** la tarjeta muestra esa imagen estática
- **AND** la tarjeta no muestra una animación GIF

#### Scenario: Ejercicio sin imagen estática

- **WHEN** el ejercicio no tiene `image_url` pero tiene `gif_url` o `reference_link`
- **THEN** la tarjeta muestra la primera fuente disponible en ese orden

#### Scenario: Ejercicio sin demostración

- **WHEN** el ejercicio no tiene ninguna fuente visual disponible
- **THEN** la tarjeta muestra un placeholder
- **AND** no se muestra una imagen rota

### Requirement: Ficha de técnica coherente con la miniatura

La ficha de técnica SHALL mostrar la demostración completa del mismo ejercicio y MUST NOT permanecer en estado de carga cuando el catálogo ya se resolvió para la miniatura.

#### Scenario: Abrir la ficha desde una tarjeta con miniatura

- **WHEN** el miembro toca el encabezado de un ejercicio cuya miniatura ya se resolvió
- **THEN** la ficha muestra la demostración completa y las indicaciones disponibles
- **AND** la ficha no muestra el esqueleto de carga

#### Scenario: Ejercicio sin catálogo

- **WHEN** el ejercicio no tiene referencia al catálogo o no tiene demostración
- **THEN** la ficha muestra el placeholder y las notas disponibles
- **AND** la sesión no se interrumpe
