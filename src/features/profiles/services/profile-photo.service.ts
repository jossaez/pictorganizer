import { deletePhoto, getPhotoUri, saveProfilePhoto } from '@/infrastructure/filesystem/photo.storage';
import { profileRepository } from '@/infrastructure/repositories';

export async function persistProfilePhoto(
  profileId: string,
  file: Blob | File,
  existingPhotoUri?: string,
): Promise<string> {
  if (existingPhotoUri) {
    await deletePhoto(existingPhotoUri);
  }
  const uri = await saveProfilePhoto(file, profileId);
  await profileRepository.updateProfile(profileId, { photoUri: uri });
  return uri;
}

export async function removeProfilePhoto(profileId: string, photoUri: string): Promise<void> {
  await deletePhoto(photoUri);
  await profileRepository.updateProfile(profileId, { photoUri: undefined });
}

export function resolveProfilePhotoSrc(photoUri?: string): string | undefined {
  if (!photoUri) return undefined;
  return getPhotoUri(photoUri);
}
