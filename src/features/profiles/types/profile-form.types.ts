import { ChildModeDetailLevel } from '@/domain/enums';

export interface ProfileFormData {
  name: string;
  avatarId: string | null;
  color: string;
  birthDate: string;
  childModeDetailLevel: ChildModeDetailLevel;
  showTimer: boolean;
  showAnticipation: boolean;
}

export const DEFAULT_PROFILE_FORM_DATA: ProfileFormData = {
  name: '',
  avatarId: null,
  color: '#5b8def',
  birthDate: '',
  childModeDetailLevel: ChildModeDetailLevel.Standard,
  showTimer: true,
  showAnticipation: true,
};

export interface CreateProfileInput {
  name: string;
  color: string;
  avatarId?: string;
  birthDate?: string;
  childModeDetailLevel: ChildModeDetailLevel;
  showTimer: boolean;
  showAnticipation: boolean;
}

export interface UpdateProfileInput {
  name: string;
  color: string;
  avatarId?: string;
  birthDate?: string;
  childModeDetailLevel: ChildModeDetailLevel;
  showTimer: boolean;
  showAnticipation: boolean;
}
