# PICTORGANIZER — Esquema Dexie v1

**Versión:** 1.0  
**Fecha:** 3 de junio de 2026  
**Base de datos:** `pictorganizer_db` · **Schema version:** 1  
**Referencia:** [MODELO-DE-DOMINIO.md](./MODELO-DE-DOMINIO.md)

---

## SECCIÓN 1 — Esquema general Dexie

### Configuración

| Propiedad | Valor |
|-----------|-------|
| Nombre BD | `pictorganizer_db` |
| Versión Dexie | `1` |
| Motor | IndexedDB (via Dexie) |
| Entorno dev | Browser + `fake-indexeddb` en tests |
| Entorno prod | Capacitor WebView |

### Tablas v1

| Tabla | ¿Existe? | Contenido |
|-------|:--------:|-----------|
| `profiles` | ✅ | Perfiles familiares |
| `profileSettings` | ✅ | Preferencias 1:1 por perfil |
| `categories` | ✅ | Catálogo categorías (seed) |
| `pictograms` | ✅ | Catálogo pictogramas (seed) |
| `avatars` | ✅ | Catálogo avatares (seed) |
| `routineTemplates` | ✅ | Biblioteca rutinas sistema (seed) |
| `routines` | ✅ | Rutinas aplicadas por perfil |
| `activityTemplates` | ✅ | Definiciones con recurrencia |
| `activityInstances` | ✅ | Ocurrencias diarias (agenda) |
| `appSettings` | ✅ | Singleton configuración global |

### Tablas que NO existen (y por qué)

| Tabla propuesta | Decisión | Motivo |
|-----------------|----------|--------|
| `progressDaily` / `progressWeekly` | ❌ | Progreso calculado on-demand desde `activityInstances` |
| `photos` | ❌ | Binarios en Capacitor Filesystem; solo URI en entidades |
| `achievements` | ❌ | Fuera de alcance v1 |
| `syncOperations` | ❌ | Cola sync reservada v2 |
| `userSessions` | ❌ | Sesión adulto en Zustand (runtime) |

### AppSettings: Dexie vs Capacitor Preferences

**Decisión v1:** tabla `appSettings` en Dexie como **fuente de verdad única**.

| Enfoque | Uso |
|---------|-----|
| Dexie `appSettings` | Lectura/escritura de toda la configuración |
| Capacitor Preferences | **No usado en v1** para settings (evita duplicidad) |

> El PIN se guarda como `adultPinHash` (SHA-256), nunca en claro.  
> Fotos: Filesystem exclusivamente.

---

## SECCIÓN 2 — Tipos TypeScript

Implementados en `src/domain/types/` y `src/domain/enums/`. Ver archivos fuente.

---

## SECCIÓN 3 — Índices Dexie

### profiles

```
id, isActive, sortOrder
```

| Índice | Query |
|--------|-------|
| `id` | PK lookup |
| `isActive` | Filtrar soft-deleted |
| `sortOrder` | Selector de perfiles ordenado |

### profileSettings

```
id, profileId
```

| Índice | Query |
|--------|-------|
| `id` | PK |
| `profileId` | Lookup 1:1 por perfil (único lógico) |

### categories / pictograms / avatars / routineTemplates

```
categories:      id, sortOrder, isSystem
pictograms:      id, categoryId, sortOrder
avatars:         id, sortOrder
routineTemplates: id, sortOrder, isSystem, categoryId
```

Catálogos: lectura por PK o listado ordenado. `categoryId` en pictograms para filtrar por categoría.

### routines

```
id, profileId, sourceTemplateId, isActive, [profileId+isActive]
```

| Índice | Query |
|--------|-------|
| `[profileId+isActive]` | Listar rutinas activas de un perfil |

### activityTemplates

```
id, profileId, routineId, categoryId, isActive,
[profileId+isActive], [profileId+routineId]
```

| Índice | Query |
|--------|-------|
| `[profileId+isActive]` | CRUD adulto: plantillas del perfil |
| `[profileId+routineId]` | Actividades de una rutina |
| `categoryId` | Filtro por categoría (estadísticas futuras) |

### activityInstances (crítica)

```
id, profileId, date, templateId, routineId, status,
[profileId+date],
[profileId+date+startTimeMinutes],
[profileId+status],
[profileId+date+status]
```

| Índice | Query |
|--------|-------|
| `[profileId+date]` | **Agenda diaria** — query más frecuente |
| `[profileId+date+startTimeMinutes]` | Agenda ordenada por hora sin sort en memoria |
| `[profileId+date+status]` | Progreso del día (completadas/pendientes) |
| `[profileId+status]` | Resumen por estado (opcional) |
| `templateId` | Regeneración de serie / borrado futuro |
| `routineId` | Instancias de una rutina |
| `date` | Mantenimiento / extensión ventana rolling |

### appSettings

```
id
```

Singleton: una fila con `id = 'app'`.

---

## SECCIÓN 4 — dexie.db.ts

Ver `src/infrastructure/database/dexie.db.ts`.

---

## SECCIÓN 5 — Seeds

Ver `src/infrastructure/database/seeds/`.

Estrategia `seedIfEmpty()`:

1. Comprobar `db.categories.count() === 0` (marcador de catálogo).
2. Si vacío → insertar categories, pictograms, avatars, routineTemplates en **transacción**.
3. Crear fila `appSettings` por defecto si no existe.
4. Idempotente: no duplica si catálogo ya poblado.
5. Futuras migraciones v2 pueden usar `upgrade()` para añadir pictogramas sin tocar datos usuario.

---

## SECCIÓN 6 — Repositories

| Interfaz | Implementación | Ámbito |
|----------|----------------|--------|
| `IProfileRepository` | `DexieProfileRepository` | Profile + ProfileSettings |
| `IRoutineRepository` | `DexieRoutineRepository` | Routine + apply template |
| `IActivityRepository` | `DexieActivityRepository` | Template + Instance |
| `ISettingsRepository` | `DexieSettingsRepository` | AppSettings singleton |

---

## SECCIÓN 7 — Transacciones críticas

| Operación | Tablas | Motivo |
|-----------|--------|--------|
| Crear perfil | profiles + profileSettings | Atomicidad 1:1 |
| Aplicar RoutineTemplate | routines + activityTemplates + activityInstances | Bloque coherente |
| Crear template recurrente | activityTemplates + activityInstances | Serie + ventana inicial |
| Editar template futuro | activityTemplates + delete/regenerate instances | Sin huérfanos |
| Eliminar perfil | profiles + settings + routines + templates + instances | Cascade lógico |
| Completar actividad | activityInstances | Una fila; transacción opcional pero recomendada para revision++ |

---

## SECCIÓN 8 — Migraciones

```typescript
// v1 — inicial
db.version(1).stores({ ... });

// v2 — ejemplo futuro
db.version(2).stores({ ... }).upgrade(async (tx) => {
  // migrar datos
});
// AppSettings.schemaVersion = 2 tras migración exitosa
```

Reglas:

- Nunca editar `.version(1)` una vez en producción.
- `AppSettings.schemaVersion` refleja versión aplicada (auditoría).
- Tests con `fake-indexeddb` por cada migración.

---

## SECCIÓN 9 — Reglas explícitas

1. **No** guardar fotos en IndexedDB.
2. Guardar **solo URI** de fotos (Capacitor Filesystem).
3. **No** usar localStorage.
4. **No** guardar PIN en claro (`adultPinHash` únicamente).
5. **No** persistir progreso diario/semanal en v1.
6. `ActivityInstance` = snapshot editable; desacoplado del template tras generación.
7. `ActivityTemplate` = fuente para regenerar instancias futuras no excepcionales.
8. Instancias pasadas **no** se borran automáticamente.
9. Instancias con `isException=true` **no** se sobrescriben al regenerar.
10. IDs siempre UUID v4 generados en cliente.

---

## SECCIÓN 10 — Orden de implementación

1. Enums + value objects + entity types
2. `dexie.db.ts` + export `db`
3. `seedIfEmpty()` + JSON seeds mínimos
4. Interfaces repository (domain)
5. Implementaciones Dexie (infrastructure)
6. Tests Vitest: índices, transacciones, seed idempotente
7. Hooks de lectura (`useLiveQuery`) — capa application, posterior a repos

---

## Mapa archivos creados

```text
src/domain/enums/index.ts
src/domain/types/value-objects.ts
src/domain/types/entities.ts
src/domain/types/index.ts
src/domain/repositories/profile.repository.ts
src/domain/repositories/routine.repository.ts
src/domain/repositories/activity.repository.ts
src/domain/repositories/settings.repository.ts
src/domain/repositories/index.ts
src/infrastructure/database/dexie.db.ts
src/infrastructure/database/seeds/seed-data.ts
src/infrastructure/database/seeds/seedIfEmpty.ts
src/infrastructure/repositories/dexie-profile.repository.ts
src/infrastructure/repositories/dexie-routine.repository.ts
src/infrastructure/repositories/dexie-activity.repository.ts
src/infrastructure/repositories/dexie-settings.repository.ts
src/infrastructure/repositories/index.ts
```
