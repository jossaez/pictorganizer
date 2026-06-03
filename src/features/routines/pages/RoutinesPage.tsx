import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoutineApplyDialogs } from '@/features/routines/components/RoutineApplyDialogs';
import { useProfileRoutines } from '@/features/routines/hooks/useProfileRoutines';
import { useRoutineApplyFlow } from '@/features/routines/hooks/useRoutineApplyFlow';
import { useRoutineTemplates } from '@/features/routines/hooks/useRoutineTemplates';
import { RoutineTemplateCard } from '@/features/routines/components/RoutineTemplateCard';
import { useDevice } from '@/hooks/useDevice';
import { cn } from '@/utils/cn';

export function RoutinesPage() {
  const navigate = useNavigate();
  const { routineTemplates, categoryMap, isLoading } = useRoutineTemplates();
  const { activeProfileId, isApplying, error, applyTemplate, dialogProps } = useRoutineApplyFlow();
  const { routines: profileRoutines } = useProfileRoutines(activeProfileId);
  const { isEffectiveTablet } = useDevice();

  const grouped = useMemo(() => {
    const groups = new Map<string, typeof routineTemplates>();
    for (const template of routineTemplates) {
      const key = template.categoryId ?? 'other';
      const list = groups.get(key) ?? [];
      list.push(template);
      groups.set(key, list);
    }
    return groups;
  }, [routineTemplates]);

  async function handleApply(templateId: string): Promise<void> {
    if (!activeProfileId) {
      navigate('/profiles');
      return;
    }
    await applyTemplate(templateId);
  }

  return (
    <div className="space-y-6">
      <RoutineApplyDialogs {...dialogProps} />

      <div>
        <h2 className="text-2xl font-bold text-slate-900">Rutinas</h2>
        <p className="mt-1 text-slate-600">
          Biblioteca de rutinas preparadas para añadir a la agenda.
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {!activeProfileId && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Selecciona un perfil para aplicar rutinas.{' '}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => navigate('/profiles')}
          >
            Ir a perfiles
          </button>
        </p>
      )}

      {activeProfileId && profileRoutines.length > 0 && (
        <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Este perfil tiene {profileRoutines.length} rutina
          {profileRoutines.length === 1 ? '' : 's'} aplicada
          {profileRoutines.length === 1 ? '' : 's'}.
        </p>
      )}

      {isLoading ? (
        <p className="text-slate-500">Cargando rutinas…</p>
      ) : (
        <div className="space-y-8">
          {[...grouped.entries()].map(([categoryId, templates]) => (
            <section key={categoryId}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                {categoryMap.get(categoryId) ?? 'Otras rutinas'}
              </h3>
              <ul
                className={cn(
                  'gap-4',
                  isEffectiveTablet ? 'grid grid-cols-2' : 'space-y-4',
                )}
              >
                {templates.map((template) => (
                  <li key={template.id}>
                    <RoutineTemplateCard
                      template={template}
                      categoryLabel={
                        template.categoryId ? categoryMap.get(template.categoryId) : undefined
                      }
                      disabled={!activeProfileId}
                      isApplying={isApplying}
                      onApply={() => void handleApply(template.id)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
