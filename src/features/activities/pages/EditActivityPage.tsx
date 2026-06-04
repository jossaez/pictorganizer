import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { RecurrenceType } from '@/domain/enums';
import { EditScope } from '@/domain/types/entities';
import { Button } from '@/components/ui/Button';
import { ActivityForm } from '@/features/activities/components/ActivityForm';
import {
  DeleteOccurrenceSelector,
  type DeleteOccurrenceChoice,
} from '@/features/activities/components/DeleteOccurrenceSelector';
import { EditScopeSelector } from '@/features/activities/components/EditScopeSelector';
import { useActivityRecurrence } from '@/features/activities/hooks/useActivityRecurrence';
import type { ActivityFormData } from '@/features/activities/types/activity-form.types';
import type { EditScopeChoice } from '@/features/activities/utils/activity-form.utils';
import { instanceToFormData } from '@/features/activities/utils/activity-form.utils';
import { activityRepository } from '@/infrastructure/repositories';
import { useAppStore } from '@/store/app.store';
import { formatDisplayDate } from '@/utils/formatDate';

export function EditActivityPage() {
  const { t } = useTranslation();
  const { instanceId } = useParams<{ instanceId: string }>();
  const navigate = useNavigate();
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const {
    updateSingleOccurrence,
    updateFutureOccurrences,
    deleteSingleOccurrence,
    deleteFutureOccurrences,
    isMutating,
    error,
    isRecurringTemplate,
  } = useActivityRecurrence();

  const [editScope, setEditScope] = useState<EditScopeChoice>(EditScope.ThisInstanceOnly);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteChoice, setDeleteChoice] = useState<DeleteOccurrenceChoice>('single');
  const [deleteConfirming, setDeleteConfirming] = useState(false);

  const instance = useLiveQuery(
    () => (instanceId ? activityRepository.getInstanceById(instanceId) : undefined),
    [instanceId],
  );

  const template = useLiveQuery(
    () =>
      instance?.templateId
        ? activityRepository.getTemplateById(instance.templateId)
        : undefined,
    [instance?.templateId],
  );

  const isLoading = instance === undefined || (instance?.templateId && template === undefined);
  const hasRecurringTemplate =
    template != null && isRecurringTemplate(template) && template.recurrence.type !== RecurrenceType.Once;

  if (!instanceId) {
    return (
      <div className="px-4 py-8">
        <p className="text-red-700">Actividad no válida.</p>
        <Button className="mt-4" onClick={() => navigate('/agenda')}>
          Volver a la agenda
        </Button>
      </div>
    );
  }

  if (!isLoading && (!instance || instance.deletedAt)) {
    return (
      <div className="px-4 py-8">
        <p className="text-slate-600">Esta actividad no existe.</p>
        <Button className="mt-4" onClick={() => navigate('/agenda')}>
          Volver a la agenda
        </Button>
      </div>
    );
  }

  if (activeProfileId && instance && instance.profileId !== activeProfileId) {
    return (
      <div className="px-4 py-8">
        <p className="text-slate-600">Esta actividad pertenece a otro perfil.</p>
        <Button className="mt-4" onClick={() => navigate('/agenda')}>
          Volver a la agenda
        </Button>
      </div>
    );
  }

  if (isLoading || !instance) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[var(--color-bg)] px-4 py-8">
        <p className="text-slate-500">Cargando actividad…</p>
      </div>
    );
  }

  const initialData = instanceToFormData(instance, template);

  async function handleSubmit(form: ActivityFormData): Promise<void> {
    const scope = hasRecurringTemplate ? editScope : EditScope.ThisInstanceOnly;

    if (scope === EditScope.ThisInstanceOnly) {
      const updated = await updateSingleOccurrence(instance!.id, form);
      if (updated) {
        navigate('/agenda', {
          replace: true,
          state: { message: t('activity.flash.updated') },
        });
      }
      return;
    }

    const result = await updateFutureOccurrences(instance!, form, scope);
    if (result) {
      navigate('/agenda', {
        replace: true,
        state: { message: t('activity.flash.futureUpdated') },
      });
    }
  }

  async function handleDelete(): Promise<void> {
    setDeleteConfirming(true);
    const success =
      deleteChoice === 'single' || !hasRecurringTemplate
        ? await deleteSingleOccurrence(instance!.id)
        : await deleteFutureOccurrences(instance!);

    setDeleteConfirming(false);
    if (success) {
      navigate('/agenda', {
        replace: true,
        state: { message: t('activity.flash.deleted') },
      });
    }
  }

  return (
    <div className="safe-top safe-x safe-bottom flex min-h-full flex-col bg-[var(--color-bg)] px-4 py-8 md:px-8">
      <div className="mx-auto w-full max-w-lg md:max-w-xl">
        <Button variant="ghost" className="mb-4 gap-2 px-0" onClick={() => navigate('/agenda')}>
          <ArrowLeft className="h-5 w-5" aria-hidden />
          Volver a la agenda
        </Button>

        <h1 className="text-2xl font-bold text-slate-900">Editar actividad</h1>
        <p className="mt-1 capitalize text-slate-600">{formatDisplayDate(instance.date)}</p>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6">
          <EditScopeSelector
            value={editScope}
            onChange={setEditScope}
            hasTemplate={hasRecurringTemplate}
          />
        </div>

        <div className="mt-8">
          <ActivityForm
            key={instance.id}
            mode="edit"
            initialData={initialData}
            showRecurrence={editScope === EditScope.ThisAndFuture && hasRecurringTemplate}
            isSubmitting={isMutating}
            submitLabel="Guardar"
            onSubmit={handleSubmit}
            onCancel={() => navigate('/agenda')}
          />
        </div>

        <div className="mt-10 border-t border-slate-200 pt-8">
          {!showDelete ? (
            <Button
              type="button"
              variant="secondary"
              className="w-full gap-2 text-red-700 ring-red-200 hover:bg-red-50"
              onClick={() => setShowDelete(true)}
            >
              <Trash2 className="h-5 w-5" aria-hidden />
              Eliminar actividad
            </Button>
          ) : (
            <div className="space-y-4">
              <DeleteOccurrenceSelector
                value={deleteChoice}
                onChange={setDeleteChoice}
                hasTemplate={hasRecurringTemplate}
              />
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  disabled={deleteConfirming}
                  onClick={() => setShowDelete(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={deleteConfirming || isMutating}
                  onClick={() => void handleDelete()}
                >
                  {deleteConfirming ? 'Eliminando…' : 'Confirmar eliminación'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
