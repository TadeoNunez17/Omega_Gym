# Omega Gym — Metodología Simplificada

**Versión**: 3.0 (Lite)  
**Fecha**: 01 de Mayo 2026  
**Proyecto**: Omega Gym  

---

## 1. Qué es esto

Metodología simplificada para **un solo desarrollador + IA asistiendo**. Elimina burocracia innecesaria pero mantiene lo que SÍ importa: contexto, trazabilidad y calidad.

**Objetivo**: Sistema web para gestionar membresías, pagos y planes de entrenamiento de un gimnasio.

---

## 2. Stack

| Capa | Tecnología |
|------|------------|
| Framework | Vite + React 19 |
| Enrutamiento | React Router v7 |
| Base de datos | Supabase (PostgreSQL + Auth + Storage) |
| Deploy | Vercel (SPA) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS v4 |
| Estado | Zustand |
| Validación | Zod |
| Notificaciones | Sonner |

---

## 3. Estructura del Proyecto

```
omega-gym/
├── data/supabase/
│   ├── schema/              # SQL de tablas
│   └── seed/                # Datos de prueba
│
├── ai_work_flow/            # Documentación (no código)
│   ├── docs/specs/          # Especificaciones
│   ├── knowledge/           # Decisiones y referencias
│   └── tickets/             # Tickets de desarrollo
│
├── omega-gym-vite/src/      # Código fuente
│   ├── pages/               # Páginas por rol (React Router)
│   ├── components/          # UI reutilizable
│   ├── features/            # Módulos por funcionalidad
│   ├── lib/                 # Configuración (Supabase, etc)
│   ├── services/            # Llamadas a BD
│   ├── types/               # Tipos TypeScript
│   └── utils/               # Funciones auxiliares
│
├── .env.example
└── package.json
```

**Reglas**:
- Código en `src/`, documentación fuera de `src/`
- `.env.local` nunca se sube al repo

---

## 4. Cómo Funciona el Flujo

```
SPEC → Tickets → Código → Prueba → Cerrar
```

### 4.1 SPEC (lo que se va a construir)

Un archivo que dice QUÉ se construye. Sin esto, la IA no tiene contexto.

**Contenido mínimo**:
- Qué es el sistema
- Quiénes lo usan (roles)
- Qué módulos tiene
- Reglas de negocio
- Qué NO se hace en esta versión

### 4.2 Tickets (el control de lo que haces)

Formato: `TKT-OMEGYM-001`

**Estructura simple**:
```markdown
# TKT-OMEGYM-###: [Qué se hace]

## Qué
[Descripción breve]

## Archivos
- src/...

## Checklist
- [ ] Código hecho
- [ ] Probado manualmente
- [ ] Funciona como se esperaba
```

**Estados**: `Open` → `In Progress` → `Closed`

**Regla**: No cierras un ticket sin probarlo primero.

### 4.3 Knowledge (para no olvidar decisiones)

Solo generas knowledge cuando:
- Tomaste una decisión importante (ej: qué Auth usar)
- Encontraste un problema difícil y su solución
- Necesitas recordar cómo funciona algo complejo

**No necesitas knowledge para todo**. Solo lo que vale la pena recordar.

### 4.4 Base de Datos

**Flujo**:
1. Defines tablas en `data/supabase/schema/`
2. Revisas que esté bien
3. Ejecutas la migración en Supabase
4. Nunca modificas un SQL ya ejecutado (creas uno nuevo)

**NUNCA**: Credenciales en código. Solo en `.env.local`.

---

## 5. Fases (simplificadas)

### FASE 0: Setup (una sola vez)

```bash
# Crear proyecto Vite + React
npm create vite@latest omega-gym-vite -- --template react-ts
cd omega-gym-vite

# Instalar dependencias
npm install react-router-dom @supabase/supabase-js zustand zod sonner
npm install -D tailwindcss @tailwindcss/vite

# Crear carpetas
cd ..
mkdir -p ai_work_flow/{docs/specs,knowledge,tickets}
mkdir -p data/supabase/{schema,seed}
```

### FASE 1: Configurar (una sola vez)

- [ ] Crear SPECIFICATION.md con lo básico
- [ ] Definir tablas de la BD (schema)
- [ ] Conectar Supabase con `.env.local`
- [ ] Proyecto corriendo en `localhost:5173` (Vite)

### FASE 2: Implementar (por módulo)

Por cada módulo:
1. Abres ticket
2. Implementas con ayuda de la IA
3. Pruebas manualmente
4. Cierras ticket

### FASE 3: Deploy

- [ ] Push a GitHub
- [ ] Conectar a Vercel
- [ ] Configurar variables de entorno en Vercel
- [ ] Ejecutar migraciones en Supabase de producción

---

## 6. Módulos del Sistema

### 6.1 Autenticación y Roles

| Rol | Permisos |
|-----|----------|
| `admin` | Todo |
| `trainer` | Ver miembros, crear/editar planes |
| `member` | Solo ver su plan |

### 6.2 Gestión de Miembros

- Crear, editar, listar miembros
- Búsqueda y filtros
- Un miembro = una membresía activa
- Solo admin crea/desactiva

### 6.3 Membresías y Pagos

- Tipos: mensual, trimestral, anual
- Asignar a miembros
- Alerta de vencimiento (7, 14 días)
- Historial de pagos
- Métodos: efectivo, tarjeta, transferencia

### 6.4 Planes de Entrenamiento

- Crear planes con ejercicios (sets, reps, descanso)
- Asignar a miembros
- Plantillas reutilizables
- Un plan activo por miembro

### 6.5 Dashboard

- Miembros activos/vencidos
- Ingresos del mes
- Pagos pendientes
- Últimas altas

---

## 7. Schema de Referencia

```sql
-- Perfiles (extiende auth.users)
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

-- Membresías activas
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES profiles(id) NOT NULL,
  type_id UUID REFERENCES membership_types(id) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
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

-- Ejercicios
CREATE TABLE plan_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES training_plans(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  sets INTEGER,
  reps INTEGER,
  rest_seconds INTEGER,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. Reglas Importantes

### 8.1 Credenciales

```
❌ Nunca en código
❌ Nunca en el repo
✅ Solo en .env.local
```

### 8.2 Commits

```
feat(members): add creation form (#TKT-OMEGYM-004)
fix(payments): fix date format (#TKT-OMEGYM-007)
```

### 8.3 Patrón de Componentes

- **Todos los componentes son Client Components**: Vite + React no tiene server components
- **Páginas**: useEffect para fetch inicial, delegan UI a componentes hijos
- **Componentes de UI**: Sin efectos, reciben datos por props

### 8.4 Patrón de Servicios

```typescript
// src/services/members.service.ts
import { supabase } from '@/lib/supabase'

export const membersService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name')
    if (error) throw error
    return data
  }
}
```

### 8.5 Error Handling Básico

```typescript
try {
  const member = await membersService.getById(id)
} catch (err) {
  // Mostrar toast de error al usuario
  toast.error('No se pudo cargar el miembro')
}
```

---

## 9. Tickets Iniciales

```
TKT-OMEGYM-001: Setup y conexión a Supabase
TKT-OMEGYM-002: Login / Registro con Supabase Auth
TKT-OMEGYM-003: Protección de rutas por rol
TKT-OMEGYM-004: CRUD de miembros
TKT-OMEGYM-005: Tipos de membresía
TKT-OMEGYM-006: Asignar membresías
TKT-OMEGYM-007: Registro de pagos
TKT-OMEGYM-008: Alertas de vencimiento
TKT-OMEGYM-009: CRUD de planes de entrenamiento
TKT-OMEGYM-010: Asignar planes a miembros
TKT-OMEGYM-011: Vista del miembro (su plan)
TKT-OMEGYM-012: Dashboard con métricas
TKT-OMEGYM-013: Deploy a Vercel
```

---

## 10. Lo que Puedes Ignorar (por ahora)

| Cosa | Por qué |
|------|---------|
| Tests automatizados | Prueba manual es suficiente para empezar |
| Knowledge extensivo | Solo documenta lo que no quieras olvidar |
| SLA de tickets | Eres solo tú, no hay equipo esperando |
| Roles formales | Tú haces todo, los roles son conceptuales |
| Gates formales | Revísalos mentalmente, no los documentes |

---

## 11. Checklist para Empezar

- [ ] Leer este documento
- [ ] FASE 0: Setup del proyecto
- [ ] FASE 1: SPEC + Schema + Supabase conectado
- [ ] Crear tickets iniciales
- [ ] Empezar con TKT-OMEGYM-001

---

**Lo mínimo que necesitas**: SPEC + Tickets + Prueba manual antes de cerrar. Todo lo demás es opcional.
