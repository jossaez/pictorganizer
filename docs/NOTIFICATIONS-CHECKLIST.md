# Checklist manual — Notificaciones locales

Probar en dispositivo Android/iOS con Capacitor (`npx cap sync` + build nativo).

## Configuración

- [ ] 1. Ir a Ajustes → Recordatorios del perfil activo.
- [ ] 2. Activar recordatorios y conceder permisos cuando se solicite.
- [ ] 3. Elegir “Cuándo avisar” (p. ej. 5 minutos antes).

## Programación

- [ ] 4. Crear una actividad futura (hoy o mañana) con hora cercana.
- [ ] 5. Confirmar que la notificación aparece a la hora configurada.

## Cancelación y cambios

- [ ] 6. Completar la actividad antes de la hora → la notificación no debe sonar.
- [ ] 7. Editar la hora de una actividad → debe reprogramarse.
- [ ] 8. Saltar actividad (modo adulto) → cancelar aviso.
- [ ] 9. Desactivar recordatorios → cancelar avisos pendientes del perfil.

## Web (navegador)

- [ ] 10. Abrir en navegador → mensaje “Las notificaciones estarán disponibles en la app móvil”.
- [ ] 11. La app no debe fallar al crear/editar actividades.

## Offline

- [ ] 12. Modo avión activado → recordatorios ya programados siguen funcionando.
