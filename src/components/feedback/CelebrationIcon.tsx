import { Star } from 'lucide-react';
import { CelebrationStyle } from '@/domain/enums';
import { cn } from '@/utils/cn';

interface CelebrationIconProps {
  type: CelebrationStyle;
  childMode: boolean;
  reduceMotion: boolean;
}

const CONFETTI_COLORS = ['#5b8def', '#34d399', '#fbbf24', '#f472b6', '#a78bfa'];

function SoftConfetti({ reduceMotion }: { reduceMotion: boolean }) {
  if (reduceMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {CONFETTI_COLORS.map((color, index) => (
        <span
          key={color}
          className="celebration-confetti-piece absolute h-2 w-2 rounded-full opacity-70"
          style={{
            backgroundColor: color,
            left: `${12 + index * 16}%`,
            animationDelay: `${index * 0.08}s`,
          }}
        />
      ))}
    </div>
  );
}

export function CelebrationIcon({ type, childMode, reduceMotion }: CelebrationIconProps) {
  const sizeClass = childMode ? 'text-8xl md:text-9xl' : 'text-6xl md:text-7xl';

  switch (type) {
    case CelebrationStyle.Smile:
      return (
        <span className={cn('leading-none', sizeClass)} role="img" aria-label="Carita feliz">
          😊
        </span>
      );
    case CelebrationStyle.Star:
      return (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-amber-100 text-amber-500',
            childMode ? 'h-28 w-28 md:h-32 md:w-32' : 'h-20 w-20 md:h-24 md:w-24',
            !reduceMotion && 'celebration-scale-in',
          )}
          aria-hidden
        >
          <Star
            className={cn(childMode ? 'h-16 w-16 md:h-20 md:w-20' : 'h-12 w-12 md:h-14 md:w-14')}
            fill="currentColor"
            strokeWidth={1.5}
          />
        </div>
      );
    case CelebrationStyle.ConfettiSoft:
      return (
        <div className="relative flex items-center justify-center">
          <SoftConfetti reduceMotion={reduceMotion} />
          <span className={cn('relative leading-none', sizeClass)} role="img" aria-label="Celebración">
            🎉
          </span>
        </div>
      );
    default:
      return null;
  }
}
