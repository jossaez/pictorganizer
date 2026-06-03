import { Clock, ListOrdered } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { RoutineTemplate } from '@/domain/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { VisualAsset, pictogramVisual } from '@/components/media/VisualAsset';
import { ROUTINE_RECURRENCE_LABELS } from '@/features/routines/constants/routine-config';
import {
  estimateRoutineDurationMinutes,
  formatDurationMinutes,
} from '@/features/routines/utils/routine-display';

interface RoutineTemplateCardProps {
  template: RoutineTemplate;
  categoryLabel?: string;
  disabled?: boolean;
  isApplying?: boolean;
  onApply: () => void;
}

export function RoutineTemplateCard({
  template,
  categoryLabel,
  disabled = false,
  isApplying = false,
  onApply,
}: RoutineTemplateCardProps) {
  const stepCount = template.steps.length;
  const duration = estimateRoutineDurationMinutes(template.steps);
  const recurrenceLabel = template.suggestedRecurrenceType
    ? ROUTINE_RECURRENCE_LABELS[template.suggestedRecurrenceType]
    : null;

  return (
    <Card className="flex h-full flex-col" padding="lg">
      <div className="mb-4">
        <VisualAsset
          visual={template.pictogramId ? pictogramVisual(template.pictogramId) : null}
          size="lg"
          alt={template.name}
          categoryId={template.categoryId}
        />
      </div>

      <h3 className="text-lg font-bold text-slate-900">{template.name}</h3>

      {template.description && (
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{template.description}</p>
      )}

      <ul className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
        {categoryLabel && (
          <li className="rounded-full bg-slate-100 px-2.5 py-1 font-medium">{categoryLabel}</li>
        )}
        <li className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
          <ListOrdered className="h-3.5 w-3.5" aria-hidden />
          {stepCount} paso{stepCount === 1 ? '' : 's'}
        </li>
        {duration > 0 && (
          <li className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            ~{formatDurationMinutes(duration)}
          </li>
        )}
        {recurrenceLabel && (
          <li className="rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
            {recurrenceLabel}
          </li>
        )}
      </ul>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Link to={`/routines/${template.id}`} className="flex-1">
          <Button fullWidth variant="secondary">
            Ver detalle
          </Button>
        </Link>
        <Button
          fullWidth
          className="flex-1"
          disabled={disabled || isApplying}
          onClick={onApply}
        >
          {isApplying ? 'Aplicando…' : 'Aplicar al perfil'}
        </Button>
      </div>
    </Card>
  );
}
