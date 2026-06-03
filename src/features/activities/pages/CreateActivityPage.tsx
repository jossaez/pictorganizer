import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ActivityForm } from '@/features/activities/components/ActivityForm';
import { useActivityRecurrence } from '@/features/activities/hooks/useActivityRecurrence';
import type { ActivityFormData } from '@/features/activities/types/activity-form.types';
import { useProfileRoutines } from '@/features/routines/hooks/useProfileRoutines';
import { useAppStore } from '@/store/app.store';
import { todayISODate } from '@/utils/today';

export function CreateActivityPage() {
  const navigate = useNavigate();
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const selectedDate = useAppStore((s) => s.selectedDate);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const { createRecurringActivity, isMutating, error } = useActivityRecurrence();
  const { routines } = useProfileRoutines(activeProfileId);

  if (!activeProfileId) {
    return (
      <div className="flex min-h-full flex-col bg-[var(--color-bg)] px-4 py-8">
        <p className="text-slate-600">Selecciona un perfil para crear actividades.</p>
        <Button className="mt-4" onClick={() => navigate('/profiles')}>
          Ir a perfiles
        </Button>
      </div>
    );
  }

  async function handleSubmit(form: ActivityFormData): Promise<void> {
    const result = await createRecurringActivity(form, activeProfileId!);
    if (result) {
      setSelectedDate(form.startDate);
      navigate('/agenda', {
        replace: true,
        state: { message: 'Actividad creada' },
      });
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-[var(--color-bg)] px-4 py-8 md:px-8">
      <div className="mx-auto w-full max-w-lg md:max-w-xl">
        <Button variant="ghost" className="mb-4 gap-2 px-0" onClick={() => navigate('/agenda')}>
          <ArrowLeft className="h-5 w-5" aria-hidden />
          Volver a la agenda
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Plus className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Nueva actividad</h1>
            <p className="text-slate-600">Añade una actividad personalizada a la agenda.</p>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <div className="mt-8">
          <ActivityForm
            mode="create"
            routines={routines}
            isSubmitting={isMutating}
            initialData={{
              startDate: selectedDate || todayISODate(),
              categoryId: '',
            }}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/agenda')}
          />
        </div>
      </div>
    </div>
  );
}
