# Spec Delta

## Purpose

Define el comportamiento observable de los menús de acciones en las tarjetas de rutina de la vista de Entrenamiento, garantizando que permanezcan visibles y operables frente a otras tarjetas de la lista.

## ADDED Requirements

### Requirement: Visible menu over adjacent routine cards

When a routine card's actions menu is open, the system SHALL paint the complete menu above every adjacent routine card so that all options are visible and clickable.

#### Scenario: Menu opened on the first routine card

- **WHEN** the user opens the actions menu on the first routine card in Entrenamiento
- **THEN** every option, including "Ocultar de Mi plan" and "Eliminar", is fully visible and can be clicked

#### Scenario: Menu opened on an intermediate routine card

- **WHEN** the user opens the actions menu on a routine card that has cards both above and below it
- **THEN** the menu is painted above the following cards and is not clipped or covered by them

#### Scenario: Menu opened on an assigned routine card

- **WHEN** the user opens the actions menu on a card in the "Asignadas por tu entrenador" section
- **THEN** the menu is painted above the following cards and its options remain clickable

### Requirement: Single active actions menu

The system SHALL keep at most one routine actions menu open at a time and SHALL close it when the user activates a different routine card's actions control.

#### Scenario: Switching between routine cards

- **WHEN** the user opens the actions menu of another routine card while a menu is open
- **THEN** the previous menu closes and only the newly activated card's menu is displayed
