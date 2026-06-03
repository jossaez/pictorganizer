# Capa visual — PICTORGANIZER v1

Documentación de pictogramas, avatares e imágenes personalizadas offline.

## ActivityVisual

`ActivityVisual` es el value object embebido en `ActivityTemplate` e `ActivityInstance`. Describe **cómo se muestra** una actividad, no el binario de la imagen.

```ts
type ActivityVisual =
  | { type: 'pictogram'; pictogramId: string; fallbackPictogramId?: string }
  | { type: 'photo'; photoUri: string; fallbackPictogramId?: string }
  | { type: 'emoji'; emoji: string; fallbackPictogramId?: string }
  | { type: 'icon'; iconId: string; fallbackPictogramId?: string };
```

- **pictogram** — id del catálogo local (`pictograms` en Dexie).
- **photo** — URI de archivo en filesystem (Capacitor) o caché web de sesión.
- **emoji** — carácter unicode temporal (selector rápido).
- **icon** — id de icono Lucide (reservado / fallback técnico).
- **fallbackPictogramId** — pictograma alternativo si la foto falla o falta.

## Renderizado — `VisualAsset`

Componente universal: `src/components/media/VisualAsset.tsx`.

Orden de render:

1. Foto (`photoUri` resuelta con `getPhotoUri`).
2. Pictograma (emoji offline del registro).
3. Emoji directo.
4. Icono Lucide.
5. Fallback: `fallbackPictogramId` → pictograma de categoría → `wake-up` → ⭐.

Tamaños: `sm | md | lg | xl`. Siempre recibe `alt` accesible.

## Pictogramas offline

Catálogo en Dexie, seed en `seed-data.ts` (~29 pictogramas v1).

Cada entrada incluye:

- `id`, `label`, `categoryId`, `assetPath` (SVG futuro)
- `emoji` / `iconId` — placeholder hasta ARASAAC
- `isSystem: true` — no borrable por el usuario en v1

Selector: `PictogramPicker` — búsqueda, filtro por categoría, grid responsive (3 cols móvil, 5–6 tablet).

## Fotos personalizadas (preparado)

Servicio: `src/infrastructure/filesystem/photo.storage.ts`

```ts
saveProfilePhoto(blob, profileId) → uri
saveActivityPhoto(blob, activityId) → uri
getPhotoUri(uri) → url renderizable
deletePhoto(uri)
```

### Regla importante

**No guardar fotos en IndexedDB.** Solo la URI (`photoUri`) en Dexie.

- **Web (dev):** blob URLs en caché de memoria de sesión.
- **Capacitor (futuro):** `@capacitor/filesystem` escribirá en directorio de app.

El botón “Añadir foto” en el selector está deshabilitado (“Próximamente”) hasta completar el flujo de captura.

## Avatares de perfil — `ProfileAvatar`

Prioridad:

1. `profile.photoUri`
2. `profile.avatarId` → emoji del catálogo `avatars`
3. Inicial del nombre sobre `profile.color`
4. Fallback genérico

## Integración ARASAAC (futuro)

1. Descargar packs ARASAAC a `public/pictograms/` o filesystem.
2. Actualizar `assetPath` en Dexie (sin cambiar ids).
3. `VisualAsset` intentará `<img src={assetPath}>` antes del emoji.
4. Mantener `fallbackPictogramId` para offline parcial.

No se requiere cambio de schema de `ActivityVisual`.

## Archivos clave

| Archivo | Rol |
|---------|-----|
| `domain/visual/visual-asset.utils.ts` | Normalización y fallbacks |
| `domain/visual/pictogram-registry.ts` | Mapa emoji offline |
| `components/media/VisualAsset.tsx` | Render universal |
| `components/media/PictogramPicker.tsx` | Selector cuadrícula |
| `components/media/ProfileAvatar.tsx` | Avatar de perfil |
| `infrastructure/filesystem/photo.storage.ts` | URIs de fotos |

## Checklist manual

- [ ] Crear actividad y elegir pictograma
- [ ] Ver pictograma en agenda / Ahora-Después-Más tarde
- [ ] Probar emoji en selector
- [ ] Ver avatar en selección de perfil y header de agenda
- [ ] Confirmar que actividad sin visual muestra fallback (⭐ o categoría)
- [ ] Grid del picker en móvil (3 cols) y tablet (5–6 cols)
