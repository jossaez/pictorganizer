# Notificaciones locales — PICTORGANIZER

Recordatorios offline para actividades programadas. Sin backend, sin internet, sin push remoto.

## Arquitectura

```
Dexie (fuente de verdad)
    ↓ tras guardar actividad/ajuste
local-notification.service.ts
    ↓ solo en Capacitor nativo
@capacitor/local-notifications
```

**Nunca** llamar al plugin desde componentes React. Usar:

- `src/infrastructure/notifications/local-notification.service.ts`
- `src/infrastructure/notifications/notification-sync.ts` (fire-and-forget)

## Ventana de 7 días

- Las `ActivityInstance` pueden generarse hasta **90 días**.
- Las notificaciones se programan solo para los **próximos 7 días** (`NOTIFICATION_ROLLING_DAYS`).
- Al abrir la app o volver del background se reprograma esa ventana.
- Al editar una actividad se reprograma el día afectado.

Motivo: evitar saturar Android con cientos de alarmas pendientes.

## Cuándo se programan

| Evento | Acción |
|--------|--------|
| Crear actividad / recurrencia | `syncNotificationsRolling` |
| Aplicar rutina | `syncNotificationsRolling` |
| Editar instancia | `syncNotificationsForDate` |
| Editar futuras instancias | `syncNotificationsRolling` |
| Deshacer completado | `syncNotificationsForDate` |
| Activar recordatorios | permisos + `rescheduleRollingNotifications` |
| Bootstrap / foreground | `rescheduleNotificationsForActiveProfileNextDays` |

Solo si:

- `notificationsEnabled === true`
- permisos `granted`
- plataforma nativa (Capacitor)

## Cuándo NO se programan

- Actividad completada, saltada o perdida
- Actividad pasada
- Actividad eliminada (`deletedAt`)
- Sin `startTimeMinutes`
- Visibilidad `Hidden`
- Recordatorios desactivados
- Permisos denegados
- Navegador web (no-op seguro)

## Cuándo se cancelan

- Completar actividad → `cancelActivityNotification`
- Saltar actividad → cancelar
- Eliminar actividad → cancelar (+ reprogramar día si aplica)
- Cambiar hora → cancelar instancias del día y reprogramar
- Desactivar recordatorios → `syncProfileNotifications({ reschedule: false })`

Si falla la notificación **no** se revierte la escritura en Dexie. Se registra en consola; en modo adulto usar diagnóstico.

## IDs numéricos

Archivo: `src/infrastructure/notifications/notification-id.ts`

```typescript
getNotificationIdForActivityInstance(activityInstanceId: string): number
```

Hash estable del UUID → entero positivo. Mismo ID siempre para poder cancelar.

## Contenido de la notificación

| Aviso | Título | Cuerpo |
|-------|--------|--------|
| A la hora (`0 min`) | `Ahora toca: {title}` | `Abre PICTORGANIZER para ver la actividad.` |
| Antes (`5/10/15 min`) | `En {n} minutos: {title}` | `Prepárate con calma para la próxima actividad.` |

Sin mensajes negativos (“vas tarde”, “no olvides”, etc.).

## Configuración por perfil

`ProfileSettings`:

- `notificationsEnabled` — default `false`
- `notificationMinutesBefore` — default `0`

Opciones en Ajustes:

- A la hora de la actividad
- 5 / 10 / 15 minutos antes

Permisos: solo al activar recordatorios (adulto).

## Compatibilidad web

En navegador:

- `isSupported()` → `false`
- No se lanza error al crear/editar actividades
- Ajustes muestran: *“Los recordatorios estarán disponibles al instalar la app en Android.”*

## Ciclo de vida Android

`src/infrastructure/mobile/android-lifecycle.service.ts`

Al volver a foreground:

1. Actualizar fecha seleccionada si cambió el día
2. Extender ventana de instancias / compactar
3. Reprogramar notificaciones (7 días)
4. Bloquear sesión adulta si el PIN caducó

Botón atrás:

- `/adult/unlock` → `/child`
- `/child` → confirmación antes de salir
- Resto → navegación normal

## Checklist de pruebas

- [ ] Activar recordatorios y conceder permisos
- [ ] Actividad en 2 min → notificación en background
- [ ] Completar antes → no suena
- [ ] Cambiar hora → se reprograma
- [ ] Desactivar recordatorios → se cancelan
- [ ] Reiniciar app → reprograma 7 días
- [ ] Modo avión → siguen funcionando
- [ ] Navegador → no rompe, mensaje informativo
- [ ] Diagnóstico en `/settings/diagnostics`

## Referencias

- [ANDROID-SETUP.md](./ANDROID-SETUP.md)
- [NOTIFICATIONS-CHECKLIST.md](./NOTIFICATIONS-CHECKLIST.md)
