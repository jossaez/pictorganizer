# Checklist de accesibilidad visual y cognitiva

Pruebas manuales para validar la fase de accesibilidad de PICTORGANIZER.

## Preferencias globales (Ajustes → Accesibilidad)

- [ ] Activar **Texto grande** y comprobar que títulos, botones y tarjetas crecen en agenda, modo niño y selección de perfil.
- [ ] Confirmar que el layout **no se rompe en móvil** (320–428 px) con texto grande activo.
- [ ] Activar **Reducir animaciones** y comprobar que las transiciones son mínimas.
- [ ] Activar **Alto contraste** y revisar bordes, botones y estados de actividad.

## Celebración y movimiento

- [ ] Con reducir animaciones activo, completar una actividad.
- [ ] Confirmar que la celebración aparece **sin movimiento intenso** (sin scale/confetti animado).
- [ ] Pulsar **Escape** o fuera del panel para cerrar la celebración.

## Agenda y estados

- [ ] Revisar la agenda con alto contraste: estados pending, in_progress, completed, skipped y missed se distinguen por borde, icono y texto.
- [ ] Comprobar **WeekNavigator**: día seleccionado visible, foco visible al tabular.
- [ ] Comprobar **Ahora / Después / Más tarde** con anticipación activa.

## Teclado y foco

- [ ] Navegar la agenda y ajustes **solo con teclado** (Tab, Enter, Space, Escape en modales).
- [ ] Confirmar **anillo de foco visible** en botones y enlaces interactivos.

## Modo niño

- [ ] Entrar en modo niño: sin menús técnicos ni botones destructivos.
- [ ] Actividades muestran **pictograma + título**; botón principal **Hecho** evidente.
- [ ] Cambiar **Nivel de detalle en modo niño** en Ajustes y verificar la UI.

## Formularios

- [ ] Crear actividad sin nombre → error **"Escribe un nombre"** junto al campo.
- [ ] Repetición semanal sin días → **"Elige al menos un día"**.
- [ ] Hora de fin anterior al inicio → **"La hora de fin debe ser posterior"**.
- [ ] Tras error, el valor introducido **se mantiene**.

## Perfiles

- [ ] En selección de perfil, tarjeta activa con borde claro y `aria-selected`.
- [ ] Texto grande aplicado a títulos y botones.
