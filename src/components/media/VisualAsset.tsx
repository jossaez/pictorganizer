import {
  Backpack,
  Bus,
  Car,
  Droplets,
  Gamepad2,
  HeartPulse,
  Home,
  ImageIcon,
  Moon,
  ShoppingCart,
  Star,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import type { ActivityVisual } from '@/domain/types/value-objects';
import {
  getFallbackPictogramId,
  normalizeActivityVisual,
} from '@/domain/visual/visual-asset.utils';
import { getPictogramEmoji } from '@/domain/visual/pictogram-registry';
import { getPhotoUri } from '@/infrastructure/filesystem/photo.storage';
import { cn } from '@/utils/cn';

export type VisualAssetSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CLASSES: Record<VisualAssetSize, string> = {
  sm: 'h-10 w-10 text-xl rounded-xl',
  md: 'h-14 w-14 text-2xl rounded-xl',
  lg: 'h-20 w-20 text-4xl rounded-2xl',
  xl: 'h-28 w-28 text-6xl rounded-2xl',
};

const ICON_MAP: Record<string, LucideIcon> = {
  droplets: Droplets,
  utensils: Utensils,
  gamepad: Gamepad2,
  'gamepad-2': Gamepad2,
  backpack: Backpack,
  'heart-pulse': HeartPulse,
  'shopping-cart': ShoppingCart,
  moon: Moon,
  home: Home,
  car: Car,
  bus: Bus,
  star: Star,
};

interface VisualAssetProps {
  visual: ActivityVisual | undefined | null;
  size?: VisualAssetSize;
  alt: string;
  className?: string;
  categoryId?: string;
}

function PictogramContent({ pictogramId, label }: { pictogramId: string; label: string }) {
  return (
    <span role="img" aria-label={label}>
      {getPictogramEmoji(pictogramId)}
    </span>
  );
}

function IconContent({ iconId, label }: { iconId: string; label: string }) {
  const Icon = ICON_MAP[iconId] ?? Star;
  return <Icon className="h-[55%] w-[55%] text-slate-700" aria-label={label} />;
}

export function VisualAsset({
  visual,
  size = 'md',
  alt,
  className,
  categoryId,
}: VisualAssetProps) {
  const normalized = normalizeActivityVisual(visual, categoryId);
  const fallbackId = getFallbackPictogramId(normalized, categoryId);
  const sizeClass = SIZE_CLASSES[size];

  function renderContent(): React.ReactNode {
    switch (normalized.type) {
      case 'photo': {
        const src = getPhotoUri(normalized.photoUri);
        if (src) {
          return (
            <img
              src={src}
              alt={alt}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          );
        }
        return <PictogramContent pictogramId={fallbackId} label={alt} />;
      }
      case 'emoji':
        return (
          <span role="img" aria-label={alt}>
            {normalized.emoji}
          </span>
        );
      case 'icon':
        return <IconContent iconId={normalized.iconId} label={alt} />;
      case 'pictogram':
      default:
        return <PictogramContent pictogramId={normalized.pictogramId} label={alt} />;
    }
  }

  const isPhoto = normalized.type === 'photo' && getPhotoUri(normalized.photoUri);

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden bg-slate-50',
        sizeClass,
        className,
      )}
      aria-hidden={!isPhoto}
    >
      {renderContent()}
    </div>
  );
}

/** Build ActivityVisual from a routine/catalog pictogram id */
export function pictogramVisual(pictogramId: string): ActivityVisual {
  return { type: 'pictogram', pictogramId, fallbackPictogramId: pictogramId };
}

export function GenericVisualFallback({ size = 'md', alt }: { size?: VisualAssetSize; alt: string }) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center bg-slate-100 text-slate-400',
        SIZE_CLASSES[size],
      )}
      aria-label={alt}
    >
      <ImageIcon className="h-[45%] w-[45%]" aria-hidden />
    </div>
  );
}
