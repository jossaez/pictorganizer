import { ArrowLeft, Clock, LayoutList } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { RecurrenceType } from '@/domain/enums';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RoutineApplyDialogs } from '@/features/routines/components/RoutineApplyDialogs';
import { ROUTINE_RECURRENCE_LABELS, getRoutineAnchorMinutes } from '@/features/routines/constants/routine-config';
import { useRoutineApplyFlow } from '@/features/routines/hooks/useRoutineApplyFlow';
import { useRoutineTemplates } from '@/features/routines/hooks/useRoutineTemplates';
import {
  estimateRoutineDurationMinutes,
  formatDurationMinutes,
  formatTimeMinutes,
} from '@/features/routines/utils/routine-display';

export function RoutineTemplateDetailPage() {
  const { routineTemplateId } = useParams<{ routineTemplateId: string }>();
  const navigate = useNavigate();
  const { getRoutineTemplateById, categoryMap, pictogramMap, isLoading } = useRoutineTemplates();
  const { activeProfileId, isApplying, error, applyTemplate, dialogProps } = useRoutineApplyFlow();

  const template = routineTemplateId ? getRoutineTemplateById(routineTemplateId) : undefined;

  const sortedSteps = useMemo(() => {
    if (!template) return [];
    return [...template.steps].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.offsetMinutes - b.offsetMinutes,
    );
  }, [template]);

  const anchorMinutes = template
    ? getRoutineAnchorMinutes(template.id, template.suggestedAnchorTimeMinutes)
    : 0;

  const totalDuration = template ? estimateRoutineDurationMinutes(template.steps) : 0;

  if (!routineTemplateId) {
    return (
      <div>
        <p className="text-red-700">Rutina no válida.</p>
        <Link to="/routines" className="mt-4 inline-block text-[var(--color-primary)]">
          Volver a rutinas
        </Link>
      </div>
    );
  }

  if (!isLoading && !template) {
    return (
      <div>
        <p className="text-slate-600">Esta rutina no existe.</p>
        <Link to="/routines" className="mt-4 inline-block text-[var(--color-primary)]">
          Volver a rutinas
        </Link>
      </div>
    );
  }

  if (isLoading || !template) {
    return <p className="text-slate-500">Cargando rutina…</p>;
  }

  const templateId = template.id;

  async function handleApply(): Promise<void> {
    if (!activeProfileId) {
      navigate('/profiles');
      return;
    }
    await applyTemplate(templateId);
  }

  const categoryLabel = template.categoryId ? categoryMap.get(template.categoryId) : undefined;
  const recurrenceLabel = template.suggestedRecurrenceType
    ? ROUTINE_RECURRENCE_LABELS[template.suggestedRecurrenceType]
    : ROUTINE_RECURRENCE_LABELS[RecurrenceType.Daily];

  return (
    <div className="space-y-6">
      <RoutineApplyDialogs {...dialogProps} />

      <Link
        to="/routines"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver a rutinas
      </Link>

      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
          <LayoutList className="h-8 w-8" aria-hidden />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{template.name}</h2>
          {template.description && (
            <p className="mt-2 text-slate-600">{template.description}</p>
          )}
          <ul className="mt-3 flex flex-wrap gap-2 text-xs">
            {categoryLabel && (
              <li className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                {categoryLabel}
              </li>
            )}
            <li className="rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
              {recurrenceLabel}
            </li>
            {totalDuration > 0 && (
              <li className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                <Clock className="h-3.5 w-3.5" aria-hidden />~{formatDurationMinutes(totalDuration)}
              </li>
            )}
          </ul>
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {!activeProfileId && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Selecciona un perfil para aplicar esta rutina.
        </p>
      )}

      <Card padding="lg">
        <h3 className="text-lg font-bold text-slate-900">Pasos de la rutina</h3>
        <p className="mt-1 text-sm text-slate-500">
          Hora sugerida desde las {formatTimeMinutes(anchorMinutes)}
        </p>
        <ol className="mt-6 space-y-4">
          {sortedSteps.map((step, index) => {
            const stepTime = anchorMinutes + step.offsetMinutes;
            const pictogramLabel = pictogramMap.get(step.pictogramId) ?? step.pictogramId;
            const stepCategory = categoryMap.get(step.categoryId);

            return (
              <li
                key={`${step.title}-${index}`}
                className="flex gap-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-indigo-700 ring-1 ring-indigo-100">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{step.title}</p>
                    <span className="text-sm font-medium text-indigo-600">
                      {formatTimeMinutes(stepTime)}
                    </span>
                  </div>
                  {step.description && (
                    <p className="mt-1 text-sm text-slate-600">{step.description}</p>
                  )}
                  <p className="mt-2 text-xs text-slate-500">
                    Pictograma: {pictogramLabel}
                    {stepCategory ? ` · ${stepCategory}` : ''}
                    {step.durationMinutes ? ` · ${step.durationMinutes} min` : ''}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      <Button
        fullWidth
        disabled={!activeProfileId || isApplying}
        onClick={() => void handleApply()}
      >
        {isApplying ? 'Aplicando…' : 'Aplicar al perfil activo'}
      </Button>
    </div>
  );
}
