import { CalendarHeart } from 'lucide-react';
import { ProfileAvatar } from '@/components/media/ProfileAvatar';
import { Button } from '@/components/ui/Button';
import { PinSetupFlow } from '@/features/adult-mode/components/PinSetupFlow';
import { OnboardingLayout } from '@/features/onboarding/components/OnboardingLayout';
import { AvatarPicker } from '@/features/onboarding/components/AvatarPicker';
import { DeviceLayoutSelector } from '@/features/onboarding/components/DeviceLayoutSelector';
import { DetailLevelSelector } from '@/features/onboarding/components/DetailLevelSelector';
import { InitialRoutinesSelector } from '@/features/onboarding/components/InitialRoutinesSelector';
import {
  detailLevelLabel,
  deviceLayoutLabel,
  useOnboardingFlow,
} from '@/features/onboarding/hooks/useOnboardingFlow';
import { ONBOARDING_STEP_COUNT } from '@/features/onboarding/types/onboarding.types';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

export function OnboardingPage() {
  const {
    step,
    draft,
    avatars,
    routineTemplates,
    stepError,
    canGoNext,
    routinesRecommended,
    submitError,
    isSubmitting,
    isLoadingCatalog,
    updateDraft,
    goNext,
    goBack,
    toggleRoutine,
    submit,
  } = useOnboardingFlow();

  const selectedRoutineNames = routineTemplates
    .filter((t) => draft.selectedRoutineTemplateIds.includes(t.id))
    .map((t) => t.name);

  function handleNext(): void {
    if (step === ONBOARDING_STEP_COUNT - 1) {
      void submit();
      return;
    }
    goNext();
  }

  return (
    <OnboardingLayout
      currentStep={step}
      totalSteps={ONBOARDING_STEP_COUNT}
      showBack={step > 0}
      showNext
      nextLabel={step === 0 ? 'Empezar' : step === ONBOARDING_STEP_COUNT - 1 ? 'Crear agenda' : 'Continuar'}
      nextDisabled={!canGoNext || isSubmitting || (step >= 2 && isLoadingCatalog)}
      isLoading={isSubmitting}
      onBack={goBack}
      onNext={handleNext}
    >
      {(stepError || submitError || routinesRecommended) && step > 0 && (
        <div className="mb-4 space-y-2">
          {stepError && (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800" role="alert">
              {stepError}
            </p>
          )}
          {routinesRecommended && (
            <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">{routinesRecommended}</p>
          )}
          {submitError && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {submitError}
            </p>
          )}
        </div>
      )}

      {step === 0 && (
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--color-primary)] text-white shadow-lg">
            <CalendarHeart className="h-10 w-10" aria-hidden />
          </div>
          <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]">
            PICTORGANIZER
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Bienvenida</h1>
          <p className="mx-auto mt-4 max-w-sm text-lg leading-relaxed text-slate-600">
            Vamos a crear una agenda visual para organizar el día con más calma y claridad.
          </p>
        </div>
      )}

      {step === 1 && (
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">¿Cómo se llama?</h1>
          <p className="mt-2 text-slate-600">Usaremos este nombre para personalizar la agenda.</p>
          <label className="mt-8 block">
            <span className="sr-only">Nombre</span>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => updateDraft({ name: e.target.value })}
              placeholder="Lucas"
              autoFocus
              maxLength={50}
              className={cn(
                'mt-2 w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xl',
                'focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20',
              )}
            />
          </label>
        </div>
      )}

      {step === 2 && (
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Avatar y color</h1>
          <p className="mt-2 text-slate-600">Elige cómo se verá el perfil en la agenda.</p>
          <div className="mt-6">
            {isLoadingCatalog ? (
              <p className="text-slate-500">Cargando avatares…</p>
            ) : (
              <AvatarPicker
                avatars={avatars}
                selectedAvatarId={draft.avatarId}
                selectedColor={draft.color}
                onSelectAvatar={(avatarId) => updateDraft({ avatarId })}
                onSelectColor={(color) => updateDraft({ color })}
              />
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Tipo de dispositivo</h1>
          <p className="mt-2 text-slate-600">Podrás cambiarlo más adelante desde ajustes.</p>
          <div className="mt-6">
            <DeviceLayoutSelector
              value={draft.preferredDeviceLayout}
              onChange={(preferredDeviceLayout) => updateDraft({ preferredDeviceLayout })}
            />
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Nivel de detalle</h1>
          <p className="mt-2 text-slate-600">Elige cuánta información verá en la agenda.</p>
          <div className="mt-6">
            <DetailLevelSelector
              value={draft.childModeDetailLevel}
              onChange={(childModeDetailLevel) => updateDraft({ childModeDetailLevel })}
            />
          </div>
        </div>
      )}

      {step === 5 && (
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Rutinas iniciales</h1>
          <p className="mt-2 text-slate-600">
            Selecciona las rutinas que quieres añadir a la agenda (opcional, pero recomendado).
          </p>
          <div className="mt-6">
            {isLoadingCatalog ? (
              <p className="text-slate-500">Cargando rutinas…</p>
            ) : (
              <InitialRoutinesSelector
                templates={routineTemplates}
                selectedIds={draft.selectedRoutineTemplateIds}
                onToggle={toggleRoutine}
              />
            )}
          </div>
        </div>
      )}

      {step === 6 && (
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Crear PIN de adulto</h1>
          <p className="mt-2 text-slate-600">
            Protege los ajustes y la edición de la agenda. Opcional, pero recomendado.
          </p>
          <p className="mt-2 text-sm font-medium text-slate-700">
            Escribe un PIN de 4 números y repítelo después para confirmarlo.
          </p>
          <div className="mt-6">
            {draft.adultPinHash ? (
              <div className="rounded-2xl bg-emerald-50 px-4 py-4 text-center">
                <p className="font-semibold text-emerald-800">PIN configurado</p>
                <p className="mt-1 text-sm text-emerald-700">Pulsa Continuar para seguir.</p>
              </div>
            ) : (
              <>
                <PinSetupFlow
                  title="Elige 4 números"
                  description="Lo escribirás dos veces: primero el PIN y luego la misma combinación para confirmar."
                  onComplete={(hash) => updateDraft({ adultPinHash: hash, pinSkipped: false })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-6 w-full min-h-12"
                  onClick={() => {
                    updateDraft({ pinSkipped: true, adultPinHash: null });
                    goNext();
                  }}
                >
                  Omitir por ahora
                </Button>
                {draft.pinSkipped && (
                  <p className="mt-3 text-center text-sm text-slate-600">
                    Podrás configurarlo más adelante desde Ajustes.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {step === 7 && (
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Todo listo</h1>
          <p className="mt-2 text-slate-600">Revisa la configuración antes de crear la agenda.</p>
          <Card className="mt-6 space-y-4" padding="lg">
            <SummaryRow label="Nombre" value={draft.name.trim() || '—'} />
            <div className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Avatar / color</p>
              {draft.avatarId ? (
                <div className="mt-2 flex items-center gap-3">
                  <ProfileAvatar
                    profile={{
                      name: draft.name.trim() || 'Perfil',
                      avatarId: draft.avatarId,
                      color: draft.color,
                    }}
                    size="sm"
                    avatars={avatars}
                  />
                  <span className="text-base font-medium text-slate-900">
                    {avatars.find((a) => a.id === draft.avatarId)?.label ?? draft.avatarId}
                  </span>
                </div>
              ) : (
                <p className="mt-1 text-base font-medium text-slate-900">—</p>
              )}
            </div>
            <SummaryRow label="Dispositivo" value={deviceLayoutLabel(draft.preferredDeviceLayout)} />
            <SummaryRow label="Detalle visual" value={detailLevelLabel(draft.childModeDetailLevel)} />
            <SummaryRow
              label="Rutinas"
              value={
                selectedRoutineNames.length > 0
                  ? selectedRoutineNames.join(', ')
                  : 'Ninguna (podrás añadirlas después)'
              }
            />
            <SummaryRow
              label="PIN de adulto"
              value={draft.adultPinHash ? 'Configurado' : 'Sin configurar'}
            />
          </Card>
        </div>
      )}
    </OnboardingLayout>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-base font-medium text-slate-900">{value}</p>
    </div>
  );
}
