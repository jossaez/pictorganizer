# PICTORGANIZER — Modelo de Dominio

**Versión:** 1.0  
**Fecha:** 3 de junio de 2026  
**Estado:** Aprobado para implementación Dexie / Repositories  
**Referencias:** [ALCANCE-FUNCIONAL-INICIAL.md](./ALCANCE-FUNCIONAL-INICIAL.md) · [ARQUITECTURA-TECNICA.md](./ARQUITECTURA-TECNICA.md)

---

## Convenciones del documento

| Símbolo | Significado |
|---------|-------------|
| **O** | Campo obligatorio |
| **Opc** | Campo opcional |
| **Calc** | Calculado en runtime, no persistido |
| **VO** | Value Object (embebido, sin identidad propia) |
| **Cat** | Catálogo de sistema (read-only, seed) |
| **Sync** | Campo preparado para sincronización cloud futura |

**Tipos base:**

| Tipo | Formato |
|------|---------|
| `UUID` | string UUID v4 |
| `ISODate` | `YYYY-MM-DD` |
| `ISODateTime` | ISO 8601 UTC |
| `HexColor` | `#RRGGBB` |
| `MinutesFromMidnight` | entero 0–1439 |
| `Slug` | string kebab-case estable |

---

## SECCIÓN 1 — IDENTIFICAR ENTIDADES

### 1.1 Inventario completo

| Entidad | ¿Necesaria? | Tipo | Persistencia v1 | Justificación |
|---------|:-----------:|------|-----------------|---------------|
| **Profile** | ✅ Sí | Entidad raíz | Dexie | Núcleo del producto; agenda por persona |
| **Category** | ✅ Sí | Catálogo | Seed / JSON estático | Clasificación visual y organización |
| **Pictogram** | ✅ Sí | Catálogo | Seed / JSON estático | Soporte visual de actividades |
| **Avatar** | ✅ Sí | Catálogo | Seed / assets | Alternativa a foto en perfil |
| **RoutineTemplate** | ✅ Sí | Catálogo | Seed / JSON estático | Biblioteca mañana/noche del sistema |
| **Routine** | ✅ Sí | Entidad | Dexie | Agrupación de actividades por perfil (aplicada o custom) |
| **ActivityTemplate** | ✅ Sí | Entidad | Dexie | Definición maestra con recurrencia |
| **ActivityInstance** | ✅ Sí | Entidad | Dexie | Ocurrencia diaria; unidad de agenda y progreso |
| **AppSettings** | ✅ Sí | Singleton | Capacitor Preferences | Config global de la app |
| **ProfileSettings** | ✅ Sí | Entidad 1:1 | Dexie (embebida o tabla) | Preferencias por perfil (modo niño) |
| **Achievement** | ❌ No | — | — | Excluido: sin gamificación competitiva en alcance v1 |
| **UserSession** | ❌ No (como entidad) | — | Zustand (efímero) | Sesión adulto es runtime; solo `adultSessionExpiresAt` en settings |
| **UserAccount** | ❌ No | — | — | Sin autenticación en v1 |
| **ProgressSnapshot** | ⚠ Opcional | Cache | No en v1 | Progreso se **calcula** desde instancias |
| **PhotoAsset** | ⚠ Como VO | Value Object | Filesystem + URI | No es entidad con tabla propia |
| **RecurrenceRule** | ⚠ Como VO | Value Object | Embebido en template | Sin identidad independiente |
| **ActivityVisual** | ⚠ Como VO | Value Object | Embebido | Pictograma o foto |
| **ReinforcementConfig** | ⚠ Como VO | Value Object | Config estático | Refuerzo positivo no se persiste como log |
| **SyncMetadata** | ⚠ Como mixin | Campos embebidos | En cada entidad syncable | Preparación v2, no entidad separada v1 |

### 1.2 Modo niño y modo adulto — ¿entidades?

**No son entidades de dominio.** Son **modos de acceso** modelados como:

| Concepto | Modelado como |
|----------|---------------|
| Modo niño (permisos UI) | `UserMode = 'child'` en sesión runtime (Zustand) |
| Modo adulto (permisos UI) | `UserMode = 'adult'` + validación PIN |
| PIN adulto | `AppSettings.adultPinHash` |
| Expiración sesión adulto | `AppSettings.adultSessionExpiresAt` + runtime Zustand |
| Preferencias visuales modo niño | `ProfileSettings` (por perfil) |
| Restricciones accesibilidad | `AppSettings.reduceMotion`, `AppSettings.largeText` |

### 1.3 Resumen de entidades persistidas v1

```text
ENTIDADES DEXIE (datos mutables del usuario)
  Profile
  ProfileSettings      (1:1 con Profile)
  Routine              (agrupación por perfil)
  ActivityTemplate
  ActivityInstance

CATÁLOGOS (seed, read-only)
  Category
  Pictogram
  Avatar
  RoutineTemplate

SINGLETON (Capacitor Preferences)
  AppSettings

FILESYSTEM (binarios)
  PhotoAsset → referenciado por URI en Profile / ActivityVisual

RUNTIME (no persistido como entidad)
  UserSession / UserMode
  ReinforcementEvent (overlay efímero al completar)
  ProgressDaily / ProgressWeekly (calculados)
```

---

## SECCIÓN 2 — RELACIONES

### 2.1 Diagrama relacional completo

```text
Category (Cat) ──────< Pictogram (Cat)
     │
     └──────< RoutineTemplate (Cat) ──contiene──> RoutineStep (VO)

Profile ──────< ProfileSettings (1:1)
   │
   ├──────< Routine (0..*)
   │            │
   │            └──────< ActivityTemplate (0..*)
   │
   ├──────< ActivityTemplate (0..*)  ← también sueltas sin Routine
   │
   └──────< ActivityInstance (0..*)

ActivityTemplate ──────< ActivityInstance (0..*)
        │
        └── embeds ──> RecurrenceRule (VO)
        └── embeds ──> ActivityVisual (VO)

RoutineTemplate ──applies_to──> Profile  (operación de dominio, no FK permanente)
              └──generates──> ActivityTemplate[] + Routine (opcional)

AppSettings ──references──> Profile.activeProfileId (nullable)

Category ──referenced_by──> ActivityTemplate.categoryId
Category ──referenced_by──> ActivityInstance.categoryId (snapshot)

Pictogram ──referenced_by──> ActivityVisual (when type=pictogram)
PhotoAsset (FS) ──referenced_by──> ActivityVisual (when type=photo)
PhotoAsset (FS) ──referenced_by──> Profile.photoUri
Avatar (Cat) ──referenced_by──> Profile.avatarId
```

### 2.2 Cardinalidades explicadas

#### Profile → Routine (1 : N)

Un perfil puede tener **cero o muchas rutinas** propias.

- Rutina creada al aplicar «Rutina de mañana» desde biblioteca.
- Rutina custom creada por el cuidador («Mi tarde de martes»).
- Un perfil sin rutinas explícitas puede tener actividades sueltas.

#### Routine → ActivityTemplate (1 : N)

Una rutina **agrupa** plantillas de actividades relacionadas.

- `ActivityTemplate.routineId` apunta a la rutina (nullable si actividad suelta).
- Al eliminar rutina: decidir cascada (ver §12) — por defecto desvincular templates, no borrar.

#### RoutineTemplate → Profile (aplicación, no ownership)

`RoutineTemplate` es catálogo global. **No pertenece** a un perfil.

Al **aplicar** una plantilla del sistema:

1. Se crea (opcionalmente) un `Routine` en el perfil.
2. Se crean N `ActivityTemplate` con `routineId` y `sourceRoutineTemplateId`.
3. El motor de recurrencias genera `ActivityInstance`.

#### ActivityTemplate → ActivityInstance (1 : N)

Un template recurrente **genera** muchas instancias (ventana rolling ~90 días).

- Actividad única (`recurrence.type = once`): 1 template → 1 instance.
- Actividad suelta sin recurrencia futura: template con `once` o instance con `templateId = null`.

#### Profile → ActivityInstance (1 : N)

Toda instancia pertenece a **exactamente un perfil**, incluso si tiene template.

- Índice de consulta principal: `(profileId, date)`.

#### Category, Pictogram (catálogo → referencia)

Relación lógica, no FK estricta en Dexie.

- Templates e instances guardan `categoryId` y snapshot visual.
- Integridad validada en capa de dominio al crear/editar.

### 2.3 Relaciones que NO existen en v1

| Relación | Motivo |
|----------|--------|
| Profile → Achievement | No hay logros |
| Profile → UserAccount | Sin cuentas |
| ActivityInstance → CompletionRecord (tabla) | Completado embebido en instance |
| RoutineTemplate → Profile (FK) | Plantillas son globales |

---

## SECCIÓN 3 — PROFILE

Representa a una persona de la familia con agenda, rutinas y progreso independientes.

### 3.1 Campos

| Campo | Tipo | Oblig | Descripción |
|-------|------|:-----:|-------------|
| `id` | UUID | **O** | Identificador único |
| `name` | string | **O** | Nombre visible (1–50 caracteres) |
| `color` | HexColor | **O** | Color identidad del perfil en UI |
| `photoUri` | string | Opc | Ruta en Filesystem a foto personalizada |
| `avatarId` | Slug | Opc | ID avatar predefinido del catálogo |
| `birthDate` | ISODate | Opc | Fecha nacimiento; futura personalización por edad |
| `sortOrder` | number | **O** | Orden en selector de perfiles (default 0) |
| `isActive` | boolean | **O** | Soft delete; default `true` |
| `createdAt` | ISODateTime | **O** | Auditoría |
| `updatedAt` | ISODateTime | **O** | Auditoría + sync futuro |
| `deletedAt` | ISODateTime | Opc | Sync: tombstone |
| `remoteId` | string | Opc | Sync: ID servidor; null en v1 |
| `syncStatus` | SyncStatus | **O** | `local` \| `pending` \| `synced`; default `local` |

### 3.2 Reglas de negocio

| Regla | Detalle |
|-------|---------|
| Visual identidad | Debe existir **photoUri XOR avatarId** (al menos uno); si ambos null → avatar por defecto del sistema |
| Nombre único | Recomendado único por dispositivo; no enforced en v1 |
| Eliminación | Soft delete (`isActive=false`, `deletedAt`); cascade lógico a templates/instances del perfil |
| birthDate | Opcional v1; no afecta lógica de agenda en fase 1 |

### 3.3 ProfileSettings (1:1 con Profile)

Preferencias del perfil orientadas al **modo niño** y UX individual.

| Campo | Tipo | Oblig | Descripción |
|-------|------|:-----:|-------------|
| `profileId` | UUID | **O** | FK → Profile (PK) |
| `showTimer` | boolean | **O** | Mostrar temporizador visual; default true |
| `showAnticipation` | boolean | **O** | Mostrar bloque AHORA/DESPUÉS; default true |
| `celebrationStyle` | `'stars' \| 'faces' \| 'mixed'` | **O** | Estilo refuerzo positivo |
| `updatedAt` | ISODateTime | **O** | |

---

## SECCIÓN 4 — CATEGORY

Catálogo de clasificación para actividades, rutinas y pictogramas.

### 4.1 Finalidad

- Agrupar visualmente actividades en agenda y estadísticas.
- Filtrar en biblioteca de pictogramas.
- Asignar color e icono de interfaz (Lucide) coherente.
- Preparar i18n futuro vía `labelKey`.

### 4.2 Estructura

| Campo | Tipo | Oblig | Descripción |
|-------|------|:-----:|-------------|
| `id` | Slug | **O** | Identificador estable |
| `labelKey` | string | **O** | Clave i18n (`category.hygiene`) |
| `label` | string | **O** | Texto visible español v1 |
| `color` | HexColor | **O** | Color de acento de categoría |
| `iconId` | string | **O** | Identificador icono UI (Lucide) |
| `sortOrder` | number | **O** | Orden en listados |

### 4.3 Catálogo inicial v1

| id | label | Finalidad |
|----|-------|-----------|
| `hygiene` | Higiene | Lavarse dientes, ducha, vestirse |
| `food` | Alimentación | Desayuno, comida, merienda, cena |
| `school` | Colegio | Clase, deberes, mochila |
| `work` | Trabajo | Actividades laborales (adolescentes/adultos) |
| `health` | Salud | Médico, farmacia, terapia doméstica |
| `shopping` | Compras | Supermercado, recados |
| `transport` | Transporte | Autobús, coche, caminar |
| `leisure` | Ocio | Juego, parque, pantalla |
| `rest` | Descanso | Siesta, relax, dormir |
| `home` | Hogar | Tareas domésticas ligadas al hogar |
| `other` | Otros | Fallback |

**Persistencia:** JSON seed en `infrastructure/database/seeds/categories.json`. No editable por usuario en v1.

---

## SECCIÓN 5 — ROUTINE

Agrupación lógica de actividades **perteneciente a un perfil**. Distinta de `RoutineTemplate` (biblioteca del sistema).

### 5.1 Finalidad

- Representar «Rutina de mañana de Lucas» aplicada desde biblioteca.
- Permitir al cuidador gestionar un bloque de actividades como unidad.
- Facilitar re-aplicar, duplicar o desactivar un conjunto.

### 5.2 Campos

| Campo | Tipo | Oblig | Descripción |
|-------|------|:-----:|-------------|
| `id` | UUID | **O** | Identificador |
| `profileId` | UUID | **O** | FK → Profile |
| `name` | string | **O** | Ej. «Rutina de mañana», «Mi rutina escolar» |
| `description` | string | Opc | Texto ayuda para adulto |
| `categoryId` | Slug | Opc | Categoría dominante (heredada de template origen) |
| `sourceRoutineTemplateId` | Slug | Opc | FK lógica → RoutineTemplate si viene de biblioteca |
| `iconId` | string | Opc | Icono en listado de rutinas |
| `color` | HexColor | Opc | Override color; default hereda de perfil |
| `isActive` | boolean | **O** | Rutina activa; default true |
| `defaultAnchorTimeMinutes` | MinutesFromMidnight | Opc | Hora ancla al aplicar (ej. despertar 07:00) |
| `sortOrder` | number | **O** | Orden entre rutinas del perfil |
| `createdAt` | ISODateTime | **O** | |
| `updatedAt` | ISODateTime | **O** | |
| `deletedAt` | ISODateTime | Opc | Sync |
| `remoteId` | string | Opc | Sync |
| `syncStatus` | SyncStatus | **O** | |

### 5.3 Ejemplo: Rutina de mañana aplicada

```text
Routine {
  id: "uuid-r1"
  profileId: "uuid-lucas"
  name: "Rutina de mañana"
  sourceRoutineTemplateId: "routine-morning"
  defaultAnchorTimeMinutes: 420   // 07:00
}

ActivityTemplate[] (routineId = uuid-r1):
  07:00 Despertarse
  07:15 Vestirse
  07:45 Desayunar
  08:15 Lavarse dientes
```

### 5.4 RoutineTemplate (catálogo — no confundir con Routine)

Plantilla **global** del sistema para onboarding y biblioteca.

| Campo | Tipo | Oblig | Descripción |
|-------|------|:-----:|-------------|
| `id` | Slug | **O** | `routine-morning`, `routine-night` |
| `name` | string | **O** | Nombre visible |
| `description` | string | **O** | |
| `categoryId` | Slug | **O** | Categoría principal |
| `iconId` | string | **O** | |
| `steps` | RoutineStep[] | **O** | Pasos ordenados (VO) |
| `isBuiltIn` | boolean | **O** | Siempre true en v1 |
| `sortOrder` | number | **O** | |

#### RoutineStep (Value Object)

| Campo | Tipo | Oblig | Descripción |
|-------|------|:-----:|-------------|
| `title` | string | **O** | Título del paso |
| `pictogramId` | Slug | **O** | Pictograma sugerido |
| `categoryId` | Slug | **O** | |
| `offsetMinutes` | number | **O** | Minutos desde ancla de rutina |
| `durationMinutes` | number | Opc | Duración sugerida |

**Catálogo inicial:**

| id | name | Pasos |
|----|------|-------|
| `routine-morning` | Rutina de mañana | Despertarse, Vestirse, Desayunar, Lavarse dientes |
| `routine-night` | Rutina de noche | Cena, Ducha, Pijama, Dormir |

---

## SECCIÓN 6 — ACTIVITY TEMPLATE

Entidad central: **definición** de una actividad planificada, única o recurrente.

### 6.1 Campos

| Campo | Tipo | Oblig | Descripción |
|-------|------|:-----:|-------------|
| `id` | UUID | **O** | |
| `profileId` | UUID | **O** | FK → Profile |
| `routineId` | UUID | Opc | FK → Routine (nullable = actividad suelta) |
| `title` | string | **O** | 1–80 caracteres |
| `description` | string | Opc | Texto largo |
| `categoryId` | Slug | **O** | FK lógica → Category |
| `startTimeMinutes` | MinutesFromMidnight | **O** | Hora inicio habitual |
| `endTimeMinutes` | MinutesFromMidnight | Opc | Hora fin; recomendado |
| `visual` | ActivityVisual | **O** | Pictograma o foto |
| `recurrence` | RecurrenceRule | **O** | Regla de repetición |
| `visibility` | ActivityVisibility | **O** | Ver §6.2 |
| `reminderMinutesBefore` | number | Opc | Futuro: notificación local; null en v1 |
| `sortOrder` | number | **O** | Orden relativo dentro del día/rutina |
| `isActive` | boolean | **O** | Soft delete; default true |
| `sourceRoutineTemplateId` | Slug | Opc | Trazabilidad si vino de biblioteca |
| `createdAt` | ISODateTime | **O** | |
| `updatedAt` | ISODateTime | **O** | |
| `deletedAt` | ISODateTime | Opc | Sync |
| `remoteId` | string | Opc | Sync |
| `syncStatus` | SyncStatus | **O** | |

### 6.2 ActivityVisibility

| Valor | Descripción |
|-------|-------------|
| `visible` | Aparece en agenda modo niño y adulto (default) |
| `adult_only` | Solo visible/gestionable en modo adulto (preparación v2) |
| `hidden` | Desactivada temporalmente sin borrar serie |

En v1, `visible` es el caso práctico total. Los otros valores preparan flexibilidad.

### 6.3 ActivityVisual (Value Object)

| Campo | Tipo | Oblig | Descripción |
|-------|------|:-----:|-------------|
| `type` | `'pictogram' \| 'photo'` | **O** | Discriminador |
| `pictogramId` | Slug | Cond | Obligatorio si type=pictogram |
| `photoUri` | string | Cond | Obligatorio si type=photo; ruta Filesystem |
| `fallbackPictogramId` | Slug | Opc | Si photoUri inválida, usar este pictograma |

**Regla:** exactamente uno de pictogramId o photoUri activo según type.

### 6.4 Responsabilidades

- Fuente de verdad para actividades recurrentes.
- Al editar «todos los días»: se modifica template y se regeneran instancias futuras no excepcionales.
- Al editar «solo este día»: se modifica instance; template no cambia; `isException=true` en instance.

---

## SECCIÓN 7 — ACTIVITY INSTANCE

Ocurrencia concreta en un día. **Unidad operativa** de agenda, completado, progreso y anticipación.

### 7.1 Campos

| Campo | Tipo | Oblig | Descripción |
|-------|------|:-----:|-------------|
| `id` | UUID | **O** | |
| `templateId` | UUID | Opc | FK → ActivityTemplate; null si actividad única orphan |
| `profileId` | UUID | **O** | FK → Profile |
| `routineId` | UUID | Opc | Denormalizado desde template para queries |
| `date` | ISODate | **O** | Día calendario de la ocurrencia |
| `title` | string | **O** | Snapshot |
| `description` | string | Opc | Snapshot |
| `categoryId` | Slug | **O** | Snapshot |
| `startTimeMinutes` | MinutesFromMidnight | **O** | Snapshot |
| `endTimeMinutes` | MinutesFromMidnight | Opc | Snapshot |
| `visual` | ActivityVisual | **O** | Snapshot |
| `visibility` | ActivityVisibility | **O** | Snapshot |
| `status` | ActivityStatus | **O** | Ver §7.2 |
| `completedAt` | ISODateTime | Opc | Cuándo se marcó completada |
| `skippedAt` | ISODateTime | Opc | Cuándo se saltó (solo adulto en v1) |
| `skippedBy` | `'child' \| 'adult'` | Opc | Quién registró el skip |
| `isException` | boolean | **O** | Modificada individualmente vs serie |
| `exceptionNote` | string | Opc | Nota del cuidador |
| `sortOrder` | number | **O** | Orden dentro del día |
| `generatedAt` | ISODateTime | **O** | Cuándo el motor creó esta instancia |
| `createdAt` | ISODateTime | **O** | |
| `updatedAt` | ISODateTime | **O** | |
| `deletedAt` | ISODateTime | Opc | Sync |
| `remoteId` | string | Opc | Sync |
| `syncStatus` | SyncStatus | **O** | |

### 7.2 ActivityStatus

| Estado | Persistido | Descripción |
|--------|:----------:|-------------|
| `pending` | ✅ | Aún no iniciada (antes de startTime o sin marcar) |
| `in_progress` | Calc* | Entre startTime y endTime; calculado por ActivityStateService |
| `completed` | ✅ | Usuario marcó completada; `completedAt` obligatorio |
| `skipped` | ✅ | Saltada deliberadamente; `skippedAt` obligatorio |
| `missed` | Calc* | Pasó endTime (o fin de día) sin completar ni skip |

\* **Decisión de persistencia:** `in_progress` y `missed` pueden calcularse en runtime. Opcionalmente materializar `missed` al cierre del día (job local) para progreso histórico estable.

**Transiciones permitidas:**

```text
pending ──complete──▶ completed
pending ──skip──▶ skipped          (adulto v1; niño opcional v2)
completed ──undo──▶ pending        (solo modo adulto)
skipped ──undo──▶ pending          (solo modo adulto)
pending/in_progress ──time──▶ missed   (automático)
```

### 7.3 Completar vs saltar

| Acción | Actor v1 | Campos afectados |
|--------|--------|------------------|
| Completar | Modo niño y adulto | `status=completed`, `completedAt=now()` |
| Saltar | Solo modo adulto | `status=skipped`, `skippedAt=now()`, `skippedBy=adult` |
| Deshacer | Solo modo adulto | Reset a `pending`; limpiar completedAt/skippedAt |

### 7.4 Regla de snapshot

Una vez generada, la instance **copia** campos del template. Cambios futuros al template **no retroactivos** sobre instancias pasadas ni excepcionales.

---

## SECCIÓN 8 — RECURRENCIAS

Modeladas como **Value Object embebido** en `ActivityTemplate.recurrence`.

### 8.1 RecurrenceRule — estructura completa

| Campo | Tipo | Oblig | Descripción |
|-------|------|:-----:|-------------|
| `type` | RecurrenceType | **O** | Discriminador |
| `startDate` | ISODate | **O** | Primera fecha posible |
| `endDate` | ISODate | Opc | Fin de serie; null = indefinida |
| `daysOfWeek` | number[] | Cond | 0=Dom … 6=Sáb; ver reglas por tipo |
| `interval` | number | Opc | Cada N períodos; default 1 (futuro v2) |
| `occurrenceCount` | number | Opc | Máx ocurrencias; alternativa a endDate (v2) |

### 8.2 RecurrenceType — comportamiento

| type | daysOfWeek | Generación |
|------|------------|------------|
| `once` | Ignorado | Una sola instance en `startDate` |
| `daily` | Ignorado | Todos los días desde startDate hasta endDate |
| `weekdays` | `[1,2,3,4,5]` implícito | Lun–Vie |
| `weekly` | `[anchorDay]` | Mismo día de semana que `startDate` |
| `custom` | **O** explícito | Solo días listados |

### 8.3 Ejemplos

```text
Desayuno diario:
  { type: 'daily', startDate: '2026-06-01', endDate: null }

Colegio laborables:
  { type: 'weekdays', startDate: '2026-09-01', endDate: '2027-06-30' }

Natación martes y jueves:
  { type: 'custom', startDate: '2026-06-01', daysOfWeek: [2, 4] }

Cita médica única:
  { type: 'once', startDate: '2026-06-15' }
```

### 8.4 Reglas del motor de generación

| Regla | Detalle |
|-------|---------|
| Ventana rolling | Generar instancias hasta `today + 90 días` |
| Extensión | Si instancias futuras < 30 días → extender ventana |
| Excepciones | Instancias con `isException=true` no se sobrescriben al regenerar |
| Pasado | Instancias con `date < today` no se regeneran ni borran |
| Duplicados | Un template no genera dos instances mismo `(profileId, date, templateId)` |
| Festivos | Ignorados en v1; laborables = Lun–Vie calendario |

---

## SECCIÓN 9 — SETTINGS

### 9.1 AppSettings (singleton global)

Persistido en **Capacitor Preferences**. Una sola fila lógica por instalación.

| Campo | Tipo | Oblig | Descripción |
|-------|------|:-----:|-------------|
| `id` | `'app'` | **O** | Constante singleton |
| `onboardingCompleted` | boolean | **O** | Wizard finalizado |
| `onboardingStep` | number | Opc | Paso actual si interrumpido |
| `activeProfileId` | UUID | Opc | Último perfil seleccionado |
| `adultPinHash` | string | Opc | Hash SHA-256; null = PIN no configurado |
| `adultPinConfigured` | boolean | **O** | Derivado; facilita UI |
| `preferredDeviceLayout` | `'phone' \| 'tablet' \| 'auto'` | **O** | Default `auto` |
| `reduceMotion` | boolean | **O** | Accesibilidad; default false |
| `largeText` | boolean | **O** | Accesibilidad; default false |
| `highContrast` | boolean | **O** | Accesibilidad; default false |
| `schemaVersion` | number | **O** | Versión migración Dexie |
| `firstLaunchAt` | ISODateTime | **O** | |
| `lastOpenedAt` | ISODateTime | Opc | |
| `defaultCelebrationMessages` | string[] | Opc | Override mensajes refuerzo |
| `createdAt` | ISODateTime | **O** | |
| `updatedAt` | ISODateTime | **O** | |

**Nota:** `adultSessionExpiresAt` **no** se persiste en AppSettings por seguridad. Vive solo en Zustand runtime.

### 9.2 ProfileSettings (por perfil)

| Campo | Tipo | Oblig | Descripción |
|-------|------|:-----:|-------------|
| `profileId` | UUID | **O** | PK / FK Profile |
| `showTimer` | boolean | **O** | |
| `showAnticipation` | boolean | **O** | |
| `celebrationStyle` | enum | **O** | |
| `timerStyle` | `'bar' \| 'clock'` | **O** | Estilo temporizador |
| `updatedAt` | ISODateTime | **O** | |

### 9.3 Pictogram y Avatar (catálogos)

#### Pictogram

| Campo | Tipo | Oblig |
|-------|------|:-----:|
| `id` | Slug | **O** |
| `categoryId` | Slug | **O** |
| `label` | string | **O** |
| `assetPath` | string | **O** |
| `keywords` | string[] | Opc |
| `sortOrder` | number | **O** |

#### Avatar

| Campo | Tipo | Oblig |
|-------|------|:-----:|
| `id` | Slug | **O** |
| `label` | string | **O** |
| `assetPath` | string | **O** |
| `sortOrder` | number | **O** |

### 9.4 PhotoAsset (Value Object — Filesystem)

No tiene tabla Dexie. Metadatos opcionales si se necesita cleanup.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `uri` | string | Ruta relativa sandbox app |
| `ownerType` | `'profile' \| 'activity'` | |
| `ownerId` | UUID | |
| `mimeType` | string | `image/jpeg`, `image/png` |
| `createdAt` | ISODateTime | |

**Rutas convención:**

```text
/photos/profiles/{profileId}.{ext}
/photos/activities/{instanceId}.{ext}
```

### 9.5 Progreso (calculado, no entidad v1)

#### ProgressDaily (Calc)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `profileId` | UUID | |
| `date` | ISODate | |
| `total` | number | Instancias visibles del día |
| `completed` | number | status=completed |
| `skipped` | number | status=skipped |
| `pending` | number | status=pending |
| `missed` | number | status=missed |
| `percentage` | number | completed / total × 100 |

#### ProgressWeekly (Calc)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `profileId` | UUID | |
| `weekStart` | ISODate | Lunes de la semana |
| `days` | ProgressDaily[] | 7 elementos |
| `bestDay` | ISODate | Mayor porcentaje |
| `averagePercentage` | number | Media semanal |

---

## SECCIÓN 10 — FUTURA ESCALABILIDAD

### 10.1 Mixin Syncable (campos en entidades mutables)

Aplicar a: `Profile`, `Routine`, `ActivityTemplate`, `ActivityInstance`.

| Campo | Tipo | v1 | v2 uso |
|-------|------|:--:|--------|
| `createdAt` | ISODateTime | ✅ | Auditoría |
| `updatedAt` | ISODateTime | ✅ | Conflict resolution LWW |
| `deletedAt` | ISODateTime | ✅ | Soft delete / tombstone sync |
| `remoteId` | string | null | ID en backend |
| `syncStatus` | SyncStatus | `local` | Cola sync |
| `lastSyncedAt` | ISODateTime | null | Última sync exitosa |
| `revision` | number | 1 | Incrementa en cada mutación |

#### SyncStatus

| Valor | Significado |
|-------|-------------|
| `local` | Solo en dispositivo; nunca sincronizado |
| `pending` | Cambio pendiente de subir |
| `synced` | Consistente con servidor |
| `conflict` | Conflicto detectado (v2) |

### 10.2 Entidades reservadas v2 (no implementar)

| Entidad | Propósito futuro |
|---------|------------------|
| `FamilyAccount` | Cuenta familiar cloud |
| `DeviceRegistration` | Múltiples dispositivos |
| `SyncOperation` | Cola offline de mutaciones |
| `NotificationSchedule` | Recordatorios locales/push |
| `SubscriptionPlan` | Monetización |

### 10.3 Identificadores

- **Siempre UUID v4** generados en cliente.
- Nunca auto-increment.
- `remoteId` separado de `id` local para merge sin reescribir referencias.

---

## SECCIÓN 11 — DIAGRAMA TEXTUAL

```text
AppSettings (singleton)
└── activeProfileId ──▶ Profile

Profile
├── ProfileSettings (1:1)
├── Routine (0..*)
│   └── ActivityTemplate (0..*)
│         ├── embeds RecurrenceRule
│         ├── embeds ActivityVisual ──▶ Pictogram | PhotoAsset
│         └── generates ▶ ActivityInstance (0..*)
├── ActivityTemplate (0..*)     [sueltas: routineId = null]
│   └── generates ▶ ActivityInstance (0..*)
└── ActivityInstance (0..*)
      ├── snapshot fields (title, visual, times…)
      ├── status: pending | completed | skipped | (+ calc: in_progress, missed)
      └── ProgressDaily / ProgressWeekly (CALCULADO, no hijo persistido)

RoutineTemplate (Catálogo global — NO hijo de Profile)
├── RoutineStep (VO)
└── applies_to Profile ──generates──▶ Routine + ActivityTemplate[]

Category (Catálogo)
├── Pictogram (Catálogo)
└── referenced by ActivityTemplate, ActivityInstance, Routine

Avatar (Catálogo)
└── referenced by Profile.avatarId

PhotoAsset (Filesystem VO)
└── referenced by Profile.photoUri, ActivityVisual.photoUri

── Modos (NO entidades) ──
UserMode: child | adult        [Zustand runtime]
AdultSession                     [Zustand runtime + PIN en AppSettings]

── Excluido v1 ──
Achievement ✗
UserAccount ✗
UserSession (entidad) ✗
ProgressSnapshot (cache) ✗
```

---

## SECCIÓN 12 — RECOMENDACIONES

### 12.1 Errores de modelado a evitar

| Error | Por qué es problemático | Solución |
|-------|-------------------------|----------|
| Guardar solo ActivityTemplate sin Instance | No hay «día concreto» para completar | Siempre generar instances para fechas visibles |
| Una sola entidad Activity | Mezcla serie y ocurrencia; recurrencias imposibles | Separar Template + Instance |
| Instancias sin snapshot | Editar template altera historial y progreso | Copiar campos al generar |
| Fotos en base64 en IndexedDB | Rendimiento y límites iOS | Filesystem + URI |
| RoutineTemplate como hijo de Profile | Duplica biblioteca por perfil | Catálogo global + Routine por perfil |
| Persistir ProgressSnapshot en v1 | Datos derivados se desincronizan | Calcular desde instances |
| Achievement «por si acaso» | Scope creep; refuerzo ya cubierto | Config + evento UI efímero |
| UserSession como entidad Dexie | Sesión adulto debe expirar al cerrar app | Zustand + timestamp runtime |
| status in_progress persistido sin criterio | Estados obsoletos al día siguiente | Calcular en runtime o job de cierre |
| Regenerar instances borrando excepciones | Pierde ediciones «solo este día» | Respetar `isException=true` |

### 12.2 Entidades a evitar en v1

| Entidad | Motivo |
|---------|--------|
| Achievement / Badge / Points | Fuera de alcance; sin competición |
| UserAccount / AuthToken | Sin backend v1 |
| CompletionRecord (tabla separada) | Redundante con fields en instance |
| Comment / Note thread | Complejidad innecesaria |
| Attachment (genérico) | Solo fotos; modelar como PhotoAsset VO |
| Holiday / Calendar | Festivos en v2 |
| TherapistLink | Entorno clínico excluido |

### 12.3 Entidades a añadir en V2

| Entidad | Trigger |
|---------|---------|
| `FamilyAccount` | Sync cloud multi-dispositivo |
| `SyncOperation` | Cola offline → server |
| `NotificationSchedule` | Recordatorios push/locales |
| `CustomRoutineTemplate` | Usuario guarda rutina propia en biblioteca |
| `HolidayCalendar` | Laborables reales por país |
| `ActivityLog` | Auditoría detallada para cuidadores |
| `BackupExport` | Metadatos export/import JSON |
| `SubscriptionEntitlement` | Monetización |

### 12.4 Índices Dexie recomendados (referencia para implementación)

| Tabla | Índice | Query |
|-------|--------|-------|
| activityInstances | `[profileId+date]` | Agenda diaria |
| activityInstances | `[profileId+date+status]` | Progreso |
| activityInstances | `[templateId+date]` | Regeneración serie |
| activityTemplates | `[profileId+isActive]` | Listado adulto |
| activityTemplates | `[routineId]` | Actividades de rutina |
| routines | `[profileId+isActive]` | Rutinas del perfil |
| profiles | `sortOrder` | Selector perfiles |

### 12.5 Orden de implementación Repositories

```text
1. ProfileRepository + ProfileSettingsRepository
2. ActivityTemplateRepository
3. ActivityInstanceRepository (+ índices)
4. RoutineRepository
5. SettingsRepository (Preferences)
6. PhotoStorage (Filesystem)
7. CatalogRepository (read-only: categories, pictograms, routineTemplates)
```

---

## Anexo A — Enums consolidados

```text
ActivityStatus     = pending | in_progress | completed | skipped | missed
ActivityVisibility = visible | adult_only | hidden
RecurrenceType     = once | daily | weekdays | weekly | custom
SyncStatus         = local | pending | synced | conflict
UserMode           = child | adult                    (runtime only)
CelebrationStyle   = stars | faces | mixed
TimerStyle         = bar | clock
DeviceLayout       = phone | tablet | auto
SkippedBy          = child | adult
```

## Anexo B — Trazabilidad alcance funcional

| Módulo funcional | Entidades |
|------------------|-----------|
| M1 Perfiles | Profile, ProfileSettings, Avatar, PhotoAsset |
| M2 Onboarding | AppSettings, RoutineTemplate |
| M3 Biblioteca rutinas | RoutineTemplate, Routine, RoutineStep |
| M4–M7 Agenda/Actividades/Recurrencias | ActivityTemplate, ActivityInstance, RecurrenceRule, Category |
| M8 Anticipación | ActivityInstance (query día) |
| M9 Temporizador | ActivityInstance + Calc estado |
| M10 Refuerzo | ReinforcementConfig (config), no entidad |
| M11 Progreso | ProgressDaily/Weekly (calc) |
| M12 Modo niño | UserMode + ProfileSettings |
| M13 Modo adulto | UserMode + AppSettings.adultPinHash |
| M14 Responsive | AppSettings.preferredDeviceLayout |

## Anexo C — Control de cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2026-06-03 | Modelo de dominio inicial completo |

---

*Este documento define el modelo de negocio de PICTORGANIZER. La implementación Dexie, migraciones y Repositories debe derivar de aquí sin alterar las relaciones fundamentales Template → Instance.*
