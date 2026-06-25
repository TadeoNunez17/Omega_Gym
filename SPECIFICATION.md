# SPEC DRIVEN DEVELOPMENT — Metodología de Proyecto
## Omega Gym — Sistema de Gestión de Gimnasio Web

**Versión**: 2.0  
**Fecha**: 01 de Mayo 2026  
**Proyecto**: Omega Gym  
**Nota**: v3.0 — Metodología adaptada de Next.js App Router a Vite + React + React Router v7

---

## 1. Introducción

La metodología **SPEC DRIVEN DEVELOPMENT** permite gestionar el proyecto **Omega Gym** de manera profesional, modular, reutilizable y trazable mediante:

- 📋 **Specifications**: Especificaciones detalladas básica (inicial) e incrementales
- 🎫 **Tickets**: Control de cambios trazable por módulo
- 📚 **Knowledge**: Cuadernos de conocimiento local y remoto
- 🗄️ **Database Config**: Configuración formal de base de datos por etapa

**Objetivo del sistema**: Plataforma web para administradores y entrenadores de gimnasio que permita gestionar membresías, controlar pagos y asignar planes de entrenamiento a los miembros registrados.

---

## 2. Stack Tecnológico

| Capa              | Tecnología                              |
|-------------------|-----------------------------------------|
| Frontend | Vite + React 19                      |
| Enrutamiento | React Router v7                      |
| Base de Datos     | Supabase (PostgreSQL + Auth + Storage)  |
| Despliegue        | Vercel                                  |
| Lenguaje          | TypeScript                              |
| Estilos           | Tailwind CSS                            |
| Estado Global     | Zustand                                 |
| Validaciones      | Zod                                     |
| ORM / Queries     | Supabase JS Client v2                   |
| Testing Unit/Int  | Vitest + Testing Library                |
| Testing E2E       | Playwright                              |
| Notificaciones UI | Sonner                                  |

---

## 3. Estructura del Proyecto

```
omega-gym/
├── omega-gym-vite/                    # Aplicación Vite + React (nuevo)
│   ├── public/                        # Recursos estáticos
│   │   ├── icons/                     # Íconos PWA
│   │   ├── favicon.svg
│   │   ├── icons.svg
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/                  # ProtectedRoute, AuthProvider
│   │   │   ├── layout/                # AdminLayout, TrainerLayout, MemberLayout, AuthLayout, Sidebar
│   │   │   └── ui/
│   │   │       ├── atoms/             # Button, Input, Badge, Avatar, Chip, EmptyState, etc.
│   │   │       ├── molecules/         # Modal, PageHeader, TabBar, Pagination, SearchInput
│   │   │       └── layout/            # BottomNav
│   │   ├── lib/                       # Configuración de Supabase, utilidades
│   │   ├── pages/                     # Páginas por rol (React Router)
│   │   │   ├── auth/                  # Login, Register
│   │   │   ├── dashboard/             # Admin: Dashboard, Members, Payments, Memberships, TrainingPlans, Reports, Fingerprint
│   │   │   ├── trainer/               # Trainer: Panel, Members, Plans, Templates
│   │   │   ├── member/                # Member: MyPlan
│   │   │   └── kiosk/                 # CheckIn
│   │   ├── services/                  # Servicios de negocio
│   │   ├── store/                     # Estado global (Zustand)
│   │   ├── App.tsx                    # Router principal
│   │   ├── main.tsx                   # Entry point
│   │   └── index.css                  # Tailwind v4 + tema personalizado
│   ├── index.html
│   ├── vite.config.ts
│   ├── postcss.config.mjs
│   ├── tsconfig.json
│   └── package.json
│
├── data/                              # Contratos y modelos de referencia
│   └── supabase/
│       ├── models/                    # Definición de entidades
│       ├── schema/                    # SQL de migraciones
│       └── seed/                      # Datos de prueba
│
├── ai_work_flow/                      # Documentación metodológica
│   ├── docs/
│   │   └── specs/
│   │       ├── incremental/           # Especificaciones incrementales
│   │       └── templates/             # Templates de documentación
│   ├── knowledge/                     # Base de conocimiento
│   │   ├── local/                     # Investigación interna y decisiones
│   │   │   └── archived/              # Knowledge obsoleto archivado
│   │   └── remote/                    # Referencias externas y documentación oficial
│   └── tickets/                       # Tickets internos de desarrollo
│       ├── README.md
│       ├── TKT-OMEGYM-001.md
│       └── ...
│
├── tests/                             # Pruebas
│   ├── unit/                          # Tests unitarios (Vitest)
│   ├── integration/                   # Tests de integración
│   └── e2e/                           # Tests end-to-end (Playwright)
│
├── .env.example                       # Variables de entorno (sin valores reales)
├── .env.local                         # Variables reales (gitignored)
├── package.json
└── tsconfig.json
```

### Convención de Código Fuente (SRC-First)

- Todo el código fuente de la aplicación se encuentra dentro de `omega-gym-vite/src/`.
- La carpeta `ai_work_flow/` vive fuera de `src/` — es documentación metodológica, no código ejecutable.
- La carpeta `data/supabase/` vive fuera de `src/` — es contrato documental de la base de datos.
- Los archivos `.env.example` son commiteables. Los `.env.local` nunca se suben al repositorio.

---

## 4. Roles* del Proyecto

El proyecto es gestionado por una persona o equipo pequeño. Los roles no son agentes IA, son responsabilidades humanas o asistidas por IA según el contexto:

| Rol             | Responsabilidad                                               | Cuando actúa       |
|-----------------|---------------------------------------------------------------|--------------------|
| **Arquitecto**  | Define estructura, base de datos, flujo de datos y SPEC       | FASE 2.1 – 2.3     |
| **Desarrollador**| Implementa features, componentes, servicios y páginas        | FASE 2.4 – 3       |
| **QA**          | Prueba funcionalidades, valida flujos y reporta bugs          | FASE 3             |
| **Revisor**     | Aprueba tickets, cierra funcionalidades y valida criterios    | Al cierre de ticket|

---

## 5. Componentes Core

### 5.1 📋 Specifications (SPEC)

**Definición**: Documento que describe QUÉ se va a construir, con qué reglas, quiénes son los usuarios y cuáles son los criterios de aceptación.

**Ubicación oficial única**:
```
omega-gym/ai_work_flow/docs/specs/SPECIFICATION.md
```

**Regla de oro**: Nunca se genera código funcional sin que exista `SPECIFICATION.md` en la ruta oficial. Es el contrato del proyecto.

**Estructura mínima de SPECIFICATION.md**:
```markdown
# SPECIFICATION — Omega Gym

## 1. Descripción General
[Qué es el sistema y qué problema resuelve]

## 2. Usuarios del Sistema
- Administrador / Dueño del gym
- Entrenador
- Miembro (vista de solo lectura)

## 3. Módulos
### 3.1 Autenticación y Roles
### 3.2 Gestión de Miembros
### 3.3 Membresías y Pagos
### 3.4 Planes de Entrenamiento
### 3.5 Dashboard y Reportes

## 4. Reglas de Negocio
[Listas de reglas por módulo]

## 5. Criterios de Aceptación Globales
[Qué debe cumplir el sistema para considerarse funcional]

## 6. Fuera de Alcance (v1.0)
[Qué NO se construirá en esta versión]
```

---

### 5.2 🎫 Tickets

**Convención de nombres**:
- Proyecto Omega Gym: `TKT-OMEGYM-###`

**Estados del ticket**:
```
Open → In Progress → Review → Closed
```

**Política de Cierre (Obligatoria)**:
- `Closed` SOLO se permite con evidencia de prueba documentada.
- Evidencia mínima: resultado de prueba manual o automatizada, fecha, entorno y responsable.
- Si el código está implementado pero sin validación ejecutada → el estado correcto es `Review`.
- Está prohibido cerrar tickets por "código terminado" sin prueba comprobada.

**Estructura mínima de ticket**:
```markdown
# TKT-OMEGYM-###: [Título del ticket]

## Metadata
- **Tipo**: Feature / Fix / Mejora / Refactoring
- **Prioridad**: Alta / Media / Baja
- **Estado**: Open / In Progress / Review / Closed
- **Módulo**: auth / members / memberships / payments / training-plans / reports
- **Relacionado con**: SPECIFICATION.md o incremental/SPEC_00X.md
- **Ticket Externo**: REQ-OMEGYM-### (si aplica)
- **Fecha apertura**: YYYY-MM-DD
- **Fecha cierre**: YYYY-MM-DD

## Descripción
[Qué se necesita implementar y por qué]

## Dependencias
- **Bloqueado por**: TKT-OMEGYM-### (si aplica)
- **Bloquea a**: TKT-OMEGYM-### (si aplica)

## Archivos Afectados
- src/features/<modulo>/...
- src/components/...
- src/services/...

## Estimación
[X horas o X días]

## Implementación
- [ ] Diseño / esquema definido
- [ ] Código implementado
- [ ] Tipos TypeScript definidos
- [ ] Servicio de Supabase conectado
- [ ] Prueba unitaria escrita (si aplica)
- [ ] Prueba manual ejecutada

## Criterios de Aceptación
- [ ] Criterio 1
- [ ] Criterio 2

## Evidencia de Cierre
**Fecha**: YYYY-MM-DD  
**Probado por**: [Nombre]  
**Resultado**: [Descripción del resultado]  
**Commit**: `tipo(scope): descripción (#TKT-OMEGYM-###)`
```

**SLA por Prioridad**:

| Prioridad | Tiempo máximo en "Open" | Tiempo máximo en "In Progress" | Revisión |
|-----------|------------------------|-------------------------------|----------|
| Alta      | 4 horas                | 1 día                         | Diaria   |
| Media     | 1 día                  | 3 días                        | Por sprint |
| Baja      | 3 días                 | 1 semana                      | Por sprint |

---

### 5.3 📚 Knowledge (Conocimiento)

**Principio fundamental**: El conocimiento se genera ANTES de los tickets para informar las decisiones de implementación.

**Regla de Oro**:
1. Siempre se consulta primero la base de conocimiento **local** (decisiones propias).
2. Luego las referencias **remotas** (documentación oficial).
3. El conocimiento del proyecto no reemplaza la documentación oficial, la especializa.

#### 5.3.1 Knowledge Local (`knowledge/local/`)

**Propósito**: Decisiones técnicas internas, investigaciones, comparativas y lecciones aprendidas del equipo.

**Convención de Nombres**:
```
01_<tema>_decisions.md         # Decisiones técnicas tomadas (numeradas)
02_<tema>_research.md          # Investigación numerada
03_<tema>_patterns.md          # Patrones de implementación
lesson_<descripcion>.md        # Lecciones aprendidas durante desarrollo
```

**Template Estándar para Decisiones**:
```markdown
# 01_<tema>_decisions.md

## Decisión: [Título]

**Fecha**: YYYY-MM-DD  
**Contexto**: [Proyecto/módulo]  
**Autor**: [Nombre]

### Problema
[Descripción del problema]

### Opciones Evaluadas

#### Opción 1: [Nombre]
**Pros**: ✅ ...
**Contras**: ❌ ...

#### Opción 2: [Nombre]
**Pros**: ✅ ...
**Contras**: ❌ ...

### Decisión Final
**Selección**: [Opción elegida]

**Razones**:
1. ...
2. ...

### Aplicación
- Implementar en: TKT-OMEGYM-###
- Archivo: src/...
```

**Ejemplo — Decisión Técnica**:
```markdown
# 01_auth_decisions.md
## Decisión: Manejo de Roles con Supabase Auth

**Fecha**: 2026-05-01  
**Contexto**: Omega Gym

### Problema
Necesitamos que los roles (admin, entrenador, miembro) controlen qué páginas
y qué datos puede ver cada usuario.

### Opciones Evaluadas

#### Opción 1: Claims en JWT con Supabase
**Pros**:
- ✅ Nativo de Supabase, sin librerías extra
- ✅ Claims disponibles en Row Level Security (RLS)
- ✅ Verificación en servidor sin consulta extra a BD

**Contras**:
- ❌ Requiere función edge para insertar claims al registro

#### Opción 2: Tabla `profiles` con columna `role`
**Pros**:
- ✅ Sencillo de implementar
- ✅ Fácil de modificar roles

**Contras**:
- ❌ Consulta extra a BD en cada request para verificar rol

### Decisión Final
**Selección**: Tabla `profiles` con columna `role` + RLS por tabla

**Razones**:
1. Más simple de mantener para equipo pequeño
2. Suficiente para escala actual del proyecto
3. RLS de Supabase cubre la seguridad a nivel base de datos

### Aplicación
- Implementar en: TKT-OMEGYM-002 (Auth y Roles)
- Archivo: `src/features/auth/`
```

**Ejemplo — Lección Aprendida**:
```markdown
# lesson_supabase_rls_payments.md
## Lección: RLS en tabla payments con múltiples roles

**Fecha**: 2026-05-10  
**Contexto**: Durante TKT-OMEGYM-008 (Módulo de Pagos)  

### Problema
El admin podía ver todos los pagos pero el miembro solo debía ver los suyos.
La política RLS por defecto bloqueaba también al admin.

### Solución Encontrada
```sql
-- Política para admin: ver todos los pagos
CREATE POLICY "Admins can view all payments"
ON payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Política para miembro: ver solo sus pagos
CREATE POLICY "Members can view own payments"
ON payments FOR SELECT
USING (auth.uid() = member_id);
```

### Aplicación
- Patrón reutilizable en todas las tablas con datos por miembro
- Documentado también en: TKT-OMEGYM-008
```

#### 5.3.2 Criterios de Archivo de Knowledge

Un archivo de knowledge se archiva cuando:
1. La decisión fue revertida y documentada en un nuevo archivo
2. La tecnología/patrón ya no se usa en el proyecto
3. Ha pasado más de 6 meses sin referencia en tickets activos

**Procedimiento de archivo**:
- Mover a: `knowledge/local/archived/`
- Renombrar: `ARCHIVED_YYYY-MM-DD_01_tema_decisions.md`
- Agregar nota al inicio: "⚠️ Archivado — [razón] — Reemplazado por: [archivo nuevo]"

---

#### 5.3.3 Knowledge Remote (`knowledge/remote/`)

**Propósito**: Referencias a documentación oficial, guías externas y recursos de terceros.

**Estructura de Archivo Remote**:
```markdown
# <tema>_reference.md
## [Título de la Fuente]

**Tipo**: Documentación Oficial / Tutorial / API Reference
**URL**: <enlace directo>
**Fecha creación**: YYYY-MM-DD
**Última verificación**: YYYY-MM-DD
**Acceso**: Público / Requiere cuenta

### Resumen
[Descripción breve y relevancia para el proyecto]

### Puntos Clave
- Punto importante 1
- Punto importante 2

### Aplicación en Proyecto
[Cómo se aplica en Omega Gym]

### Relacionado con
- Knowledge local: 01_tema.md
- Tickets: TKT-OMEGYM-001, TKT-OMEGYM-002
```

**Referencias clave del proyecto**:
```
knowledge/remote/
├── supabase_auth_reference.md       # Docs oficiales Supabase Auth
├── supabase_rls_reference.md        # Row Level Security en Supabase
├── react_router_reference.md        # React Router v7
├── vercel_deployment_reference.md   # Deployment en Vercel
└── supabase_js_client_reference.md  # Cliente JS de Supabase v2
```

---

#### 5.3.4 Flujo de Generación de Conocimiento

**Momento**: ANTES de generar tickets (parte de FASE 2.2)

```
┌─────────────────────────────────────────────────┐
│ PASO 1: Analizar SPECIFICATION.md               │
└────────────────────────────┬────────────────────┘
                             ↓
        Identifica áreas que requieren investigación:
        - Flujo de autenticación y roles
        - Estructura de tablas y relaciones
        - Política de RLS por módulo
        - Reglas de negocio de membresías

┌─────────────────────────────────────────────────┐
│ PASO 2: Generar Knowledge Local (.md)           │
└────────────────────────────┬────────────────────┘
                             ↓
        knowledge/local/
        ├── 01_auth_decisions.md
        ├── 02_database_schema_decisions.md
        ├── 03_memberships_business_rules.md
        └── 04_training_plans_patterns.md

┌─────────────────────────────────────────────────┐
│ PASO 3: Generar Knowledge Remote (.md)          │
└────────────────────────────┬────────────────────┘
                             ↓
        knowledge/remote/
        ├── supabase_auth_reference.md
        ├── supabase_rls_reference.md
        └── nextjs_app_router_reference.md

┌─────────────────────────────────────────────────┐
│ PASO 4: Generar Tickets (usa el knowledge)      │
└────────────────────────────┬────────────────────┘
                             ↓
        Cada ticket referencia conocimiento necesario:
        # TKT-OMEGYM-002: Implementar Auth y Roles
        ## Conocimiento Requerido
        - knowledge/local/01_auth_decisions.md
        - knowledge/remote/supabase_auth_reference.md
```

---

### 5.4 🗄️ Base de Datos — Supabase

**Agente de base de datos**: El desarrollador o la IA asistiendo en FASE 2.3 – 2.4.

**Archivo de configuración**: `data/supabase/DATABASE_CONFIG.yaml`

#### 5.4.1 DATABASE SELECTION GATE

> **Regla de oro**: Antes de avanzar a FASE 2.2, se confirma explícitamente qué base de datos usará el proyecto.

**Para Omega Gym, la selección es**:
```
✅ Motor seleccionado: Supabase (PostgreSQL managed + Auth + Storage)
✅ Documentado en: data/supabase/DATABASE_CONFIG.yaml
```

#### 5.4.2 DATABASE MODEL GATE

> **Regla de oro**: Antes de generar migraciones o código de acceso a datos, se define el origen del modelo.

**Pregunta obligatoria**:
```
🔔 DATABASE MODEL GATE
¿Cómo se definirá el modelo de datos?

1. El desarrollador entrega los modelos/schemas ya construidos.
2. La IA propone los modelos/schemas (requiere aprobación posterior).
```

**Si el desarrollador entrega los modelos**, se colocan en:
```
data/supabase/models/
data/supabase/schema/
data/supabase/seed/
```

**Si la IA los propone**, se sigue el flujo:
```
IA propone → Revisión humana → Aprobación → Migración en DEV
```

#### 5.4.3 MODEL MATURITY GATE (Draft → Candidate → Approved)

| Estado      | Uso permitido                              | Uso prohibido                     |
|-------------|--------------------------------------------|------------------------------------|
| `draft`     | Prototipo, validación temprana de estructura | Migraciones, cierre de tickets    |
| `candidate` | Revisión técnica contra SPEC y knowledge   | Migraciones sin aprobación formal  |
| `approved`  | Base oficial para migraciones en DEV       | Saltar validaciones de credenciales|

**Criterios mínimos para pasar a `candidate`**:
- Knowledge local generado para el dominio de datos
- Entidades cubren todos los módulos de la SPEC
- Relaciones entre tablas documentadas

**Criterios mínimos para pasar a `approved`**:
- Revisión humana explícita
- RLS definida por tabla y por rol
- Sin conflictos con tickets incrementales activos

#### 5.4.4 Modelo de Datos — Entidades Principales

```
┌─────────────────┐       ┌──────────────────┐
│   profiles      │       │ membership_types  │
│─────────────────│       │──────────────────│
│ id (uuid FK)    │       │ id               │
│ full_name       │       │ name             │
│ phone           │       │ price            │
│ avatar_url      │       │ duration_days    │
│ role            │       │ description      │
│ created_at      │       │ is_active        │
└────────┬────────┘       └────────┬─────────┘
         │                         │
         │    ┌────────────────┐   │
         └───>│  memberships   │<──┘
              │────────────────│
              │ id             │
              │ member_id (FK) │
              │ type_id (FK)   │
              │ start_date     │
              │ end_date       │
              │ status         │
              └───────┬────────┘
                      │
         ┌────────────▼───────┐       ┌──────────────────┐
         │     payments       │       │  training_plans   │
         │────────────────────│       │──────────────────│
         │ id                 │       │ id               │
         │ membership_id (FK) │       │ name             │
         │ amount             │       │ description      │
         │ payment_date       │       │ assigned_to (FK) │
         │ method             │       │ created_by (FK)  │
         │ status             │       │ created_at       │
         └────────────────────┘       └────────┬─────────┘
                                               │
                                    ┌──────────▼───────────┐
                                    │  plan_exercises       │
                                    │──────────────────────│
                                    │ id                   │
                                    │ plan_id (FK)         │
                                    │ exercise_name        │
                                    │ sets                 │
                                    │ reps                 │
                                    │ rest_seconds         │
                                    │ order                │
                                    └──────────────────────┘
```

#### 5.4.5 Protocolo de Credenciales (Regla de Oro)

```
❌ NUNCA en:              ✅ SIEMPRE en:
  Código fuente              .env.local (gitignored)
  DATABASE_CONFIG.yaml       .env.example (sin valores, commiteable)
  Archivos .md               Variables de entorno de Vercel (producción)
  Repositorio git
```

**Variables requeridas (`.env.example`)**:
```bash
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# React
VITE_APP_NAME=Omega Gym
```

#### 5.4.6 DATABASE_CONFIG.yaml

```yaml
database:
  engine: supabase
  type: postgresql_managed

account:
  provider: "supabase.com"
  owner_email: "<tu-email>"
  project_name: "omega-gym"
  project_ref: "<tu-project-ref>"
  region: "us-east-1"
  environment: "development"

mcp:
  enabled: true
  mcp_server: "@supabase/mcp-server-supabase"

model_status:
  overall: draft          # draft | candidate | approved
  last_reviewed: null
  approved_by: null
  notes: "Modelo inicial pendiente de revisión"

tables:
  - name: profiles
    status: draft
    rls_enabled: false
  - name: membership_types
    status: draft
    rls_enabled: false
  - name: memberships
    status: draft
    rls_enabled: false
  - name: payments
    status: draft
    rls_enabled: false
  - name: training_plans
    status: draft
    rls_enabled: false
  - name: plan_exercises
    status: draft
    rls_enabled: false

env_variables:
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
```

#### 5.4.7 Cuándo se Trabaja en la Base de Datos

| Fase   | Acción                                                                 |
|--------|------------------------------------------------------------------------|
| FASE 2.2 | DATABASE SELECTION GATE — Confirmar Supabase                        |
| FASE 2.3 | DATABASE MODEL GATE — Definir origen del modelo (usuario o IA)      |
| FASE 2.3 | Diseñar schema SQL, entidades y relaciones (estado: `draft`)        |
| FASE 2.4 | Revisión humana del schema → pasar a `candidate`                    |
| FASE 2.4 | Aprobación formal → pasar a `approved`                              |
| FASE 2.4 | Ejecutar migraciones en Supabase DEV                                 |
| FASE 3   | Implementar RLS por tabla según módulo activo                       |
| FASE 3   | Ajustes incrementales de schema si un ticket lo requiere            |

#### 5.4.8 Recomendaciones de Optimización de BD

**Índices Recomendados** (aplicar cuando el modelo esté `approved`):

```sql
-- Perfiles: búsqueda por email y rol
CREATE INDEX idx_profiles_role ON profiles(role);

-- Membresías: búsqueda por miembro y estado
CREATE INDEX idx_memberships_member_status ON memberships(member_id, status);

-- Membresías: membresías próximas a vencer
CREATE INDEX idx_memberships_end_date ON memberships(end_date) WHERE status = 'active';

-- Pagos: historial por membresía
CREATE INDEX idx_payments_membership ON payments(membership_id);

-- Pagos: filtros por fecha
CREATE INDEX idx_payments_date ON payments(payment_date);

-- Planes: búsqueda por asignado
CREATE INDEX idx_training_plans_assigned ON training_plans(assigned_to);
```

**Trigger para updated_at automático**:

```sql
-- Función genérica para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar a tablas que necesiten
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_plans_updated_at BEFORE UPDATE ON training_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Soft Delete para datos críticos**:

```sql
-- Agregar columna deleted_at a tablas críticas
ALTER TABLE memberships ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE payments ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Modificar RLS para excluir eliminados lógicamente
-- O usar vista que filtre:
CREATE VIEW active_memberships AS
SELECT * FROM memberships WHERE deleted_at IS NULL;
```

**Backup y Recovery**:

- **Supabase automático**: Backups diarios automáticos (retención de 7 días en plan free, 14 en pro)
- **Backup manual semanal** recomendado:

```bash
# Exportar base de datos
pg_dump -h db.<ref>.supabase.co -U postgres -d postgres > backup_$(date +%Y%m%d).sql

# Restaurar desde backup
psql -h db.<ref>.supabase.co -U postgres -d postgres < backup_YYYYMMDD.sql
```

**Checklist de Backup**:
- [ ] Backup manual antes de migraciones grandes
- [ ] Verificar backup exportado correctamente
- [ ] Almacenar backup fuera de repositorio (Google Drive, S3, etc.)
- [ ] Probar restauración en entorno de desarrollo al menos 1 vez por mes

---

## 6. Flujo de Fases del Proyecto

```
┌─────────────┐    ┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│  FASE 0     │───>│  FASE 1     │───>│  FASE 2      │───>│  FASE 3      │
│ Setup       │    │ Config      │    │ Diseño y     │    │ Implementación│
│ del Entorno │    │ del Proyecto│    │ Arquitectura │    │ y Testing    │
└─────────────┘    └─────────────┘    └──────────────┘    └──────────────┘
  UNA VEZ            UNA VEZ           POR PROYECTO         POR MÓDULO
```

---

## 7. FASE 0: Configuración del Entorno (Setup Único)

⚠️ **Esta fase se ejecuta UNA SOLA VEZ** al iniciar el proyecto.

### 7.1 Checklist de Herramientas

- [ ] Node.js 18+ instalado
- [ ] Git instalado y configurado
- [ ] VS Code instalado (recomendado)
- [ ] Cuenta en Supabase creada
- [ ] Cuenta en Vercel creada
- [ ] Repositorio GitHub creado

### 7.2 Inicialización del Proyecto

```bash
# Crear proyecto Vite + React
npm create vite@latest omega-gym-vite -- --template react-ts

# Ingresar al proyecto
cd omega-gym-vite

# Instalar dependencias principales
npm install react-router-dom @supabase/supabase-js zustand zod sonner
npm install -D tailwindcss @tailwindcss/vite
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test

# Volver a la raíz del repo
cd ..

# Crear estructura metodológica
mkdir -p ai_work_flow/docs/specs/incremental
mkdir -p ai_work_flow/knowledge/local/archived
mkdir -p ai_work_flow/knowledge/remote
mkdir -p ai_work_flow/tickets
mkdir -p data/supabase/{models,schema,seed}

# Crear estructura src
mkdir -p src/{components/{ui/{atoms,molecules,organisms},layout},features/{auth,members,memberships,payments,training-plans,reports},hooks,lib,services,store,types,utils}

# Crear estructura de tests
mkdir -p tests/{unit,integration,e2e}
```

### 7.3 Configuración de Supabase

```bash
# Instalar Supabase CLI
npm install -g supabase

# Inicializar Supabase localmente
supabase init

# Iniciar Supabase local (requiere Docker)
supabase start
```

### 7.4 Variables de Entorno

Crear `.env.local` con los valores reales del proyecto Supabase:
```bash
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

Crear `.env.example` (sin valores, se sube al repo):
```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### 7.5 Validación Final FASE 0

- [ ] Proyecto Vite corriendo en `localhost:5173`
- [ ] Supabase conectado (local o remoto)
- [ ] Variables de entorno cargadas
- [ ] Estructura de carpetas creada
- [ ] Repositorio inicializado con primer commit

**Resultado**: ✅ FASE 0 COMPLETADA

---

## 8. FASE 1: Configuración del Proyecto (Setup Único)

### 8.1 Crear SPECIFICATION.md

Crear el archivo en la ruta oficial:
```
ai_work_flow/docs/specs/SPECIFICATION.md
```

Este archivo es el contrato del proyecto. Debe cubrir mínimo:
- Descripción general del sistema
- Usuarios y roles
- Módulos con reglas de negocio
- Criterios de aceptación globales
- Fuera de alcance para v1.0

### 8.2 Ejecutar DATABASE SELECTION GATE

```
🔔 DATABASE SELECTION GATE
Motor seleccionado: Supabase
Documentado en: data/supabase/DATABASE_CONFIG.yaml
```

### 8.3 Ejecutar DATABASE MODEL GATE

```
🔔 DATABASE MODEL GATE
¿Quién define el modelo de datos?
→ [Seleccionar: Usuario entrega schema / IA propone schema]
```

### 8.4 Generar Knowledge Base Inicial

Antes de crear tickets, generar:

```
ai_work_flow/knowledge/local/
├── 01_auth_decisions.md             # Decisiones sobre auth y roles
├── 02_database_schema_decisions.md  # Decisiones sobre tablas y RLS
├── 03_memberships_business_rules.md # Reglas de negocio de membresías
└── 04_training_plans_patterns.md    # Patrones de planes de entrenamiento

ai_work_flow/knowledge/remote/
├── supabase_auth_reference.md
├── supabase_rls_reference.md
└── nextjs_app_router_reference.md
```

### 8.5 Checklist Final FASE 1

- [ ] SPECIFICATION.md creado y revisado
- [ ] DATABASE SELECTION GATE documentado
- [ ] DATABASE MODEL GATE respondido
- [ ] Schema en estado `draft` creado en `data/supabase/schema/`
- [ ] Knowledge base inicial generada
- [ ] DATABASE_CONFIG.yaml completado
- [ ] Listo para crear tickets de FASE 2

**Resultado**: ✅ FASE 1 COMPLETADA

---

## 9. FASE 2: Diseño y Arquitectura

### 9.1 FASE 2.1 — Revisión de SPEC

**SPECIFICATION GATE**:

> **Regla de oro**: No se avanza a FASE 2.2 sin confirmar que SPECIFICATION.md existe en la ruta oficial.

| Situación | Acción |
|-----------|--------|
| SPECIFICATION.md existe en ruta oficial | ✅ Continuar |
| SPECIFICATION.md NO existe | ⛔ STOP — Crearlo primero |
| SPEC encontrada en otra ruta | ⛔ STOP — Moverla a la ruta oficial |

**Mensaje de parada estándar**:
```
⛔ SPECIFICATION GATE
No se encontró: ai_work_flow/docs/specs/SPECIFICATION.md

Por favor coloca tu especificación en esa ruta y confirma
cuando esté lista para continuar con FASE 2.2.
```

### 9.2 FASE 2.2 — Diseño de Base de Datos

1. Revisar y validar el schema en `data/supabase/schema/`
2. Pasar modelo de `draft` a `candidate`
3. Definir todas las tablas, relaciones y restricciones
4. Documentar las políticas RLS por tabla y rol
5. Definir índices necesarios para queries frecuentes

**Schema SQL de referencia** (`data/supabase/schema/001_initial.sql`):
```sql
-- Extender tabla de auth.users con perfil
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'trainer', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tipos de membresía
CREATE TABLE membership_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  duration_days INTEGER NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membresías asignadas a miembros
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES profiles(id) NOT NULL,
  type_id UUID REFERENCES membership_types(id) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pagos
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID REFERENCES memberships(id) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('cash', 'card', 'transfer')),
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'cancelled')),
  notes TEXT,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Planes de entrenamiento
CREATE TABLE training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id) NOT NULL,
  is_template BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ejercicios dentro de un plan
CREATE TABLE plan_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES training_plans(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  sets INTEGER,
  reps INTEGER,
  rest_seconds INTEGER,
  notes TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_plans_updated_at BEFORE UPDATE ON training_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 9.3 FASE 2.3 — Aprobación del Schema

1. Revisión humana del schema completo
2. Confirmar que cubre todos los módulos de la SPEC
3. Pasar modelo de `candidate` a `approved`
4. Ejecutar migración en Supabase DEV

### 9.4 FASE 2.4 — Creación de Tickets Iniciales

Una vez el schema está `approved`, crear los tickets de implementación:

```
TKT-OMEGYM-001: Setup inicial del proyecto y conexión a Supabase
TKT-OMEGYM-002: Implementar autenticación (login / registro) con Supabase Auth
TKT-OMEGYM-003: Implementar middleware de protección de rutas y roles
TKT-OMEGYM-004: Implementar CRUD de miembros
TKT-OMEGYM-005: Implementar tipos de membresía
TKT-OMEGYM-006: Implementar asignación de membresías a miembros
TKT-OMEGYM-007: Implementar registro de pagos
TKT-OMEGYM-008: Implementar alertas de membresías próximas a vencer
TKT-OMEGYM-009: Implementar CRUD de planes de entrenamiento
TKT-OMEGYM-010: Implementar asignación de planes a miembros
TKT-OMEGYM-011: Implementar vista del miembro (solo lectura de su plan)
TKT-OMEGYM-012: Implementar dashboard con métricas del gym
TKT-OMEGYM-013: Configurar despliegue en Vercel
```

### 9.5 Checklist FASE 2

- [ ] SPECIFICATION GATE ejecutado correctamente
- [ ] Schema SQL creado y en estado `approved`
- [ ] Migración ejecutada en Supabase DEV
- [ ] Knowledge base generada (local + remote)
- [ ] Todos los tickets iniciales creados
- [ ] DATABASE_CONFIG.yaml actualizado con estado final

**Resultado**: ✅ FASE 2 COMPLETADA — Listo para implementar

---

## 10. FASE 3: Implementación por Tickets

### 10.1 Ciclo de Desarrollo por Ticket

```
Abrir Ticket → Diseñar → Implementar → Probar → Cerrar Ticket
```

Regla: **Un ticket a la vez**. No abrir el siguiente ticket hasta que el anterior esté en `Review` o `Closed`.

### 10.2 Tipos de Tickets

**A. Ticket Externo** (del dueño del gym / usuario final):
- **Origen**: Dueño del gym, entrenador, usuario final
- **Ejemplo**: REQ-OMEGYM-001: "Quiero saber qué miembros tienen su membresía vencida esta semana"
- **Qué contiene**: Solicitud de negocio
- **Quién lo procesa**: El desarrollador

**B. Specification Incremental**:
- **Origen**: Traducción técnica de un ticket externo grande
- **Quién la crea**: El desarrollador
- **Base**: Cambio importante que requiere nuevo módulo o rediseño

**C. Tickets Internos de Desarrollo**:
- **Origen**: Derivados del diseño en FASE 2.4
- **Formato**: `TKT-OMEGYM-###`
- **Qué contienen**: Tarea específica de implementación

### 10.3 Flujo de Tickets — Escenario: Proyecto Nuevo

```
Ticket Externo: REQ-OMEGYM-001
"Quiero controlar los pagos y las membresías de mis socios"
    ↓
DATABASE SELECTION GATE: Supabase ✅
    ↓
Crear: ai_work_flow/docs/specs/SPECIFICATION.md
    ↓
DATABASE MODEL GATE: Schema propuesto por IA ✅
    ↓
Knowledge generado: 01_auth, 02_schema, 03_memberships, 04_training_plans
    ↓
Tickets internos creados:
    TKT-OMEGYM-001 al TKT-OMEGYM-013
    ↓
Por cada ticket: Diseñar → Implementar → Probar → Cerrar
    ↓
Cerrar ticket externo REQ-OMEGYM-001
```

### 10.4 Flujo de Tickets — Escenario: Cambio Pequeño en Proyecto Existente

```
Ticket Externo: REQ-OMEGYM-015
"Agregar campo de fotografía al perfil del miembro"
    ↓
Crear directamente ticket interno:

TKT-OMEGYM-025: Agregar foto de perfil a members
---
Tipo: Mejora
Módulo: members
Archivos:
  - src/features/members/components/MemberForm.tsx
  - src/services/members.service.ts
  - data/supabase/schema/002_avatar_url.sql  (si falta columna)
    ↓
Implementar → Probar → Cerrar
    ↓
Cerrar ticket externo REQ-OMEGYM-015
```

### 10.5 Flujo de Tickets — Escenario: Cambio Grande

```
Ticket Externo: REQ-OMEGYM-030
"Quiero agregar un módulo de asistencia diaria al gym"
    ↓
Crear especificación incremental:

ai_work_flow/docs/specs/incremental/SPEC_002_attendance_module.md
    ↓
Diseñar nuevo schema:
  - Tabla: attendance (id, member_id, check_in, check_out)
  - RLS correspondiente
    ↓
Nuevos tickets:
    TKT-OMEGYM-040: Schema y migración de asistencias
    TKT-OMEGYM-041: Registro de entrada/salida
    TKT-OMEGYM-042: Historial de asistencias por miembro
    TKT-OMEGYM-043: Reporte de asistencias en dashboard
    ↓
Por cada ticket: Implementar → Probar → Cerrar
    ↓
Cerrar ticket externo REQ-OMEGYM-030
```

### 10.6 Regla de Decisión: ¿Cuándo crear nueva SPEC?

| Tipo de Cambio                             | ¿Nueva SPEC?  | ¿Qué crear?                        |
|--------------------------------------------|---------------|------------------------------------|
| Proyecto nuevo                             | ✅ Sí         | `docs/specs/SPECIFICATION.md`      |
| Fix de validación en formulario            | ❌ No         | Ticket interno directo             |
| Nuevo campo en tabla existente             | ❌ No         | Ticket interno directo             |
| Nuevo módulo completo (asistencia, etc.)   | ✅ Sí         | `incremental/SPEC_00X.md`          |
| Nuevo rol de usuario                       | ✅ Sí         | `incremental/SPEC_00X.md`          |
| Rediseño completo de un módulo             | ⚠️ Depende    | Evaluar alcance del cambio         |
| Integración con sistema de pagos externo   | ✅ Sí         | `incremental/SPEC_00X.md`          |

**Criterios para "Cambio Grande"**:
- Requiere nuevas tablas en la base de datos
- Cambia la arquitectura de un módulo existente
- Integra un sistema o API externo
- Estimación mayor a 2 días de desarrollo
- Implica nuevas reglas de negocio no documentadas en la SPEC original

### 10.7 Checklist por Ticket (FASE 3)

- [ ] Ticket definido con alcance claro
- [ ] Ticket externo referenciado (si aplica)
- [ ] Knowledge relevante consultado
- [ ] Código implementado y tipado en TypeScript
- [ ] Servicio de Supabase conectado correctamente
- [ ] RLS validada si aplica al ticket
- [ ] Prueba unitaria escrita (si aplica)
- [ ] Prueba manual ejecutada y documentada
- [ ] Criterios de aceptación cumplidos
- [ ] Ticket cerrado con evidencia
- [ ] Ticket externo cerrado (si aplica)

---

## 11. Módulos del Sistema — Detalle

### 11.1 Autenticación y Roles

**Descripción**: Control de acceso al sistema usando Supabase Auth con roles diferenciados.

**Roles**:
| Rol        | Permisos                                                              |
|------------|-----------------------------------------------------------------------|
| `admin`    | Acceso total: miembros, pagos, membresías, planes, reportes           |
| `trainer`  | Ver miembros, crear y editar planes, ver membresías                   |
| `member`   | Solo ver su plan de entrenamiento asignado                            |

**Middleware de protección**: Ver sección 15.2

**Tickets relacionados**: TKT-OMEGYM-002, TKT-OMEGYM-003

---

### 11.2 Gestión de Miembros

**Descripción**: Registro, edición y control de los socios del gimnasio.

**Funcionalidades**:
- Listar todos los miembros con búsqueda y filtros
- Crear nuevo miembro (nombre, email, teléfono, foto)
- Editar información del miembro
- Ver detalle del miembro con su membresía y plan activo
- Desactivar miembro

**Reglas de Negocio**:
- Un miembro puede tener solo una membresía activa al mismo tiempo
- El email es único en el sistema
- Solo el admin puede crear o desactivar miembros

**Paginación**: 20 miembros por página con carga infinita o paginación numérica

**Tickets relacionados**: TKT-OMEGYM-004

---

### 11.3 Membresías y Pagos

**Descripción**: Control de los planes de pago contratados por cada miembro y sus pagos asociados.

**Funcionalidades — Membresías**:
- Administrar tipos de membresía (mensual, visita)
- Asignar membresía a miembro
- Ver estado: activa, vencida, cancelada
- Alerta de membresías próximas a vencer (configurable: 7, 14 días)

**Funcionalidades — Pagos**:
- Registrar pago de membresía
- Ver historial de pagos por miembro
- Filtrar por fecha, método de pago y estado
- Ver miembros con pagos pendientes

**Reglas de Negocio**:
- Una membresía vence automáticamente al cumplir `duration_days`
- Se puede registrar el pago antes o después de activar la membresía
- Los métodos de pago válidos son: efectivo, tarjeta, transferencia
- Solo el admin puede registrar o cancelar pagos

**Paginación**: 50 pagos por página con filtros por rango de fechas

**Tickets relacionados**: TKT-OMEGYM-005, TKT-OMEGYM-006, TKT-OMEGYM-007, TKT-OMEGYM-008

---

### 11.4 Planes de Entrenamiento

**Descripción**: Creación y asignación de rutinas personalizadas o genéricas a los miembros.

**Funcionalidades**:
- Crear plan de entrenamiento (nombre, descripción, lista de ejercicios)
- Agregar ejercicios con sets, reps, descanso y orden
- Marcar plan como plantilla reutilizable
- Asignar plan a un miembro específico
- El miembro puede ver su plan asignado desde su vista

**Reglas de Negocio**:
- Un miembro puede tener solo un plan activo a la vez
- Los planes plantilla no están asignados a ningún miembro
- Los entrenadores y admin pueden crear planes
- Solo el admin puede asignar planes a miembros

**Tickets relacionados**: TKT-OMEGYM-009, TKT-OMEGYM-010, TKT-OMEGYM-011

---

### 11.5 Dashboard y Reportes

**Descripción**: Vista general del estado del gym con métricas clave.

**Métricas principales**:
- Total de miembros activos
- Total de membresías activas / vencidas / próximas a vencer
- Ingresos del mes actual
- Miembros con pago pendiente
- Últimas altas de miembros

**Performance**: Queries optimizadas con índices, datos cacheados con React Query o Zustand

**Tickets relacionados**: TKT-OMEGYM-012

---

## 12. Despliegue — Vercel

### 12.1 Configuración Inicial

1. Conectar repositorio GitHub a Vercel
2. Configurar variables de entorno en el dashboard de Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Configurar Vercel para SPA: `vercel.json` con `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`
4. Configurar dominio personalizado (opcional)

### 12.2 Flujo de Despliegue

```
Rama main → Vercel detecta push → Build automático → Deploy a producción
Ramas feature/* → Vercel crea preview URL automáticamente
```

### 12.3 Checklist de Despliegue

- [ ] Variables de entorno configuradas en Vercel
- [ ] Build local pasa sin errores (`npm run build`)
- [ ] Supabase de producción configurado (diferente al de DEV)
- [ ] Migraciones ejecutadas en Supabase de producción
- [ ] RLS activada en todas las tablas de producción
- [ ] Dominio configurado (si aplica)

**Ticket relacionado**: TKT-OMEGYM-013

---

## 13. Plan de Testing

### 13.1 Estrategia de Testing

| Nivel | Herramienta | Cubre | Cuándo |
|-------|-------------|-------|--------|
| Unit | Vitest | Funciones utilitarias, validaciones Zod, servicios | Por ticket |
| Integration | Vitest + Supabase local | Servicios con BD real | Por módulo |
| E2E | Playwright | Flujos críticos completos | Antes de deploy |

### 13.2 Qué Testear por Prioridad

**Crítico (obligatorio antes de cerrar ticket)**:
- Login / Logout con roles
- CRUD de miembros (crear, editar, listar)
- Registro de pagos
- RLS: verificar que un miembro NO vea datos de otro

**Importante**:
- Asignación de membresías
- Creación de planes de entrenamiento
- Dashboard métricas básicas

**Deseable**:
- Formularios con validación Zod
- Estados de loading y error
- Responsive en móvil

### 13.3 Ejemplo de Test Unitario (Vitest)

```typescript
// tests/unit/membership-rules.test.ts
import { describe, it, expect } from 'vitest'
import { calculateEndDate } from '@/utils/membership-rules'

describe('Membership Rules', () => {
  it('calculates end date correctly for 30-day membership', () => {
    const start = new Date('2026-05-01')
    const end = calculateEndDate(start, 30)
    expect(end).toEqual(new Date('2026-05-31'))
  })

  it('throws if start date is in the past', () => {
    expect(() => calculateEndDate(new Date('2020-01-01'), 30))
      .toThrow('Start date cannot be in the past')
  })
})
```

### 13.4 Ejemplo de Test E2E (Playwright)

```typescript
// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test'

test('admin can login and see dashboard', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[name=email]', 'admin@gym.com')
  await page.fill('input[name=password]', 'password123')
  await page.click('button[type=submit]')
  
  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('text=Métricas')).toBeVisible()
})
```

### 13.5 Scripts de Testing (package.json)

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## 14. Estrategia de Componentes

### 14.1 Regla General

- **Todos los componentes son Client Components**: No hay server components en Vite + React
- **Fetch de datos**: Se hace en hooks (`useEffect`) o en librerías de caché (React Query, SWR)
- **Separación de responsabilidades**: Presentación (componentes puros) vs Lógica (hooks/servicios)

### 14.2 Arquitectura por Capa

```
src/
├── pages/
│   ├── dashboard/
│   │   ├── Dashboard.tsx          # useEffect → servicio → estado
│   │   ├── Members.tsx
│   │   └── Payments.tsx
│   ├── trainer/
│   │   ├── Panel.tsx
│   │   ├── Members.tsx
│   │   └── Plans.tsx
│   └── member/
│       └── MyPlan.tsx
├── components/
│   ├── ui/atoms/                  # Button, Input, Badge, Avatar (sin lógica)
│   ├── ui/molecules/              # Modal, TabBar, SearchInput
│   └── layout/                    # AdminLayout, Sidebar, BottomNav (contexto de layout)
├── services/                      # Llamadas a Supabase
└── store/                         # Estado global (Zustand)
```

### 14.3 Patrones Obligatorios

1. **Servicios puros**: Los servicios (`services/*.ts`) reciben/retornan datos, sin hooks
2. **Páginas ligeras**: Las páginas montan el layout, llaman servicios, delegan UI a componentes
3. **Componentes de UI sin efectos**: Los átomos/moléculas no llaman servicios directamente
4. **Zustand para estado global**: Auth, sesión, configuraciones

### 14.4 Ejemplo Correcto

```typescript
// src/pages/dashboard/Members.tsx
import { useEffect, useState } from 'react'
import { MembersTable } from '@/components/ MembersTable'
import { membersService } from '@/services/members.service'
import type { Member } from '@/types'

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    membersService.getAll()
      .then(setMembers)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />
  return <MembersTable members={members} />
}

// src/components/MembersTable.tsx
import type { Member } from '@/types'

export function MembersTable({ members }: { members: Member[] }) {
  // UI pura: recibe datos por props, renderiza tabla
}
```

---

## 15. Protección de Rutas

### 15.1 Componente ProtectedRoute

**Ubicación**: `src/components/auth/ProtectedRoute.tsx`

```typescript
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

interface Props {
  children: React.ReactNode
  allowedRoles?: ('admin' | 'trainer' | 'member')[]
}

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, loading, initialized } = useAuthStore()
  const location = useLocation()

  if (!initialized || loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
```

### 15.2 Uso en el Router

```typescript
// src/App.tsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
    <Route element={<AdminLayout />}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/members" element={<MembersPage />} />
    </Route>
  </Route>
  <Route element={<ProtectedRoute allowedRoles={['member']} />}>
    <Route element={<MemberLayout />}>
      <Route path="/my-plan" element={<MyPlanPage />} />
    </Route>
  </Route>
</Routes>
```

---

## 16. Manejo de Errores

### 16.1 Tipos de Errores

```typescript
// src/types/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const ErrorCodes = {
  AUTH_INVALID_CREDENTIALS: 'AUTH_001',
  AUTH_UNAUTHORIZED: 'AUTH_002',
  MEMBER_NOT_FOUND: 'MBR_001',
  MEMBER_EMAIL_EXISTS: 'MBR_002',
  MEMBERSHIP_EXPIRED: 'MBR_003',
  PAYMENT_FAILED: 'PAY_001',
  DATABASE_ERROR: 'DB_001',
  VALIDATION_ERROR: 'VAL_001',
} as const
```

### 16.2 Patrón de Error en Servicios

```typescript
// src/services/members.service.ts
export const membersService = {
  create: async (data: CreateMemberInput): Promise<Member> => {
    try {
      const { data: member, error } = await supabase
        .from('profiles')
        .insert(data)
        .select()
        .single()

      if (error) {
        if (error.code === '23505') { // Unique violation
          throw new AppError(
            'Ya existe un miembro con ese email',
            ErrorCodes.MEMBER_EMAIL_EXISTS,
            409
          )
        }
        throw new AppError(
          'Error al crear miembro',
          ErrorCodes.DATABASE_ERROR,
          500,
          { details: error.message }
        )
      }

      return member
    } catch (err) {
      if (err instanceof AppError) throw err
      throw new AppError('Error inesperado', ErrorCodes.DATABASE_ERROR, 500)
    }
  }
}
```

### 16.3 Error Boundary Global

```typescript
// src/components/ErrorBoundary.tsx
import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return <ErrorFallback error={this.state.error} />
    }
    return this.props.children
  }
}

function ErrorFallback({ error }: { error: Error & { digest?: string } }) {
  reset: () => void
}) {
  useEffect(() => {
    console.error('Captured error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h2 className="text-2xl font-bold mb-4">Algo salió mal</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Intentar de nuevo
      </button>
    </div>
  )
}
```

### 16.4 Toast Notifications para Errores de Usuario

```typescript
// src/hooks/use-error-handler.ts
import { toast } from 'sonner'
import { AppError } from '@/types/errors'

export function handleError(err: unknown) {
  if (err instanceof AppError) {
    toast.error(err.message)
  } else {
    toast.error('Error inesperado. Intenta de nuevo.')
  }
}
```

---

## 17. Patrones de UI States

### 17.1 Loading States

```typescript
// src/components/ui/atoms/LoadingSpinner.tsx
export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )
}

// Uso con Suspense en App Router
// src/app/members/loading.tsx
import { LoadingSpinner } from '@/components/ui/atoms/LoadingSpinner'

export default function Loading() {
  return <LoadingSpinner />
}
```

### 17.2 Error States

```typescript
// src/components/ui/molecules/ErrorMessage.tsx
export function ErrorMessage({ 
  message, 
  onRetry 
}: { 
  message: string
  onRetry?: () => void 
}) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <p className="text-red-800">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 text-red-600 underline">
          Reintentar
        </button>
      )}
    </div>
  )
}
```

### 17.3 Empty States

```typescript
// src/components/ui/molecules/EmptyState.tsx
export function EmptyState({ 
  title, 
  description, 
  action 
}: { 
  title: string
  description: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-gray-500 mt-1">{description}</p>
      {action && (
        <button onClick={action.onClick} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
          {action.label}
        </button>
      )}
    </div>
  )
}
```

---

## 18. Estrategia de Paginación y Performance

### 18.1 Paginación en Tablas

```typescript
// Patrón de paginación en servicios
export const membersService = {
  getPaginated: async (page: number, limit: number = 20) => {
    const start = (page - 1) * limit
    const end = start + limit - 1

    const { data, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .range(start, end)
      .order('full_name')

    if (error) throw error
    return { data, total: count, page, limit }
  }
}
```

### 18.2 Performance en Dashboard

- Usar React Query o Zustand para cachear métricas en cliente
- Índices en columnas de filtrado frecuente (ver sección 5.4.8)
- Evitar N+1 queries usando joins de Supabase

### 18.3 Optimización de Consultas

```typescript
// ✅ Buen patrón: un query con join
const { data } = await supabase
  .from('memberships')
  .select(`
    *,
    member:profiles(full_name, avatar_url),
    type:membership_types(name, price)
  `)
  .eq('status', 'active')

// ❌ Mal patrón: N queries separados
```

---

## 19. Convenciones

### 19.1 Nomenclatura

| Elemento         | Formato                    | Ejemplo                          |
|------------------|----------------------------|----------------------------------|
| Proyecto         | `omega-gym`                | `omega-gym`                      |
| Ticket           | `TKT-OMEGYM-###`           | `TKT-OMEGYM-001`                 |
| Knowledge local  | `##_<tema>_<tipo>.md`      | `01_auth_decisions.md`           |
| Knowledge remote | `<servicio>_reference.md`  | `supabase_auth_reference.md`     |
| Lección          | `lesson_<descripcion>.md`  | `lesson_supabase_rls_payments.md`|
| Feature          | kebab-case                 | `training-plans`, `members`      |
| Componente       | PascalCase                 | `MemberCard.tsx`, `PaymentRow.tsx`|
| Hook             | camelCase con `use`        | `useMembers.ts`, `usePayments.ts`|
| Servicio         | camelCase con `.service`   | `members.service.ts`             |
| Tipo             | PascalCase                 | `Member.ts`, `Payment.ts`        |

### 19.2 Convenciones de Código TypeScript

```typescript
// ✅ Tipos globales en src/types/
export type Member = {
  id: string
  full_name: string
  phone: string | null
  avatar_url: string | null
  role: 'admin' | 'trainer' | 'member'
  created_at: string
}

export type MembershipStatus = 'active' | 'expired' | 'cancelled'

// ✅ Servicio de Supabase en src/services/
import { supabase } from '@/lib/supabase'
import type { Member } from '@/types'

export const membersService = {
  getAll: async (): Promise<Member[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name')
    if (error) throw error
    return data
  },

  getById: async (id: string): Promise<Member> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  }
}
```

### 19.3 Convenciones de Commits

```
<tipo>(<scope>): <descripción> (#TKT-OMEGYM-###)

Tipos válidos:
  feat      → Nueva funcionalidad
  fix       → Corrección de bug
  refactor  → Refactoring sin cambio de funcionalidad
  style     → Cambios de estilo/UI
  docs      → Documentación
  test      → Pruebas
  chore     → Configuración, dependencias

Ejemplos:
  feat(members): add member creation form (#TKT-OMEGYM-004)
  fix(payments): fix date format in payment table (#TKT-OMEGYM-007)
  docs(spec): update membership business rules
```

### 19.4 Configuración de Supabase Client

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## 20. Checklist: Empezar con la Metodología

⚠️ **NOTA**: Si es tu primera vez usando esta metodología, completa primero **FASE 0** y **FASE 1** antes de escribir código.

- [ ] 1. Leer este documento completo
- [ ] 2. Ejecutar FASE 0: entorno configurado y proyecto Vite corriendo
- [ ] 3. Ejecutar DATABASE SELECTION GATE: Supabase seleccionado y documentado
- [ ] 4. Crear `SPECIFICATION.md` en la ruta oficial
- [ ] 5. Ejecutar DATABASE MODEL GATE: origen del schema definido
- [ ] 6. Crear schema SQL en `data/supabase/schema/`
- [ ] 7. Pasar schema a `approved` con revisión humana
- [ ] 8. Ejecutar migración en Supabase DEV
- [ ] 9. Generar knowledge base inicial (local + remote)
- [ ] 10. Crear todos los tickets iniciales (`TKT-OMEGYM-001` al `TKT-OMEGYM-013`)
- [ ] 11. Comenzar implementación ticket por ticket (FASE 3)
- [ ] 12. Documentar lecciones aprendidas en `knowledge/local/` durante el desarrollo

---

## 21. Preguntas Frecuentes

**P: ¿Puedo saltar la SPEC y empezar a codear directamente?**  
R: No. La SPEC es el contrato. Sin ella no hay criterios de aceptación y el riesgo de reescribir código es alto.

**P: ¿Cuándo ejecuto migraciones en Supabase?**  
R: Solo cuando el schema está en estado `approved`. Nunca con estado `draft` o `candidate`.

**P: ¿Qué pasa si necesito agregar una columna después de hacer la migración?**  
R: Creas un nuevo archivo de migración (ej. `002_add_column_x.sql`) y lo ejecutas. Nunca modifiques el SQL de migración ya ejecutado.

**P: ¿RLS es obligatoria desde el inicio?**  
R: Sí para producción. En desarrollo local puedes desactivarla temporalmente para probar más rápido, pero debe estar activa antes de TKT-OMEGYM-013 (despliegue).

**P: ¿Debo crear un ticket para cada cambio pequeño?**  
R: Para cualquier cambio que implique modificar código fuente o schema, sí. Los tickets son la memoria del proyecto.

**P: ¿Puedo tener múltiples tickets abiertos al mismo tiempo?**  
R: Sí, pero solo uno debe estar `In Progress` a la vez por desarrollador. Evita el trabajo en paralelo no coordinado.

**P: ¿Dónde guardo decisiones importantes que tomé durante el desarrollo?**  
R: En `ai_work_flow/knowledge/local/` con el formato `lesson_<descripcion>.md`.

**P: ¿Cómo manejo un bug crítico en producción?**  
R: Creas un ticket con tipo `fix` y prioridad `Alta`. Lo implementas, pruebas y despliegas directamente desde una rama `hotfix/`.

**P: ¿Cómo manejo el conocimiento que ya no es útil?**  
R: Archívalo en `knowledge/local/archived/` siguiendo el procedimiento de la sección 5.3.2.

---

## 22. Recursos del Proyecto

### Documentación Oficial (Remote Knowledge)
- **Supabase Docs**: https://supabase.com/docs
- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **Supabase RLS**: https://supabase.com/docs/guides/auth/row-level-security
- **React Router v7**: https://reactrouter.com/en/main
- **Vercel Deployment**: https://vercel.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Zustand**: https://docs.pmnd.rs/zustand/getting-started/introduction
- **Zod**: https://zod.dev/
- **Vitest**: https://vitest.dev/guide/
- **Playwright**: https://playwright.dev/docs/intro
- **Sonner**: https://sonner.emilkowal.ski/

### Rutas Importantes del Proyecto

| Recurso                      | Ruta                                              |
|------------------------------|---------------------------------------------------|
| Especificación principal     | `ai_work_flow/docs/specs/SPECIFICATION.md`        |
| Specs incrementales          | `ai_work_flow/docs/specs/incremental/`            |
| Tickets                      | `ai_work_flow/tickets/`                           |
| Knowledge local              | `ai_work_flow/knowledge/local/`                   |
| Knowledge local archivado    | `ai_work_flow/knowledge/local/archived/`          |
| Knowledge remoto             | `ai_work_flow/knowledge/remote/`                  |
| Schema de base de datos      | `data/supabase/schema/`                           |
| Modelos de referencia        | `data/supabase/models/`                           |
| Configuración de base datos  | `data/supabase/DATABASE_CONFIG.yaml`              |
| Variables de entorno         | `.env.local` (local) / Dashboard Vercel (producción) |

---

**Última actualización**: 2026-05-13 (v3.0)  
**Status**: ✅ Especificación actualizada (Vite + React)  
**Cambios v3.0**:
- ✅ Migración de Next.js 14 App Router → Vite + React 19 + React Router v7
- ✅ Stack actualizado: Vite como bundler, React Router v7 para enrutamiento
- ✅ Estructura de proyecto actualizada: `omega-gym-vite/` con páginas planas
- ✅ Env vars cambiadas: `NEXT_PUBLIC_SUPABASE_*` → `VITE_SUPABASE_*`
- ✅ Estrategia de componentes: solo Client Components (sin server components)
- ✅ Protección de rutas: `ProtectedRoute` en React Router en vez de middleware de Edge
- ✅ Sección 14: Server/Client Components → hooks + servicios + UI pura
- ✅ Sección 15: middleware.ts → ProtectedRoute component
- ✅ Setup de proyecto: `npm create vite` en vez de `create-next-app`
- ✅ Dependencias: `react-router-dom` agregado, `auth-helpers-nextjs` eliminado
