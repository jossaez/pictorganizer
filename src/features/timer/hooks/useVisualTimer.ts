import { useMemo } from 'react';
import {
  computeVisualTimer,
  type VisualTimerInput,
  type VisualTimerResult,
} from '@/features/timer/utils/visual-timer.utils';

export function useVisualTimer(input: VisualTimerInput): VisualTimerResult {
  const { startTimeMinutes, endTimeMinutes, currentTimeMinutes, defaultDurationMinutes } = input;

  return useMemo(
    () =>
      computeVisualTimer({
        startTimeMinutes,
        endTimeMinutes,
        currentTimeMinutes,
        defaultDurationMinutes,
      }),
    [startTimeMinutes, endTimeMinutes, currentTimeMinutes, defaultDurationMinutes],
  );
}

export type { VisualTimerInput, VisualTimerResult, VisualTimerStatus } from '@/features/timer/utils/visual-timer.utils';
export { computeVisualTimer } from '@/features/timer/utils/visual-timer.utils';
