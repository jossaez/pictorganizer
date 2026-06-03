# PICTORGANIZER — Configuración Android (Capacitor)

Guía para preparar la app como proyecto Android nativo con Capacitor, sin publicación en Play Store.

## Requisitos

- Node.js 20+
- Android Studio (Ladybug o superior recomendado)
- JDK 17+
- Dispositivo Android o emulador con Google APIs

## Instalación inicial

```bash
npm install
npm run build
npx cap add android   # solo la primera vez
npx cap sync android
```

Configuración del proyecto (`capacitor.config.ts`):

| Campo   | Valor                    |
|---------|--------------------------|
| appId   | `com.pictorganizer.app`  |
| appName | `PICTORGANIZER`          |
| webDir  | `dist`                   |

## Scripts npm

```bash
npm run android:build   # build web + cap sync android
npm run android:open    # abrir Android Studio
npm run cap:sync        # sincronizar assets/plugins
```

## Plugins Capacitor usados

- `@capacitor/core`
- `@capacitor/android`
- `@capacitor/app` — ciclo de vida y botón atrás
- `@capacitor/local-notifications` — recordatorios offline

La lógica de notificaciones **no** se llama desde componentes React. Está en `src/infrastructure/notifications/`.

## Permisos Android

### Notificaciones (Android 13+)

El permiso `POST_NOTIFICATIONS` se declara vía el plugin de notificaciones locales.

**Regla de producto:** no se piden permisos al abrir la app. Solo cuando un adulto activa recordatorios en Ajustes.

Si el usuario rechaza permisos:

- `notificationsEnabled` se guarda como `false` en Dexie
- Se muestra mensaje en Ajustes para volver a intentarlo

## Abrir en Android Studio

```bash
npm run android:build
npm run android:open
```

En Android Studio:

1. Esperar a que Gradle sincronice.
2. Seleccionar un dispositivo o emulador.
3. Pulsar **Run** (▶).

## Probar en dispositivo real

1. Activar **Opciones de desarrollador** y **Depuración USB**.
2. Conectar el móvil por USB.
3. Autorizar la depuración en el dispositivo.
4. Ejecutar desde Android Studio.

## Probar recordatorios

1. Completar onboarding y activar recordatorios en Ajustes.
2. Conceder permisos cuando se soliciten.
3. Crear una actividad dentro de 2–5 minutos.
4. Enviar la app a segundo plano.
5. Confirmar que llega la notificación sin internet.

Ver también: [LOCAL-NOTIFICATIONS.md](./LOCAL-NOTIFICATIONS.md) y [NOTIFICATIONS-CHECKLIST.md](./NOTIFICATIONS-CHECKLIST.md).

## Depuración

- **Diagnóstico en app:** Ajustes → Ver diagnóstico de recordatorios (`/settings/diagnostics`)
- **Logcat:** filtrar por `Capacitor` o `notifications`
- **Web en dispositivo:** la app usa `dist/` empaquetado; cambios requieren `npm run android:build`

## Limitaciones actuales (intencionadas)

- Sin firma release definitiva
- Sin Play Store
- Sin push remoto ni backend
- Sin sincronización cloud

## Solución de problemas

| Problema | Acción |
|----------|--------|
| Pantalla en blanco tras sync | Verificar `npm run build` y que `dist/index.html` exista |
| No llegan notificaciones | Comprobar permisos, recordatorios activos y diagnóstico |
| Gradle falla | File → Invalidate Caches / Sync Project with Gradle Files |
| Plugin no encontrado | `npm run cap:sync` de nuevo |
