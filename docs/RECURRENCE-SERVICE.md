# PICTORGANIZER — RecurrenceService

**Versión:** 1.0  
**Ubicación:** `src/domain/services/recurrence.service.ts`  
**Tests:** `src/domain/services/recurrence.service.test.ts`

---

## Propósito

`RecurrenceService` es un **servicio de dominio puro** que:

1. Determina si una actividad debe ocurrir en una fecha (`shouldOccurOnDate`).
2. Genera snapshots `ActivityInstance[]` a partir de un `ActivityTemplate` y un rango de fechas.
3. No conoce Dexie, React ni Capacitor.

Es la pieza central del motor offline de agendas recurrentes.

---

## ActivityTemplate vs ActivityInstance

| | ActivityTemplate | ActivityInstance |
|---|------------------|------------------|
| **Qué es** | Definición / regla (serie) | Ocurrencia concreta en un día |
| **Recurrencia** | Sí (`recurrence`) | No — tiene `date` |
| **Edición «todos»** | Modifica la serie | Regenera futuro desde template |
| **Edición «solo hoy»** | No cambia | Modifica snapshot + `isException=true` |
| **Completar** | — | Cambia `status`, `completedAt` |
| **Historial** | Fuente de verdad futura | Snapshot congelado al generar |

Al crear una instancia, se **copian** title, visual, horarios, etc. Cambios posteriores al template **no** alteran instancias pasadas ni excepcionales.

---

## Tipos de recurrencia

| Tipo | Comportamiento |
|------|----------------|
| `once` | Solo en `recurrence.startDate` |
| `daily` | Todos los días entre startDate y endDate (si existe) |
| `weekdays` | Lunes a viernes (ISO 1–5) |
| `weekly` | Días listados en `daysOfWeek`, cada semana |
| `custom` | Días listados en `daysOfWeek` |

### Convención `daysOfWeek` (ISO)

| Valor | Día |
|-------|-----|
| 1 | Lunes |
| 2 | Martes |
| 3 | Miércoles |
| 4 | Jueves |
| 5 | Viernes |
| 6 | Sábado |
| 7 | Domingo |

Implementado en `getISOWeekday()` (`src/utils/date.ts`).

**Reglas:**

- `weekly` y `custom` **requieren** `daysOfWeek` no vacío.
- `weekdays` ignora `daysOfWeek` (siempre Lun–Vie).
- Fechas fuera de `[startDate, endDate]` → no ocurre.

---

## API principal

### `generateInstancesFromTemplate(params)`

```typescript
RecurrenceService.generateInstancesFromTemplate({
  template: ActivityTemplate,
  fromDate: 'YYYY-MM-DD',
  toDate: 'YYYY-MM-DD',
  existingInstances?: ActivityInstance[],
  now?: string,           // tests
  createId?: () => string // tests
}): ActivityInstance[]
```

**Validaciones:**

- Template inactivo o con `deletedAt` → `[]`
- `fromDate > toDate` → `[]`
- Sin `startDate` válido → `[]`
- Duplicados `(templateId, date)` en `existingInstances` → omitidos

### `shouldOccurOnDate(recurrence, date)`

Predicado puro para una fecha.

### `getDaysBetween(fromDate, toDate)`

Rango inclusivo de fechas ISO. Delega a `src/utils/date.ts`.

### `createInstanceFromTemplate(template, date)`

Crea un snapshot con:

- `status = pending`
- `isException = false`
- `syncStatus = local`
- `revision = 1`
- `visual` clonado (`structuredClone`)

### `rollingWindowToDate(fromDate, windowDays)`

Calcula el `toDate` inclusivo para ventana rolling (90 días por defecto en repository).

---

## Ventana rolling (90 días)

| Constante | Valor | Ubicación |
|-----------|-------|-----------|
| `DEFAULT_ROLLING_WINDOW_DAYS` | 90 | `dexie-activity.repository.ts` |
| `ROLLING_EXTEND_THRESHOLD_DAYS` | 30 | idem (futuro `extendRollingWindow`) |

Al crear un template recurrente:

```text
fromDate = recurrence.startDate
toDate   = startDate + 89 días  (90 días inclusivos)
```

Al abrir la app (futuro): si quedan < 30 días de instancias futuras → extender ventana.

---

## Evitar duplicados

1. **En servicio:** set de claves `templateId::date` desde `existingInstances`.
2. **En repository:** antes de generar, consulta Dexie:

```text
activityInstances.where('templateId').equals(id)
  .filter(date in [fromDate, toDate])
```

3. **Inserción:** solo `bulkAdd` de instancias nuevas.

Segunda llamada al mismo rango → `created.length === 0`, `skipped === N`.

---

## Fechas y timezone

- Formato único: `YYYY-MM-DD`.
- Comparación lexicográfica válida para orden cronológico.
- `getISOWeekday` y `addDays` usan **UTC** (`Date.UTC`) para evitar desfases de huso horario.
- No se usa hora local del dispositivo para decidir el día calendario.

---

## Conexión con DexieActivityRepository

```text
generateInstances(templateId, { fromDate, toDate })
  → load template
  → load existing instances in range
  → RecurrenceService.generateInstancesFromTemplate(...)
  → bulkAdd(created)
  → return { created, skipped }
```

`createTemplateWithInstances` crea template + genera ventana rolling completa.

---

## Conexión con agenda diaria (siguiente paso)

```text
useDayAgenda(profileId, date)
  → activityRepository.getInstancesByDate(profileId, date)
  → ActivityStateService.enrich(instances, now)  // pending/in_progress/missed
  → render agenda
```

La agenda **solo lee** `activityInstances`. El RecurrenceService **escribe** instancias futuras.

---

## Tests

```bash
npm test
```

| Archivo | Cobertura |
|---------|-----------|
| `recurrence.service.test.ts` | 12+ casos unitarios |
| `dexie-activity.repository.test.ts` | Integración Dexie + fake-indexeddb |

---

## Dependencias permitidas

| ✅ Permitido | ❌ Prohibido |
|-------------|-------------|
| `domain/types`, `domain/enums` | Dexie |
| `utils/date.ts` | React, Zustand, Capacitor |
| `structuredClone`, `crypto.randomUUID` | Repositories |

---

## Control de cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2026-06-03 | Implementación inicial + tests |
