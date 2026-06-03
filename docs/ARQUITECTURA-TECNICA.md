# PICTORGANIZER — Documento de Arquitectura Técnica

**Versión:** 1.0  
**Fecha:** 3 de junio de 2026  
**Estado:** Aprobado para iniciar desarrollo  
**Stack:** React · TypeScript · Vite · Capacitor · TailwindCSS  
**Documento base:** [ALCANCE-FUNCIONAL-INICIAL.md](./ALCANCE-FUNCIONAL-INICIAL.md)

---

## Tabla de contenidos

1. [Arquitectura general](#sección-1--arquitectura-general)
2. [Tecnologías](#sección-2--tecnologías)
3. [Estructura de carpetas](#sección-3--estructura-de-carpetas)
4. [Modelo de dominio](#sección-4--modelo-de-dominio)
5. [Gestión de estado](#sección-5--gestión-de-estado)
6. [Persistencia](#sección-6--persistencia)
7. [Navegación](#sección-7--navegación)
8. [Responsive](#sección-8--responsive)
9. [Preparación para futuras versiones](#sección-9--preparación-para-futuras-versiones)
10. [Decisiones técnicas](#sección-10--decisiones-técnicas)

---

## SECCIÓN 1 — ARQUITECTURA GENERAL

### 1.1 Tipo de aplicación

PICTORGANIZER es una **aplicación híbrida offline-first** empaquetada con Capacitor:

| Capa | Descripción |
|------|-------------|
| **UI** | SPA React renderizada en WebView nativa (iOS/Android) |
| **Lógica de negocio** | TypeScript puro en capa de dominio, independiente de React |
| **Persistencia** | Almacenamiento local en el dispositivo (sin dependencia de red) |
| **Nativo** | Plugins Capacitor para filesystem, cámara, preferencias, haptics y futuras notificaciones |

En desarrollo, la misma aplicación corre en el navegador con Vite (`npm run dev`), lo que acelera iteración con Cursor. En producción, el build estático se empaqueta dentro del contenedor nativo Capacitor.

```text
┌─────────────────────────────────────────────────────────┐
│                    Capacitor Shell                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │              React SPA (Vite build)                │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │  │
│  │  │ Presentation│  │ Application │  │  Domain   │  │  │
│  │  │ (pages, UI) │→ │  (hooks,    │→ │ (entities,│  │  │
│  │  │             │  │   stores)   │  │  services)│  │  │
│  │  └─────────────┘  └─────────────┘  └─────┬─────┘  │  │
│  │                                           │        │  │
│  │                    ┌──────────────────────▼─────┐  │  │
│  │                    │   Infrastructure (repos,   │  │  │
│  │                    │   Dexie, Filesystem, etc.) │  │  │
│  │                    └────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
│         Plugins: Filesystem · Preferences · Camera · …   │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Patrón arquitectónico recomendado

**Feature-Based Clean Architecture (arquitectura limpia por features)**

Combinación de:

- **Clean Architecture** — separación estricta entre dominio, aplicación, infraestructura y presentación.
- **Feature modules** — código agrupado por capacidad de negocio (perfiles, agenda, rutinas…).
- **Repository Pattern** — abstracción de persistencia para facilitar sync cloud futura.
- **Unidirectional data flow** — UI → acciones → servicios/repositorios → persistencia → UI.

#### Capas y responsabilidades

| Capa | Responsabilidad | Depende de |
|------|-----------------|------------|
| **Domain** | Entidades, reglas de negocio, servicios puros (recurrencias, estados de actividad, progreso) | Nada externo |
| **Application** | Casos de uso, orquestación, hooks, stores Zustand | Domain |
| **Infrastructure** | Repositorios concretos (Dexie), filesystem, plugins Capacitor | Domain (interfaces) |
| **Presentation** | Pages, components, layouts, navegación | Application |

**Regla de dependencia:** las capas internas nunca importan de las externas. El dominio no conoce React, Dexie ni Capacitor.

### 1.3 Justificación

| Criterio | Por qué este patrón |
|----------|---------------------|
| **Offline-first** | El dominio y los repositorios operan sobre almacenamiento local; la UI no asume red |
| **Escalabilidad** | Repository interfaces permiten añadir `CloudActivityRepository` sin tocar UI ni dominio |
| **Mantenibilidad (1 dev + Cursor)** | Features autocontenidos: localizar «recurrencias» = carpeta `features/activities/` |
| **Testabilidad** | Motor de recurrencias y cálculo de estados son funciones puras testeables con Vitest |
| **Modo niño / adulto** | Capa de aplicación gestiona permisos; presentación renderiza layouts distintos sobre mismos datos |
| **Capacitor + React** | SPA estándar; no requiere frameworks propietarios; ecosistema npm maduro |

### 1.4 Diagrama de flujo de datos (ejemplo: completar actividad)

```text
[ActivityCard] ──onComplete──▶ [useCompleteActivity hook]
                                        │
                                        ▼
                              [ActivityService.complete()]
                                        │
                          ┌─────────────┴─────────────┐
                          ▼                           ▼
              [ActivityRepository.update()]   [ProgressService.recalculate()]
                          │                           │
                          ▼                           ▼
                    [Dexie DB]                  [ProgressRepository]
                          │
                          ▼
              [Zustand / hook re-render] ──▶ [CelebrationOverlay]
```

---

## SECCIÓN 2 — TECNOLOGÍAS

### 2.1 Stack principal

| Categoría | Tecnología | Versión orientativa |
|-----------|------------|---------------------|
| Framework UI | React | 19.x |
| Lenguaje | TypeScript | 5.x (strict) |
| Bundler | Vite | 6.x |
| Mobile shell | Capacitor | 7.x |
| Estilos | TailwindCSS | 4.x |
| Routing | React Router | 7.x |

### 2.2 Librerías recomendadas y justificación

#### Estado global → **Zustand**

| Opción | Veredicto |
|--------|-----------|
| **Zustand** ✅ | Recomendado |
| Context API | Solo para temas muy acotados (ver §5) |
| Redux Toolkit | Descartado para fase 1 |

**Motivos de elegir Zustand:**

- API mínima; curva de aprendizaje baja para un desarrollador solo.
- Sin boilerplate (actions, reducers, providers anidados).
- Rendimiento nativo: suscripciones granulares sin re-render masivo.
- Middleware `persist` integrable con Capacitor Preferences para preferencias ligeras.
- Complementa (no sustituye) repositorios: Zustand para sesión UI, Dexie para datos de dominio.
- Escala bien si crece el proyecto; no requiere migración prematura a Redux.

**Cuándo usar Context API:** únicamente para valores estáticos o de bajo cambio (`ThemeProvider`, `DeviceProvider`, `I18nProvider` futuro).

**Por qué no Redux:** overhead innecesario sin backend remoto ni flujo de acciones complejo en fase 1. Si en fase 3 hubiera sync en tiempo real multicanal, se reevaluaría.

---

#### Persistencia local → **Dexie.js** + **Capacitor Filesystem** + **Capacitor Preferences**

| Opción | Veredicto |
|--------|-----------|
| **Dexie.js (IndexedDB)** ✅ | Datos estructurados (entidades, relaciones) |
| **Capacitor Filesystem** ✅ | Fotografías personalizadas |
| **Capacitor Preferences** ✅ | Configuración mínima y cache de sesión |
| localStorage | ❌ Insuficiente para volúmenes y queries |
| SQLite nativo (@capacitor-community/sqlite) | 🔄 Alternativa fase 2+ si crece mucho el volumen |
| RxDB / WatermelonDB | ❌ Complejidad excesiva para MVP |

**Motivos de Dexie.js:**

- **Offline-first real:** IndexedDB funciona idéntico en browser (dev) y WebView Capacitor (prod).
- **TypeScript nativo** con esquemas tipados.
- **Índices compuestos** para consultas por `profileId + date` (agenda diaria).
- **Migraciones versionadas** integradas (`db.version(n).stores(...)`).
- **Sin configuración nativa** extra en fase 1; un solo dev puede iterar rápido.
- **Repository Pattern:** interfaz `IActivityRepository` permite migrar a SQLite sin cambiar dominio.

**Motivos de Capacitor Filesystem para fotos:**

- Las imágenes no deben ir en IndexedDB (rendimiento, tamaño).
- Rutas relativas en BD; archivos en directorio sandbox de la app.
- Alineado con decisión D13 del alcance funcional (fotos solo en dispositivo).

**Motivos de Capacitor Preferences:**

- PIN hash, flags de onboarding, perfil activo: pares clave-valor pequeños.
- Acceso síncrono/async ligero para arranque rápido.

---

#### Formularios → **React Hook Form** + **Zod**

| Librería | Rol |
|----------|-----|
| **React Hook Form** | Gestión de formularios performante (crear/editar actividad, perfil, PIN) |
| **Zod** | Validación y tipos inferidos compartidos con dominio |
| **@hookform/resolvers** | Puente Zod ↔ RHF |

**Motivos:**

- RHF minimiza re-renders (importante en móvil).
- Zod define contratos reutilizables (`CreateActivitySchema`) en dominio y UI.
- Mensajes de error localizables para futuro i18n.

**Alternativa descartada:** Formik (más re-renders, API más verbosa).

---

#### Fechas → **date-fns**

| Opción | Veredicto |
|--------|-----------|
| **date-fns** ✅ | Recomendado |
| Day.js | Válido pero menos modular en tree-shaking |
| Luxon | Potente pero bundle mayor |
| Moment.js | ❌ Legacy, bundle pesado |

**Motivos:**

- Funciones puras importables individualmente (`format`, `addDays`, `isSameDay`, `startOfWeek`).
- Inmutable por diseño.
- Excelente soporte TypeScript.
- Imprescindible para motor de recurrencias, navegación entre días y progreso semanal.
- Locale `es` disponible para formateo de fechas en UI.

**Convención:** almacenar fechas como **ISO 8601 date strings** (`YYYY-MM-DD`) y horas como **minutos desde medianoche** (number) o strings `HH:mm`. Evitar objetos `Date` en persistencia.

---

#### Iconografía UI → **Lucide React**

| Uso | Solución |
|-----|----------|
| Iconos de interfaz (navegación, botones, estados) | **Lucide React** |
| Pictogramas de actividades | Assets propios en `/assets/pictograms/` (no Lucide) |

**Motivos Lucide:**

- Tree-shakeable, consistente, accesible.
- Tamaño configurable vía props (`size`, `strokeWidth`).
- Complementa pictogramas custom sin mezclarlos.

**Pictogramas:** SVG/PNG organizados por categoría; catálogo en dominio (`PictogramCatalog`).

---

#### Animaciones → **Framer Motion**

| Opción | Veredicto |
|--------|-----------|
| **Framer Motion** ✅ | Refuerzo positivo, transiciones de pantalla, temporizador |
| CSS transitions only | Válido para hover/focus; insuficiente para celebraciones |
| React Spring | Alternativa válida; API menos declarativa para layouts |
| Lottie | 🔄 Opcional fase 2 para animaciones complejas pre-diseñadas |

**Motivos:**

- Animaciones declarativas (`AnimatePresence` para overlay de estrella/carita).
- Soporte `prefers-reduced-motion` integrable con settings de accesibilidad (D14).
- Gestos opcionales futuros (swipe entre días).
- Buen rendimiento en WebView móvil con animaciones simples.

**Regla de producto:** animaciones suaves y breves; respetar flag `reduceMotion` en configuración.

---

#### Otras librerías de soporte

| Librería | Propósito |
|----------|-----------|
| **uuid** (v4) | Generación de IDs offline-safe |
| **clsx** + **tailwind-merge** | Composición de clases Tailwind (`cn()` utility) |
| **@capacitor/core** | Bridge nativo |
| **@capacitor/camera** | Captura/selección de fotos de perfil y actividades |
| **@capacitor/haptics** | Feedback táctil al completar actividad |
| **@capacitor/app** | Lifecycle, back button Android |
| **@capacitor/status-bar** | Ajuste barra de estado |
| **@capacitor/keyboard** | Comportamiento teclado en formularios |
| **Vitest** | Tests unitarios (dominio, recurrencias) |
| **Testing Library** | Tests de hooks y componentes críticos |
| **ESLint** + **Prettier** | Consistencia de código |

---

## SECCIÓN 3 — ESTRUCTURA DE CARPETAS

### 3.1 Árbol completo del proyecto

```text
pictorganizer/
├── android/                          # Proyecto nativo Android (Capacitor)
├── ios/                              # Proyecto nativo iOS (Capacitor)
├── public/
│   └── pictograms/                   # Pictogramas estáticos empaquetados
├── src/
│   ├── app/                          # Bootstrap y configuración global
│   │   ├── App.tsx
│   │   ├── providers.tsx             # Providers React (theme, device, router)
│   │   └── router.tsx                # Definición de rutas
│   │
│   ├── assets/                       # Recursos estáticos importables
│   │   ├── avatars/                  # Avatares predefinidos
│   │   ├── illustrations/            # Empty states, onboarding
│   │   └── sounds/                   # Sonidos opcionales refuerzo (fase 2)
│   │
│   ├── components/                   # Componentes UI compartidos (design system)
│   │   ├── ui/                       # Primitivos: Button, Card, Input, Modal…
│   │   ├── layout/                   # Shell, Header, BottomNav, Sidebar
│   │   ├── feedback/                 # Toast, CelebrationOverlay, EmptyState
│   │   └── media/                    # PictogramImage, ProfileAvatar, PhotoPicker
│   │
│   ├── config/                       # Constantes y configuración
│   │   ├── app.config.ts             # Nombre app, versión, feature flags
│   │   ├── categories.config.ts      # Categorías de actividades
│   │   ├── routes.config.ts          # Path constants
│   │   └── reinforcement.config.ts   # Mensajes positivos, animaciones
│   │
│   ├── domain/                       # Núcleo de negocio (sin dependencias externas)
│   │   ├── entities/                 # Tipos de entidad
│   │   ├── enums/                    # ActivityStatus, RecurrenceType, UserMode…
│   │   ├── schemas/                  # Esquemas Zod compartidos
│   │   ├── services/                 # Lógica pura
│   │   │   ├── recurrence.service.ts
│   │   │   ├── activity-state.service.ts
│   │   │   ├── anticipation.service.ts
│   │   │   ├── progress.service.ts
│   │   │   └── routine.service.ts
│   │   └── repositories/             # Interfaces (contratos)
│   │       ├── profile.repository.ts
│   │       ├── activity.repository.ts
│   │       ├── routine.repository.ts
│   │       └── settings.repository.ts
│   │
│   ├── infrastructure/               # Implementaciones concretas
│   │   ├── database/
│   │   │   ├── dexie.db.ts            # Instancia Dexie + esquema
│   │   │   ├── migrations/           # Scripts migración por versión
│   │   │   └── seeds/                # Rutinas biblioteca, pictogramas catálogo
│   │   ├── repositories/             # Implementaciones Dexie de interfaces
│   │   ├── filesystem/
│   │   │   └── photo.storage.ts      # Guardar/leer fotos (Capacitor FS)
│   │   ├── preferences/
│   │   │   └── settings.storage.ts   # Capacitor Preferences
│   │   └── security/
│   │       └── pin.service.ts        # Hash PIN modo adulto
│   │
│   ├── features/                     # Módulos verticales por funcionalidad
│   │   ├── onboarding/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   └── hooks/
│   │   ├── profiles/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   └── hooks/
│   │   ├── agenda/
│   │   │   ├── pages/                # HomeAgenda, Anticipation
│   │   │   ├── components/         # ActivityCard, DayTimeline, NowNextLater
│   │   │   └── hooks/                # useDayAgenda, useAnticipation
│   │   ├── calendar/
│   │   │   ├── pages/
│   │   │   ├── components/         # WeekView (tablet), DayPicker
│   │   │   └── hooks/
│   │   ├── activities/
│   │   │   ├── pages/                # Create, Edit, Detail
│   │   │   ├── components/         # ActivityForm, RecurrencePicker
│   │   │   └── hooks/
│   │   ├── routines/
│   │   │   ├── pages/
│   │   │   ├── components/         # RoutineLibraryCard
│   │   │   └── hooks/
│   │   ├── timer/
│   │   │   ├── components/         # VisualTimer, CountdownBar
│   │   │   └── hooks/                # useActivityTimer
│   │   ├── progress/
│   │   │   ├── pages/
│   │   │   ├── components/         # DailyProgress, WeeklyChart
│   │   │   └── hooks/
│   │   ├── child-mode/
│   │   │   ├── layouts/              # ChildLayout (minimal chrome)
│   │   │   └── guards/               # BlockAdultRoutes
│   │   ├── adult-mode/
│   │   │   ├── layouts/              # AdultLayout (nav completa)
│   │   │   ├── pages/                # PinGate
│   │   │   └── guards/               # RequireAdultSession
│   │   └── settings/
│   │       ├── pages/
│   │       ├── components/
│   │       └── hooks/
│   │
│   ├── hooks/                        # Hooks transversales
│   │   ├── useDeviceType.ts
│   │   ├── useReducedMotion.ts
│   │   └── useBackButton.ts          # Android hardware back
│   │
│   ├── store/                        # Zustand stores
│   │   ├── app.store.ts              # Sesión, modo, perfil activo, fecha seleccionada
│   │   ├── ui.store.ts               # Modales, toasts, overlays
│   │   └── selectors/                # Selectores derivados memoizados
│   │
│   ├── types/                        # Tipos globales auxiliares
│   │   ├── navigation.types.ts
│   │   └── common.types.ts
│   │
│   ├── utils/                        # Utilidades puras
│   │   ├── cn.ts                     # clsx + tailwind-merge
│   │   ├── date.utils.ts             # Wrappers date-fns
│   │   ├── id.utils.ts
│   │   └── format.utils.ts
│   │
│   ├── styles/
│   │   ├── globals.css               # Tailwind directives + CSS variables
│   │   └── tokens.css                # Design tokens (colores perfil, spacing)
│   │
│   ├── main.tsx                      # Entry point
│   └── vite-env.d.ts
│
├── docs/
│   ├── ALCANCE-FUNCIONAL-INICIAL.md
│   └── ARQUITECTURA-TECNICA.md
├── capacitor.config.ts
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 3.2 Descripción de carpetas clave

| Carpeta | Propósito |
|---------|-----------|
| `app/` | Ensamblaje: router, providers, componente raíz. Punto de entrada de la aplicación React |
| `domain/` | Corazón del negocio. **Cero imports** de React, Dexie o Capacitor. Testeable al 100 % con Vitest |
| `infrastructure/` | Detalles técnicos: BD, filesystem, plugins. Implementa interfaces de `domain/repositories/` |
| `features/` | Código vertical por funcionalidad. Cada feature tiene pages, components y hooks propios |
| `components/` | Design system compartido entre features. No contiene lógica de negocio |
| `store/` | Estado de sesión y UI efímera (Zustand). No duplica entidades de dominio |
| `config/` | Datos estáticos: categorías, rutinas seed, feature flags, constantes de rutas |
| `hooks/` | Hooks reutilizables que no pertenecen a un feature concreto |
| `utils/` | Funciones puras sin estado ni efectos secundarios |

### 3.3 Reglas de importación

```text
features/*  →  application (hooks, store)  →  domain  ←  infrastructure
components/*  →  hooks, utils, types (nunca domain services directamente)
domain/*  →  (nada externo)
```

Los componentes de UI invocan **hooks de aplicación**, no repositorios directamente.

---

## SECCIÓN 4 — MODELO DE DOMINIO

### 4.1 Diagrama entidad-relación

```text
┌──────────────┐       1     *      ┌─────────────────────┐
│   Profile    │───────────────────▶│  ActivityTemplate   │
└──────────────┘                    └─────────────────────┘
       │                                      │
       │ 1                                    │ 1
       │                                      │
       │ *                                    │ *
       ▼                                      ▼
┌──────────────────┐                 ┌─────────────────────┐
│ ActivityInstance │◀────────────────│  RecurrenceRule     │
└──────────────────┘      0..1       └─────────────────────┘
       │
       │ *
       ▼
┌──────────────────┐
│ CompletionRecord │  (opcional: embebido en instance como completadaAt)
└──────────────────┘

┌──────────────────┐       ┌──────────────────┐
│ RoutineTemplate  │       │    Category      │
│  (biblioteca)    │       │   (catálogo)     │
└──────────────────┘       └──────────────────┘

┌──────────────────┐       ┌──────────────────┐
│ Pictogram        │       │ AppSettings      │
│  (catálogo)      │       │  (singleton)     │
└──────────────────┘       └──────────────────┘
```

### 4.2 Entidades principales

#### Profile

Representa a una persona de la familia con agenda independiente.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` (uuid) | Identificador único |
| `name` | `string` | Nombre visible |
| `color` | `string` | Color principal hex (identidad visual) |
| `photoUri` | `string \| null` | Ruta filesystem foto personalizada |
| `avatarId` | `string \| null` | ID avatar predefinido si no hay foto |
| `createdAt` | `string` (ISO datetime) | Fecha creación |
| `updatedAt` | `string` | Última modificación |
| `sortOrder` | `number` | Orden en selector de perfiles |

**Responsabilidades:** agrupar actividades, instancias y estadísticas. No contiene lógica de agenda.

---

#### ActivityTemplate (serie / plantilla)

Definición maestra de una actividad recurrente o base reutilizable.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` | UUID |
| `profileId` | `string` | FK → Profile |
| `title` | `string` | Título |
| `description` | `string \| null` | Descripción opcional |
| `categoryId` | `string` | FK → Category |
| `startTimeMinutes` | `number` | Minutos desde 00:00 (ej. 480 = 08:00) |
| `endTimeMinutes` | `number \| null` | Fin opcional |
| `visual` | `ActivityVisual` | `{ type: 'pictogram', pictogramId } \| { type: 'photo', uri }` |
| `recurrence` | `RecurrenceRule` | Regla de repetición |
| `isActive` | `boolean` | Soft delete |
| `createdAt` / `updatedAt` | `string` | Auditoría local |

**Responsabilidades:** fuente de verdad para actividades repetidas. Al editar «todos los días», se modifica aquí y se regeneran instancias futuras.

---

#### ActivityInstance (ocurrencia)

Actividad concreta en una fecha específica. Es lo que muestra la agenda.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` | UUID |
| `templateId` | `string \| null` | FK opcional → ActivityTemplate (null si actividad única suelta) |
| `profileId` | `string` | FK → Profile |
| `date` | `string` | `YYYY-MM-DD` |
| `title` | `string` | Snapshot (desacoplado de template tras generación) |
| `description` | `string \| null` | Snapshot |
| `categoryId` | `string` | Snapshot |
| `startTimeMinutes` | `number` | Snapshot |
| `endTimeMinutes` | `number \| null` | Snapshot |
| `visual` | `ActivityVisual` | Snapshot |
| `status` | `ActivityStatus` | `pending \| in_progress \| completed \| missed` |
| `completedAt` | `string \| null` | ISO datetime cuando se completó |
| `isException` | `boolean` | true si esta instancia fue modificada individualmente |
| `sortOrder` | `number` | Orden dentro del día |

**Responsabilidades:** unidad central de la agenda, anticipación, temporizador y progreso. El estado se recalcula con `ActivityStateService` según hora actual.

**Regla clave:** las instancias pasadas conservan snapshot aunque cambie el template (integridad histórica para progreso).

---

#### RecurrenceRule (valor embebido)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `type` | `RecurrenceType` | `once \| daily \| weekdays \| weekly \| custom` |
| `daysOfWeek` | `number[]` | 0=Dom … 6=Sáb (para `custom` y `weekly`) |
| `startDate` | `string` | Primera ocurrencia |
| `endDate` | `string \| null` | Fin opcional de serie |
| `weekdayAnchor` | `number \| null` | Día semana ancla para `weekly` |

---

#### RoutineTemplate (biblioteca)

Plantilla preconfigurada del sistema (mañana, noche, etc.).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` | ID fijo (`routine-morning`, etc.) |
| `name` | `string` | Nombre visible |
| `categoryId` | `string` | Categoría principal |
| `description` | `string` | Texto ayuda |
| `steps` | `RoutineStep[]` | Lista ordenada de pasos |
| `isBuiltIn` | `boolean` | true = no editable por usuario |

**RoutineStep:** `{ title, pictogramId, categoryId, defaultStartOffsetMinutes, defaultDurationMinutes }`

**Responsabilidades:** onboarding y aplicación en bloque vía `RoutineService.applyToProfile()`.

---

#### Category

Catálogo de categorías (Alimentación, Higiene, Colegio…).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` | Slug (`food`, `hygiene`…) |
| `labelKey` | `string` | Clave i18n futura |
| `label` | `string` | Texto español fase 1 |
| `color` | `string` | Color categoría |
| `iconId` | `string` | Icono Lucide asociado |

---

#### Pictogram

Entrada del catálogo de pictogramas empaquetados.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `string` | ID único |
| `categoryId` | `string` | FK → Category |
| `assetPath` | `string` | Ruta en `/public/pictograms/` |
| `keywords` | `string[]` | Búsqueda futura |
| `label` | `string` | Etiqueta accesibilidad |

---

#### AppSettings (singleton)

Configuración global de la aplicación.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `onboardingCompleted` | `boolean` | |
| `activeProfileId` | `string \| null` | Perfil seleccionado |
| `adultPinHash` | `string \| null` | Hash PIN (nunca plaintext) |
| `preferredDeviceLayout` | `'phone' \| 'tablet' \| 'auto'` | Preferencia onboarding |
| `reduceMotion` | `boolean` | Accesibilidad D14 |
| `largeText` | `boolean` | Accesibilidad |
| `schemaVersion` | `number` | Versión migración BD |
| `adultSessionExpiresAt` | `string \| null` | Expiración sesión modo adulto |

---

#### ProgressSnapshot (calculado / cache opcional)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `profileId` | `string` | |
| `date` | `string` | |
| `totalCount` | `number` | |
| `completedCount` | `number` | |
| `percentage` | `number` | 0–100 |

**Nota:** preferible **calcular on-demand** con `ProgressService` desde instancias; materializar solo si hay problemas de rendimiento.

---

#### Entidades explícitamente NO incluidas en fase 1

| Entidad | Motivo |
|---------|--------|
| `Achievement` | Sin gamificación competitiva en alcance |
| `UserAccount` | Sin autenticación fase 1 |
| `SyncMetadata` | Reservado para fase cloud (ver §9) |

El **refuerzo positivo** no es entidad persistente: es configuración + evento UI efímero al completar.

### 4.3 Servicios de dominio (lógica pura)

| Servicio | Responsabilidad |
|----------|-----------------|
| `RecurrenceService` | Generar fechas/ocurrencias para rango; expandir template → instancias |
| `ActivityStateService` | Calcular `pending → in_progress → completed/missed` según hora |
| `AnticipationService` | Resolver AHORA / DESPUÉS / MÁS TARDE para un día |
| `ProgressService` | Agregar completadas/pendientes diario y semanal |
| `RoutineService` | Aplicar plantilla de rutina a perfil con offsets horarios |
| `ConflictService` | Detectar solapamientos horarios (warning en UI adulto) |

### 4.4 Relaciones resumidas

```text
Profile 1──* ActivityTemplate 1──* ActivityInstance (generadas)
Profile 1──* ActivityInstance (únicas sueltas, templateId = null)
RoutineTemplate ──aplica──▶ ActivityTemplate[] (batch create)
Category 1──* Pictogram
Category 1──* ActivityTemplate / ActivityInstance (referencia)
AppSettings ──referencia──▶ activeProfileId → Profile
```

---

## SECCIÓN 5 — GESTIÓN DE ESTADO

### 5.1 Tres categorías de estado

```text
┌─────────────────────────────────────────────────────────────┐
│                    ESTADO PERSISTENTE                      │
│         Dexie (entidades) + Preferences (settings)         │
│         + Filesystem (fotos)                                 │
├─────────────────────────────────────────────────────────────┤
│                    ESTADO GLOBAL (Zustand)                   │
│         Sesión, modo, UI transversal, fecha navegación       │
├─────────────────────────────────────────────────────────────┤
│                    ESTADO LOCAL (useState/useReducer)        │
│         Formularios, modales, tabs, animaciones locales      │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Estado persistente (fuente de verdad)

Almacenado en Dexie / Filesystem / Preferences. **No vive en Zustand** salvo cache derivado.

| Dato | Almacén | Motivo |
|------|---------|--------|
| Profiles | Dexie `profiles` | Entidad de dominio |
| ActivityTemplates | Dexie `activityTemplates` | Entidad de dominio |
| ActivityInstances | Dexie `activityInstances` | Entidad de dominio; índice `[profileId+date]` |
| RoutineTemplates (built-in) | Dexie seed / JSON estático | Biblioteca |
| Categories, Pictograms | Config estático + Dexie catálogo | Mayormente read-only |
| AppSettings | Capacitor Preferences | Arranque rápido, pocos campos |
| Fotos personalizadas | Capacitor Filesystem | Binarios fuera de IndexedDB |
| PIN hash | Capacitor Preferences | Seguridad |

**Patrón de acceso:** hooks como `useProfiles()` leen/escriben vía repositorios; usan `useLiveQuery` de Dexie React Hooks (dexie-react-hooks) para reactividad automática.

### 5.3 Estado global — Zustand (`app.store.ts`, `ui.store.ts`)

#### app.store.ts

| Campo | Tipo | Persiste | Descripción |
|-------|------|:--------:|-------------|
| `userMode` | `'child' \| 'adult'` | No | Modo actual de UI |
| `adultSessionActive` | `boolean` | No | Sesión adulto desbloqueada |
| `adultSessionExpiresAt` | `number \| null` | No | Timestamp expiración |
| `activeProfileId` | `string \| null` | Sí (Preferences) | Perfil activo |
| `selectedDate` | `string` | No | Fecha visible en agenda (`YYYY-MM-DD`) |
| `isOnboarding` | `boolean` | Deriva de settings | |
| `deviceClass` | `'phone' \| 'tablet'` | Parcial | Detectado + preferencia |

#### ui.store.ts

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `celebration` | `{ visible, type, message } \| null` | Overlay refuerzo positivo |
| `activeModal` | `string \| null` | Modal global |
| `toast` | `Toast \| null` | Notificaciones UI |
| `isLoading` | `boolean` | Loading global (mínimo uso) |

**Sincronización perfil activo:** al cambiar en Zustand → persistir en Preferences. Al arrancar app → hidratar Zustand desde Preferences.

### 5.4 Estado local (componente)

| Uso | Ejemplo |
|-----|---------|
| Formularios | React Hook Form state (crear actividad) |
| UI efímera | Tab seleccionado, dropdown abierto |
| Animaciones | `isAnimating` en CelebrationOverlay |
| PIN entry | Dígitos antes de validar |

### 5.5 Flujo de datos recomendado

```text
Component
   └─ useDayAgenda(date, profileId)          ← hook de feature
         └─ useLiveQuery(() => repo.getByDate(...))  ← Dexie reactivo
         └─ ActivityStateService.enrich(instances)    ← dominio puro
         └─ return { activities, now, next, later }
```

**No duplicar** instancias de actividades en Zustand. Zustand solo para lo que no está en BD o es efímero.

### 5.6 Comparativa final estado

| Necesidad | Solución |
|-----------|----------|
| Entidades CRUD | Dexie + repositories + dexie-react-hooks |
| Sesión / modo / fecha UI | Zustand app.store |
| Overlays / toasts | Zustand ui.store |
| Formularios | React Hook Form (local) |
| Tema / device / accesibilidad | React Context (bajo cambio) |

---

## SECCIÓN 6 — PERSISTENCIA

### 6.1 Tecnología recomendada

| Capa | Tecnología |
|------|------------|
| Datos estructurados | **Dexie.js** (IndexedDB) |
| Configuración / sesión | **@capacitor/preferences** |
| Fotografías | **@capacitor/filesystem** |
| PIN | Preferences (hash SHA-256 vía Web Crypto API) |

### 6.2 Esquema Dexie (v1)

```text
Database: PictorganizerDB

profiles
  id, name, color, photoUri, avatarId, createdAt, updatedAt, sortOrder

activityTemplates
  id, profileId, title, description, categoryId, startTimeMinutes,
  endTimeMinutes, visual, recurrence, isActive, createdAt, updatedAt

activityInstances
  id, templateId, profileId, date, title, description, categoryId,
  startTimeMinutes, endTimeMinutes, visual, status, completedAt,
  isException, sortOrder

Índices activityInstances:
  [profileId+date]        → agenda diaria
  [profileId+date+status] → progreso
  [templateId]            → regeneración serie
  [date]                  → limpieza mantenimiento
```

RoutineTemplates y Pictograms: **JSON estático** en `config/` + `infrastructure/database/seeds/` (no mutables en v1). Categories idem.

### 6.3 Estrategia de guardado

#### Principio: escritura atómica por operación de negocio

| Operación | Estrategia |
|-----------|------------|
| Crear actividad única | Insert 1 instance |
| Crear actividad recurrente | Insert 1 template + batch insert instances (ventana rolling) |
| Completar actividad | Update instance status + completedAt |
| Editar «solo este día» | Update instance + `isException=true` |
| Editar «todos» | Update template + delete future non-exception instances + regenerate |
| Aplicar rutina | Transaction: N templates + M instances |
| Subir foto | Write filesystem → store URI in entity |
| Eliminar perfil | Transaction: delete instances, templates, profile + cleanup photos |

#### Ventana rolling de instancias

Para no generar infinitas instancias:

- Al crear/editar template: generar instancias desde `startDate` hasta **+90 días**.
- Job al abrir app / cambiar día: extender ventana si quedan < 30 días generados.
- Instancias pasadas: **nunca auto-borrar** (progreso histórico).
- Instancias futuras no excepcionales: regenerables desde template.

#### Transacciones

Usar `db.transaction('rw', [...tables], async () => {...})` para operaciones multi-tabla.

### 6.4 Estrategia de recuperación

#### Arranque de aplicación

```text
1. initDatabase()           → Dexie open + migrate if needed
2. seedIfEmpty()            → rutinas/categorías si primera vez
3. loadSettings()           → Preferences → Zustand hydrate
4. resolveInitialRoute()    → onboarding? / select profile? / home?
5. extendInstanceWindow()   → background, non-blocking
```

#### Recuperación ante errores

| Escenario | Acción |
|-----------|--------|
| IndexedDB corrupto | Pantalla de error + opción «restablecer datos» (fase 2: export backup) |
| Foto no encontrada | Fallback a pictograma o avatar por defecto |
| Migración fallida | Rollback version; log en consola; bloquear escrituras |
| Dexie unavailable (raro) | Mensaje «almacenamiento no disponible» |

#### Queries críticas

| Query | Índice | Uso |
|-------|--------|-----|
| Agenda del día | `[profileId+date]` | Home, modo niño |
| Progreso semanal | `[profileId+date]` range | Estadísticas |
| Instancias de template | `[templateId]` | Edición serie |

### 6.5 Estrategia de migraciones

```text
schemaVersion en AppSettings ↔ Dexie.version(N)

v1: tablas iniciales
v2: (ejemplo futuro) campo notificationEnabled en templates
v3: (ejemplo futuro) tablas syncMetadata
```

**Reglas:**

1. Nunca modificar versión anterior; solo añadir `.version(N+1).stores({...}).upgrade(tx => ...)`.
2. Migraciones idempotentes y con logs.
3. Backup pre-migración (fase 2): export JSON a Filesystem.
4. Tests de migración en Vitest con BD in-memory (fake-indexeddb).

### 6.6 Generación de instancias (motor de recurrencias)

Componente crítico aislado en `domain/services/recurrence.service.ts`:

**Entrada:** `ActivityTemplate`, rango `[fromDate, toDate]`  
**Salida:** `ActivityInstance[]` (sin persistir; el repositorio persiste)

**Casos de borde obligatorios en tests:**

- Cambio horario verano/inviterno (heredar TZ del SO)
- `weekdays` en festivo (sáb/dom excluidos; festivos nacionales fase 2)
- `once` solo genera 1 instancia
- `endDate` anterior a hoy → no generar futuras
- Edición con excepciones preservadas

---

## SECCIÓN 7 — NAVEGACIÓN

### 7.1 Enfoque

- **React Router v7** con `createBrowserRouter`.
- Rutas anidadas con **layouts diferenciados** (`ChildLayout`, `AdultLayout`).
- **Route guards** como componentes wrapper (`RequireAdultSession`, `RequireOnboardingComplete`).
- Deep linking preparado (`/agenda/2026-06-03`) aunque en v1 uso principal sea in-app.

### 7.2 Mapa de pantallas

```text
/                           → Redirect resolver
/splash                     → SplashScreen (check init)
/onboarding/*               → OnboardingWizard (7 pasos)
/profiles                   → ProfileSelection

── Modo niño (ChildLayout) ──────────────────────
/agenda                     → HomeAgenda (default: hoy)
/agenda/:date               → HomeAgenda (día específico)
/anticipation               → AnticipationView (AHORA/DESPUÉS/MÁS TARDE)
/activity/:id               → ActivityDetail (vista simple, completar)

── Modo adulto (AdultLayout, RequireAdultSession) ─
/adult/pin                  → PinGate
/adult/agenda               → HomeAgenda (con controles extra)
/adult/calendar             → CalendarView
/adult/activity/new         → CreateActivity
/adult/activity/:id         → ActivityDetail (adult)
/adult/activity/:id/edit    → EditActivity
/adult/routines             → RoutineLibrary
/adult/routines/:id/apply   → ApplyRoutine
/adult/progress             → Statistics (diario + semanal)
/adult/profiles             → ManageProfiles
/adult/profiles/new         → CreateProfile
/adult/profiles/:id/edit    → EditProfile
/adult/settings             → Settings
```

### 7.3 Diagrama de navegación

```text
                    ┌─────────┐
                    │ Splash  │
                    └────┬────┘
                         │
           ┌─────────────┼─────────────┐
           ▼             ▼             ▼
    ┌────────────┐ ┌───────────┐ ┌──────────────┐
    │ Onboarding │ │  Profiles │ │ Agenda (auto)│
    └──────┬─────┘ └─────┬─────┘ └──────────────┘
           │             │
           └──────┬──────┘
                  ▼
         ┌────────────────┐
         │ Profile Selected│
         └────────┬───────┘
                  │
      ┌───────────┴───────────┐
      ▼                       ▼
┌─────────────┐      ┌─────────────────┐
│ CHILD MODE  │      │  ADULT MODE     │
│             │      │  (via /adult/pin)│
│ · Agenda    │      │ · Agenda        │
│ · Anticip.  │      │ · Calendar      │
│ · Activity  │      │ · Activities CRUD│
│ · Complete  │      │ · Routines      │
└─────────────┘      │ · Progress      │
                     │ · Profiles      │
                     │ · Settings      │
                     └─────────────────┘
```

### 7.4 Estructura de layouts

#### ChildLayout

- Header mínimo: fecha, perfil (avatar pequeño), indicador visual perfil activo.
- Bottom nav: **Agenda** · **Anticipación** (máx. 2–3 items grandes).
- Sin acceso a rutas `/adult/*`.
- Botón oculto/gesto para PIN adulto (ej. long-press en avatar o esquina).

#### AdultLayout

- Header con título sección + acciones.
- **Phone:** bottom tab bar (Agenda, Calendario, Rutinas, Progreso, Ajustes).
- **Tablet:** sidebar persistente + área contenido.
- Sesión expira tras inactividad (ej. 15 min) → vuelta a modo niño.

### 7.5 Guards y redirecciones

| Guard | Condición | Redirect |
|-------|-----------|----------|
| `BootResolver` | App init | onboarding / profiles / agenda |
| `RequireProfile` | Sin perfil activo | `/profiles` |
| `RequireAdultSession` | Modo adulto sin sesión | `/adult/pin` |
| `BlockAdultInChild` | userMode=child | Impide `/adult/*` |

### 7.6 Back button Android

`useBackButton` hook con `@capacitor/app`:

- En modales: cerrar modal.
- En formularios: confirmar descarte si dirty.
- En root agenda: minimizar app (no navegar fuera).

---

## SECCIÓN 8 — RESPONSIVE

### 8.1 Estrategia mobile-first

TailwindCSS con breakpoints progresivos. Diseño base en **320–428px** (móvil); enhancements en `md:` (tablet).

```text
Breakpoints Tailwind (propuesta):
  default     → móvil (< 768px)
  md:         → tablet (≥ 768px)
  lg:         → tablet grande / landscape (≥ 1024px)
```

### 8.2 Detección móvil vs tablet

Combinar **tres señales** (defensa en profundidad):

| Señal | Implementación | Uso |
|-------|----------------|-----|
| **CSS** | Breakpoints Tailwind (`md:`, `lg:`) | Layout, grid columns, tipografía |
| **JavaScript** | `window.matchMedia('(min-width: 768px)')` | Lógica condicional (mostrar WeekView) |
| **Capacitor Device** | `@capacitor/device` → `screen size` / platform | Clasificación inicial + onboarding |
| **Preferencia usuario** | `AppSettings.preferredDeviceLayout` | Override manual del onboarding |

#### Hook `useDeviceType`

Retorna:

```text
{
  deviceClass: 'phone' | 'tablet',
  isTablet: boolean,
  isPhone: boolean,
  orientation: 'portrait' | 'landscape',
  effectiveLayout: 'phone' | 'tablet'  // preferencia || detectado
}
```

**Regla:** la UI **nunca depende solo de User-Agent**. Prioridad: preferencia usuario > matchMedia > Capacitor Device.

### 8.3 Adaptaciones por dispositivo

| Elemento | Móvil | Tablet |
|----------|-------|--------|
| Agenda | Lista vertical, 1 columna, tarjetas full-width | Grid 2 cols o timeline lateral |
| ActivityCard | Altura grande, pictograma prominente | Compacta + más metadatos visibles |
| Navegación adulto | Bottom tabs | Sidebar fija izquierda |
| Calendario | Selector día horizontal (swipe) | Vista semanal completa |
| Anticipación | 3 bloques apilados | 3 columnas AHORA / DESPUÉS / MÁS TARDE |
| Formularios | Pantalla completa | Panel modal centrado max-w-lg |
| Temporizador | Barra bajo actividad actual | Widget lateral persistente |
| Tipografía | `text-lg` base modo niño | Escala moderada, más densidad adulto |

### 8.4 Safe areas y nativo

- Usar `env(safe-area-inset-*)` en CSS para notch y home indicator iOS.
- `@capacitor/status-bar` para color barra estado coherente con perfil activo.
- `@capacitor/keyboard` + `keyboard-resize: body` para formularios.

### 8.5 Accesibilidad responsive

- Modo `largeText` en settings → incrementa tokens `--text-scale`.
- Modo `reduceMotion` → desactiva Framer Motion; transiciones CSS mínimas.
- Touch targets mínimo **48×48px** en modo niño (WCAG 2.5.5).

---

## SECCIÓN 9 — PREPARACIÓN PARA FUTURAS VERSIONES

Arquitectura ** preparada pero no implementada ** en fase 1.

### 9.1 Sincronización cloud futura

#### Patrón: Repository + Sync Engine

```text
domain/repositories/IActivityRepository   ← interfaz existente
infrastructure/repositories/
  ├── LocalActivityRepository (Dexie)      ← v1
  └── RemoteActivityRepository (API)       ← v2+

infrastructure/sync/
  ├── SyncEngine.ts                        ← stub / interface
  ├── SyncQueue.ts                         ← cola operaciones offline
  └── ConflictResolver.ts                  ← last-write-wins → CRDT futuro
```

#### Campos sync-ready en entidades (añadir en v1)

| Campo | Propósito |
|-------|-----------|
| `updatedAt` | Ordenamiento sync |
| `deletedAt` | Soft delete para tombstones |
| `syncStatus` | `local \| synced \| pending` (opcional v1, útil v2) |
| `remoteId` | ID servidor (null en v1) |

#### Estrategia sync recomendada (fase 2+)

- **Offline-first:** local es fuente de verdad inmediata; sync en background.
- **Cola de operaciones:** mutaciones locales encoladas si no hay red.
- **Conflictos:** last-write-wins por `updatedAt` inicialmente; excepciones manuales en UI adulto.

### 9.2 Backend futuro

#### API REST/GraphQL preparada por capas

```text
infrastructure/api/
  ├── client.ts          → fetch wrapper, base URL config
  ├── endpoints/         → profiles, activities, sync
  └── dto/               → mappers DTO ↔ Domain entities
```

**No crear endpoints en v1.** Config placeholder:

```text
config/app.config.ts → features: { cloudSync: false, auth: false }
```

Backend candidato fase 2: **Supabase** (Postgres + Auth + Storage fotos) o API custom Node/Bun.

### 9.3 Múltiples dispositivos

| Componente | Preparación v1 |
|------------|----------------|
| IDs | UUID v4 (no auto-increment) |
| Timestamps | ISO 8601 UTC en `updatedAt` |
| Fotos | URIs locales; interfaz `IPhotoStorage` con implementación cloud futura |
| Cuenta familia | Entidad `FamilyAccount` reservada en docs, no en BD v1 |
| Emparejamiento | Flujo QR/código reservado en router comentado |

### 9.4 Notificaciones push

```text
infrastructure/notifications/
  ├── local-notification.service.ts   ← v2: @capacitor/local-notifications
  └── push-notification.service.ts    ← stub v3: FCM/APNs
```

**v1:** sin notificaciones.  
**v2:** recordatorios locales basados en `startTimeMinutes` de instancias del día.  
**v3:** push remoto vía backend.

Campos futuros en template: `reminderMinutesBefore: number | null`.

### 9.5 Suscripciones y monetización

```text
infrastructure/billing/
  └── subscription.service.ts   ← stub interface

domain/enums/PlanTier.ts        ← free | family (futuro)

config/features.config.ts       → feature flags por plan
```

**v1:** todo desbloqueado (free completo). Flags preparados para limitar perfiles o sync cloud en freemium futuro.

### 9.6 Feature flags centralizados

```typescript
// config/app.config.ts (conceptual, no implementar aún)
features: {
  cloudSync: false,
  pushNotifications: false,
  subscriptions: false,
  weeklyCalendarView: true,
  customRecurrence: true,
  exportBackup: false,
}
```

Permite activar iteraciones del roadmap funcional sin redeploy estructural.

---

## SECCIÓN 10 — DECISIONES TÉCNICAS

### 10.1 Resumen: qué usar

| Área | Decisión |
|------|----------|
| Framework | React 19 + TypeScript strict + Vite |
| Mobile | Capacitor 7 |
| Estilos | TailwindCSS 4 |
| Routing | React Router 7 |
| Estado global | **Zustand** |
| Estado contextual estático | React Context (theme, device, a11y) |
| Persistencia | **Dexie.js** + Capacitor Preferences + Filesystem |
| Formularios | **React Hook Form + Zod** |
| Fechas | **date-fns** |
| Iconos UI | **Lucide React** |
| Animaciones | **Framer Motion** (con reduce motion) |
| Tests | Vitest + Testing Library + fake-indexeddb |
| Arquitectura | Feature-Based Clean Architecture + Repository Pattern |
| IDs | uuid v4 |
| PIN | Web Crypto SHA-256 hash |

### 10.2 Qué evitar

| Tecnología | Motivo |
|------------|--------|
| Redux Toolkit | Overhead innecesario sin API remota en v1 |
| MongoDB / Firebase directo | Dependencia cloud contradice offline-first v1 |
| localStorage para entidades | Límites tamaño, sin índices, sin queries |
| Moment.js | Legacy, pesado |
| Styled-components / Emotion | Tailwind ya cubierto; evitar duplicar sistemas CSS |
| Expo / React Native | Stack acordado es Capacitor + React web |
| Lógica de negocio en componentes | Impide testear recurrencias y progreso |
| Almacenar PIN en plaintext | Riesgo seguridad modo adulto |
| Fotos en base64 en IndexedDB | Degrada rendimiento |
| Bibliotecas de sync prematuras (RxDB) | Complejidad antes de necesitarlas |
| CSS-in-JS runtime | Impacto rendimiento WebView móvil |

### 10.3 Riesgos técnicos

| ID | Riesgo | Prob. | Impacto | Mitigación |
|----|--------|:-----:|:-------:|------------|
| T1 | IndexedDB limits en iOS WebView | Media | Alto | Rolling window instancias; no almacenar blobs; monitorear tamaño BD |
| T2 | Motor recurrencias con bugs | Media | Alto | Servicio aislado + >30 casos Vitest; no mezclar con UI |
| T3 | Rendimiento agenda con muchas instancias | Baja | Medio | Índices compuestos; paginación por día (no cargar mes entero) |
| T4 | Framer Motion en dispositivos antiguos | Media | Medio | Flag reduceMotion; fallback CSS |
| T5 | Capacitor plugin drift | Baja | Medio | Pin versions; documentar setup android/ios |
| T6 | Dexie → SQLite migración dolorosa | Baja | Medio | Repository Pattern desde día 1 |
| T7 | Sesión adulto filtrada | Media | Alto | Expiración automática; no persistir adultSessionActive |
| T8 | Pérdida datos dispositivo | Alta | Alto | Comunicar en UX; export JSON en fase 2; cloud backup fase 2 |
| T9 | Complejidad carpetas para 1 dev | Media | Medio | Features estrictos; README por módulo; Cursor rules |
| T10 | Web vs native behavior gaps | Media | Medio | Test en dispositivo real frecuente; Capacitor plugins |

### 10.4 Recomendaciones operativas

1. **Inicializar repo** con TypeScript strict, ESLint, Prettier y alias `@/` → `src/`.
2. **Implementar primero** dominio + Dexie + motor recurrencias + tests antes de UI elaborada.
3. **Usar `dexie-react-hooks`** (`useLiveQuery`) para reactividad sin duplicar estado.
4. **Definir ADRs** (Architecture Decision Records) en `docs/adr/` para decisiones mayores.
5. **Probar en dispositivo real** desde iteración 1 (no solo browser).
6. **Feature flags** para activar anticipación, timer y progreso semanal según roadmap MoSCoW.
7. **No abstraer prematuramente** sync/billing; solo interfaces y stubs.
8. **Mantener bundle pequeño:** importaciones nombradas de date-fns y lucide; analizar con `vite-bundle-visualizer`.
9. **Accesibilidad desde inicio:** roles ARIA en ActivityCard, labels en pictogramas, contraste tokens Tailwind.
10. **Cursor rules:** documentar convenciones de capas e imports para asistencia IA coherente.

### 10.5 Orden de implementación técnico

```text
Fase A — Cimientos
├── Scaffold Vite + React + TS + Tailwind + Capacitor
├── Domain entities + enums + Zod schemas
├── Dexie schema v1 + repositories
├── RecurrenceService + ActivityStateService + tests
└── Zustand stores + boot flow

Fase B — MVP (Iteración funcional 1)
├── Onboarding + Profiles
├── ChildLayout + HomeAgenda + complete activity
├── AdultLayout + PinGate + Activity CRUD
├── RoutineLibrary apply
└── Celebration overlay

Fase C — Iteración 2
├── AnticipationView + VisualTimer
├── Calendar navigation
├── Progress daily
└── useDeviceType + tablet layouts

Fase D — Iteración 3
├── Weekly calendar (tablet)
├── Custom recurrence
├── Weekly progress
├── Local notifications (optional)
└── Performance hardening
```

### 10.6 Criterios de aceptación técnica (Definition of Done)

- [ ] Funciona en browser (dev) y en al menos 1 dispositivo Android o iOS via Capacitor.
- [ ] Modo avión: CRUD completo, agenda, completar, progreso operativos.
- [ ] Motor recurrencias cubierto ≥90% branches en Vitest.
- [ ] Sin imports de infrastructure en domain/.
- [ ] PIN nunca almacenado en claro.
- [ ] Fotos en Filesystem; BD solo URIs.
- [ ] Lighthouse/accessibility audit sin errores críticos en pantallas modo niño.
- [ ] Tiempo carga agenda día < 1s en dispositivo mid-range.

---

## Anexos

### A. ADRs previstos

| ID | Título |
|----|--------|
| ADR-001 | Feature-Based Clean Architecture |
| ADR-002 | Dexie sobre SQLite para v1 |
| ADR-003 | Zustand sobre Redux |
| ADR-004 | ActivityTemplate + ActivityInstance |
| ADR-005 | Rolling window 90 días instancias |
| ADR-006 | date-fns y convención almacenamiento temporal |

### B. Trazabilidad con alcance funcional

| Módulo funcional | Feature / Infra |
|------------------|-----------------|
| M1 Perfiles | `features/profiles/` |
| M2 Onboarding | `features/onboarding/` |
| M3 Agenda | `features/agenda/` |
| M4–M7 Actividades/Recurrencias | `features/activities/`, `domain/services/recurrence.service.ts` |
| M8 Modo niño/adulto | `features/child-mode/`, `features/adult-mode/` |
| M9 Anticipación | `features/agenda/` + `anticipation.service.ts` |
| M10 Pictogramas | `config/`, `assets/pictograms/` |
| Módulo 9 Temporizador | `features/timer/` |
| Módulo 10 Refuerzo | `components/feedback/CelebrationOverlay` |
| Módulo 11 Progreso | `features/progress/` |
| Módulo 14 Responsive | `hooks/useDeviceType.ts`, layouts |

### C. Control de cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2026-06-03 | Documento inicial de arquitectura técnica |

---

*Este documento define la arquitectura técnica de PICTORGANIZER v1. Cualquier desviación debe registrarse como ADR. El desarrollo funcional no debe iniciarse sin alinear decisiones abiertas del [alcance funcional](./ALCANCE-FUNCIONAL-INICIAL.md) §10 con las resoluciones aquí indicadas.*
