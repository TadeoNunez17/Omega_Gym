# Spec Delta

## Purpose

Define cómo un usuario móvil descubre y agrega Omega Gym a la pantalla de inicio, respetando las capacidades reales de instalación de Android e iOS y evitando prometer un prompt donde el navegador no lo ofrece.

## ADDED Requirements

### Requirement: CTA de instalación en la landing

La landing pública SHALL ofrecer una acción de instalación en dispositivos móviles y MUST ocultarla cuando la app ya esté ejecutándose en modo standalone.

#### Scenario: Móvil sin instalar

- **WHEN** un usuario abre la landing en un teléfono móvil fuera de una app instalada
- **THEN** la landing muestra una acción “Instalar app”
- **AND** la acción está cerca de los accesos a registro e inicio de sesión

#### Scenario: Escritorio

- **WHEN** la landing se abre en un equipo de escritorio
- **THEN** no se muestra la acción de instalación

#### Scenario: App ya instalada

- **WHEN** la landing se abre desde el modo standalone de la PWA
- **THEN** no se muestra la acción de instalación

### Requirement: Prompt nativo de instalación en Android

Cuando el navegador ofrezca un prompt de instalación válido, la acción de instalación SHALL abrirlo como consecuencia directa del toque del usuario y MUST no bloquear el resto de la landing.

#### Scenario: Prompt disponible

- **WHEN** el usuario toca “Instalar app” en un dispositivo Android con un prompt válido
- **THEN** el navegador muestra su diálogo nativo de instalación
- **AND** la landing sigue utilizable si el usuario cancela el diálogo

#### Scenario: Prompt ya utilizado

- **WHEN** el navegador rechaza o completa la instalación
- **THEN** la acción deja de ofrecer ese prompt agotado
- **AND** no se muestra un error bloqueante

#### Scenario: Sin prompt disponible

- **WHEN** un dispositivo Android no expone un prompt de instalación
- **THEN** la app muestra instrucciones para instalar desde el menú del navegador
- **AND** no intenta simular un diálogo nativo

### Requirement: Guía de instalación en iOS

En iOS, la acción de instalación SHALL mostrar instrucciones para Safari y MUST NOT intentar disparar un prompt de instalación no soportado.

#### Scenario: iPhone o iPad

- **WHEN** un usuario de iOS toca “Instalar app”
- **THEN** se muestran los pasos “Abrir en Safari”, “Compartir” y “Agregar a pantalla de inicio”
- **AND** no se anuncia una instalación automática

#### Scenario: Navegador iOS distinto de Safari

- **WHEN** un usuario de iOS abre la landing fuera de Safari
- **THEN** la guía indica abrir la página en Safari antes de usar el menú Compartir

### Requirement: Recursos instalables de la PWA

La PWA SHALL publicar un único manifest con `start_url` “/”, `display` standalone e iconos PNG 192/512 con propósito any y maskable; el acceso directo de iOS MUST usar un icono PNG.

#### Scenario: Manifest de la app

- **WHEN** el navegador solicita el manifest de Omega Gym
- **THEN** recibe una única definición con `start_url` “/” y `display` standalone
- **AND** los iconos incluyen versiones PNG de 192 y 512 píxeles

#### Scenario: Icono en iOS

- **WHEN** iOS crea el acceso directo en la pantalla de inicio
- **THEN** usa un archivo PNG declarado como `apple-touch-icon`
- **AND** no genera una captura de la pantalla como icono
