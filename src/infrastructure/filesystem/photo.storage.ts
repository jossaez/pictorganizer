/**
 * Photo storage — URIs in Dexie, binary files on filesystem (Capacitor) or session cache (web).
 *
 * Capacitor Filesystem is not installed yet; web fallback uses in-memory blob URLs.
 * TODO(v2): replace web cache with @capacitor/filesystem when mobile packaging is enabled.
 */

const WEB_PHOTO_CACHE = new Map<string, string>();

function buildProfilePhotoUri(profileId: string): string {
  return `pictorganizer://photos/profile/${profileId}/${Date.now()}.jpg`;
}

function buildActivityPhotoUri(activityId: string): string {
  return `pictorganizer://photos/activity/${activityId}/${Date.now()}.jpg`;
}

export function getPhotoUri(uri: string): string | undefined {
  if (uri.startsWith('blob:') || uri.startsWith('http://') || uri.startsWith('https://')) {
    return uri;
  }
  return WEB_PHOTO_CACHE.get(uri);
}

export async function saveProfilePhoto(fileOrBlob: Blob | File, profileId: string): Promise<string> {
  const uri = buildProfilePhotoUri(profileId);
  const objectUrl = URL.createObjectURL(fileOrBlob);
  WEB_PHOTO_CACHE.set(uri, objectUrl);
  return uri;
}

export async function saveActivityPhoto(fileOrBlob: Blob, activityId: string): Promise<string> {
  const uri = buildActivityPhotoUri(activityId);
  const objectUrl = URL.createObjectURL(fileOrBlob);
  WEB_PHOTO_CACHE.set(uri, objectUrl);
  return uri;
}

export async function deletePhoto(uri: string): Promise<void> {
  const cached = WEB_PHOTO_CACHE.get(uri);
  if (cached?.startsWith('blob:')) {
    URL.revokeObjectURL(cached);
  }
  WEB_PHOTO_CACHE.delete(uri);
}
