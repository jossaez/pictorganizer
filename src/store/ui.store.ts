import { create } from 'zustand';
import type { CelebrationStyle } from '@/domain/enums';

export interface CelebrationState {
  visible: boolean;
  type: CelebrationStyle;
  message: string;
  activityTitle?: string;
}

export interface ShowCelebrationPayload {
  type: CelebrationStyle;
  message: string;
  activityTitle?: string;
}

interface UiState {
  celebration: CelebrationState | null;
  /** Ephemeral keys `${profileId}:${date}` — avoids repeat day-complete celebrations per session */
  celebratedDayKeys: string[];
  showCelebration: (payload: ShowCelebrationPayload) => void;
  hideCelebration: () => void;
  hasCelebratedDayComplete: (key: string) => boolean;
  markDayCompleteCelebrated: (key: string) => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  celebration: null,
  celebratedDayKeys: [],

  showCelebration: (payload) =>
    set({
      celebration: {
        visible: true,
        type: payload.type,
        message: payload.message,
        activityTitle: payload.activityTitle,
      },
    }),

  hideCelebration: () => set({ celebration: null }),

  hasCelebratedDayComplete: (key) => get().celebratedDayKeys.includes(key),

  markDayCompleteCelebrated: (key) =>
    set((state) =>
      state.celebratedDayKeys.includes(key)
        ? state
        : { celebratedDayKeys: [...state.celebratedDayKeys, key] },
    ),
}));
