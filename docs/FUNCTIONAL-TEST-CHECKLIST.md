# Checklist de pruebas funcionales — PICTORGANIZER

Validación manual antes de preparar la versión Android (Capacitor).

## Comando de verificación automática

Ejecutar en local antes de cada release candidata:

```bash
npm run verify
```

Equivale a:

```bash
npm run typecheck
npm test
npm run build
```

## Criterios de aceptación

- [ ] TypeScript sin errores (`npm run typecheck`)
- [ ] Build Vite correcto (`npm run build`)
- [ ] Tests automáticos pasan (`npm test`)
- [ ] Checklist manual principal superado (este documento)
- [ ] No hay pantallas en blanco en flujos críticos
- [ ] La app funciona sin internet
- [ ] Recarga del navegador mantiene datos

---

## Flujo 1 — Primer uso

1. [ ] Abrir app limpia (datos borrados o primera instalación).
2. [ ] Ver onboarding con pasos claros.
3. [ ] Crear primer perfil (nombre, color/avatar).
4. [ ] Seleccionar rutinas iniciales.
5. [ ] Llegar a la agenda del día.
6. [ ] Recargar la página.
7. [ ] Confirmar que **no** vuelve al onboarding.
8. [ ] Confirmar que el perfil y las actividades siguen presentes.

## Flujo 2 — Perfiles

1. [ ] Crear un segundo perfil.
2. [ ] Cambiar al otro perfil desde selección de perfiles.
3. [ ] Confirmar que la agenda cambia (independiente por perfil).
4. [ ] Editar nombre o avatar de un perfil.
5. [ ] Desactivar un perfil (modo adulto).
6. [ ] Confirmar que no aparece en perfiles activos.
7. [ ] Confirmar que el perfil activo restante sigue funcionando.

## Flujo 3 — Rutinas

1. [ ] Aplicar rutina de mañana a un perfil.
2. [ ] Ver actividades generadas en la agenda.
3. [ ] Intentar aplicar la misma rutina otra vez.
4. [ ] Confirmar aviso de duplicado (si aplica).
5. [ ] Aplicar copia con nombre distinto.
6. [ ] Recargar y confirmar persistencia de rutinas y actividades.

## Flujo 4 — Actividades

1. [ ] Crear actividad puntual (solo un día).
2. [ ] Crear actividad diaria.
3. [ ] Crear actividad con días personalizados (ej. L-M-V).
4. [ ] Editar **solo una** ocurrencia → confirmar excepción.
5. [ ] Editar **esta y las próximas** → confirmar cambio en días futuros.
6. [ ] Confirmar que no hay duplicados al regenerar.

## Flujo 5 — Agenda

1. [ ] Ver el día actual con actividades ordenadas por hora.
2. [ ] Cambiar a otro día con el navegador semanal.
3. [ ] Pulsar **Hoy** y volver al día actual.
4. [ ] Completar una actividad pendiente.
5. [ ] En modo adulto, **deshacer** una actividad completada.
6. [ ] Ver bloques **Ahora / Después / Más tarde** (si anticipación activa).

## Flujo 6 — Modo niño

1. [ ] Entrar en modo niño desde ajustes o layout adulto.
2. [ ] Confirmar: sin edición, sin ajustes técnicos, sin botones destructivos.
3. [ ] Completar actividad con botón **Hecho**.
4. [ ] Ver refuerzo/celebración (según preferencia del perfil).
5. [ ] Salir a modo adulto (enlace discreto).
6. [ ] Confirmar que los cambios persisten.

## Flujo 7 — Progreso

1. [ ] Completar varias actividades en el día.
2. [ ] Ver progreso diario actualizado (barra y contadores).
3. [ ] Ir a pantalla de progreso semanal.
4. [ ] Cambiar de semana (anterior / siguiente).
5. [ ] Confirmar totales coherentes con la agenda.

## Flujo 8 — Accesibilidad

1. [ ] Activar **Texto grande** en Ajustes.
2. [ ] Activar **Reducir animaciones**.
3. [ ] Activar **Alto contraste**.
4. [ ] Revisar agenda, modo niño y perfiles.
5. [ ] Confirmar que el layout no se rompe en móvil.
6. [ ] Ver checklist detallado en [`ACCESSIBILITY-CHECKLIST.md`](./ACCESSIBILITY-CHECKLIST.md).

## Flujo 9 — Offline

1. [ ] Abrir la app con conexión normal.
2. [ ] Desactivar red (modo avión o DevTools offline).
3. [ ] Crear una actividad nueva.
4. [ ] Completar una actividad existente.
5. [ ] Recargar la página sin red.
6. [ ] Confirmar que datos y cambios persisten (Dexie local).

## Flujo 10 — Notificaciones (móvil / Capacitor)

1. [ ] Activar recordatorios en Ajustes (perfil activo).
2. [ ] Conceder permisos si el sistema lo pide.
3. [ ] Crear actividad futura con hora definida.
4. [ ] Confirmar que se programa aviso local (en build nativa).

---

## Tests automáticos por capa

| Capa | Ubicación | Qué valida |
|------|-----------|------------|
| Dominio | `src/domain/services/*.test.ts` | Recurrencia, estados, completado, anticipación, progreso |
| Repositorios | `src/infrastructure/repositories/*.test.ts` | Dexie + fake-indexeddb: perfiles, rutinas, actividades, settings |
| Componentes | `src/**/*.test.tsx` | Render, callbacks, ARIA básico |
| Utilidades | `src/**/utils/*.test.ts` | Formularios, fechas, notificaciones |

## Hooks — checklist manual (sin tests automatizados en v1)

Prioridad manual si no hay tests de hooks:

- [ ] `useProfiles` — crear, seleccionar, listar.
- [ ] `useDayAgenda` — carga por fecha, estados enriquecidos.
- [ ] `useDailyProgress` / `useWeeklyProgress` — coherencia con agenda.
- [ ] `useActivityActions` — completar, saltar, deshacer.

---

## Notas

- No se persigue cobertura al 100 %.
- Los flujos críticos (onboarding → agenda → completar → persistencia) tienen prioridad.
- CI/CD y E2E en nube quedan fuera de alcance en esta fase.
