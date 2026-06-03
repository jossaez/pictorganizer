import { useEffect, useState } from 'react';
import { getNowMinutesFromMidnight } from '@/domain/services/activity-state.service';

const TICK_MS = 60_000;

export function useCurrentTimeMinutes(): number {
  const [minutes, setMinutes] = useState(() => getNowMinutesFromMidnight());

  useEffect(() => {
    function tick(): void {
      const next = getNowMinutesFromMidnight();
      setMinutes((prev) => (prev === next ? prev : next));
    }

    tick();
    const id = window.setInterval(tick, TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  return minutes;
}
