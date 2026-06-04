import { ProfileAvatar } from '@/components/media/ProfileAvatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PinSetupFlow } from '@/features/adult-mode/components/PinSetupFlow';
import { DeviceLayoutSelector } from '@/features/onboarding/components/DeviceLayoutSelector';
import { ProfilePhotoPicker } from '@/features/onboarding/components/ProfilePhotoPicker';
import { ProfileColorPicker } from '@/features/profiles/components/ProfileColorPicker';
import { DetailLevelSelector } from '@/features/onboarding/components/DetailLevelSelector';
import { InitialRoutinesSelector } from '@/features/onboarding/components/InitialRoutinesSelector';
import { OnboardingLayout } from '@/features/onboarding/components/OnboardingLayout';
import { OnboardingWelcomeStep } from '@/features/onboarding/components/OnboardingWelcomeStep';
import {
  detailLevelLabel,
  deviceLayoutLabel,
  useOnboardingFlow,
} from '@/features/onboarding/hooks/useOnboardingFlow';
import { LanguageSelectionPage } from '@/features/onboarding/pages/LanguageSelectionPage';
import { ONBOARDING_STEP_COUNT } from '@/features/onboarding/types/onboarding.types';
import { useAppStore } from '@/store/app.store';
import { cn } from '@/utils/cn';
import { useTranslation } from 'react-i18next';

export function OnboardingPage() {
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);
  const {
    step,
    draft,
    routineTemplates,
    stepError,
    canGoNext,
    routinesRecommended,
    submitError,
    isSubmitting,
    isLoadingCatalog,
    updateDraft,
    updateProfilePhoto,
    goNext,
    goBack,
    toggleRoutine,
    submit,
  } = useOnboardingFlow();

  const selectedRoutineNames = routineTemplates
    .filter((tpl) => draft.selectedRoutineTemplateIds.includes(tpl.id))
    .map((tpl) => tpl.name);

  function handleNext(): void {
    if (step === ONBOARDING_STEP_COUNT - 1) {
      void submit();
      return;
    }
    goNext();
  }

  const nextLabel =
    step === 1
      ? t('common.start')
      : step === ONBOARDING_STEP_COUNT - 1
        ? t('onboarding.createAgenda')
        : t('common.continue');

  return (
    <OnboardingLayout
      currentStep={step}
      totalSteps={ONBOARDING_STEP_COUNT}
      welcomeMode={step === 1}
      showBack={step > 0}
      showNext={step !== 0}
      nextLabel={nextLabel}
      nextDisabled={!canGoNext || isSubmitting || (step === 6 && isLoadingCatalog)}
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
        <LanguageSelectionPage
          selectedLanguage={language}
          onSelected={() => goNext()}
        />
      )}

      {step === 1 && <OnboardingWelcomeStep />}

      {step === 2 && (
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{t('onboarding.stepName.title')}</h1>
          <p className="mt-2 text-slate-600">{t('onboarding.stepName.hint')}</p>
          <label className="mt-8 block">
            <span className="sr-only">{t('onboarding.stepName.label')}</span>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => updateDraft({ name: e.target.value })}
              placeholder={t('onboarding.stepName.placeholder')}
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

      {step === 3 && (
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{t('onboarding.stepPhotoColor.title')}</h1>
          <p className="mt-2 text-slate-600">{t('onboarding.stepPhotoColor.hint')}</p>
          <div className="mt-6 space-y-8">
            <ProfilePhotoPicker
              name={draft.name}
              color={draft.color}
              previewUrl={draft.profilePhotoPreviewUrl}
              onPhotoChange={updateProfilePhoto}
            />
            <ProfileColorPicker
              value={draft.color}
              onChange={(color) => updateDraft({ color })}
            />
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{t('onboarding.stepDevice.title')}</h1>
          <p className="mt-2 text-slate-600">{t('onboarding.stepDevice.hint')}</p>
          <div className="mt-6">
            <DeviceLayoutSelector
              value={draft.preferredDeviceLayout}
              onChange={(preferredDeviceLayout) => updateDraft({ preferredDeviceLayout })}
            />
          </div>
        </div>
      )}

      {step === 5 && (
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{t('onboarding.stepDetail.title')}</h1>
          <p className="mt-2 text-slate-600">{t('onboarding.stepDetail.hint')}</p>
          <div className="mt-6">
            <DetailLevelSelector
              value={draft.childModeDetailLevel}
              onChange={(childModeDetailLevel) => updateDraft({ childModeDetailLevel })}
            />
          </div>
        </div>
      )}

      {step === 6 && (
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{t('onboarding.stepRoutines.title')}</h1>
          <p className="mt-2 text-slate-600">{t('onboarding.stepRoutines.hint')}</p>
          <div className="mt-6">
            {isLoadingCatalog ? (
              <p className="text-slate-500">{t('onboarding.loadingRoutines')}</p>
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

      {step === 7 && (
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{t('onboarding.stepPin.title')}</h1>
          <p className="mt-2 text-slate-600">{t('onboarding.stepPin.hint')}</p>
          <p className="mt-2 text-sm font-medium text-slate-700">{t('onboarding.stepPin.instructions')}</p>
          <div className="mt-6">
            {draft.adultPinHash ? (
              <div className="rounded-2xl bg-emerald-50 px-4 py-4 text-center">
                <p className="font-semibold text-emerald-800">{t('onboarding.stepPin.configured')}</p>
                <p className="mt-1 text-sm text-emerald-700">{t('onboarding.stepPin.continueHint')}</p>
              </div>
            ) : (
              <>
                <PinSetupFlow
                  title={t('onboarding.stepPin.chooseTitle')}
                  description={t('onboarding.stepPin.chooseDescription')}
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
                  {t('onboarding.stepPin.skip')}
                </Button>
                {draft.pinSkipped && (
                  <p className="mt-3 text-center text-sm text-slate-600">
                    {t('onboarding.stepPin.skipLater')}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {step === 8 && (
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{t('onboarding.stepSummary.title')}</h1>
          <p className="mt-2 text-slate-600">{t('onboarding.stepSummary.hint')}</p>
          <Card className="mt-6 space-y-4" padding="lg">
            <SummaryRow label={t('onboarding.stepSummary.name')} value={draft.name.trim() || t('common.dash')} />
            <div className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('onboarding.stepSummary.photoColor')}
              </p>
              <div className="mt-2 flex items-center gap-3">
                {draft.profilePhotoPreviewUrl ? (
                  <img
                    src={draft.profilePhotoPreviewUrl}
                    alt={t('onboarding.stepPhotoColor.photoAlt', {
                      name: draft.name.trim() || t('common.profile'),
                    })}
                    className="h-10 w-10 shrink-0 rounded-full object-cover shadow-sm"
                  />
                ) : (
                  <ProfileAvatar
                    profile={{
                      name: draft.name.trim() || t('common.profile'),
                      color: draft.color,
                      avatarId: draft.avatarId ?? undefined,
                    }}
                    size="sm"
                    className="!rounded-full"
                  />
                )}
                <span className="text-base font-medium text-slate-900">
                  {draft.profilePhotoPreviewUrl
                    ? t('onboarding.stepSummary.photoAdded')
                    : t('onboarding.stepSummary.initialColor')}
                </span>
              </div>
            </div>
            <SummaryRow
              label={t('onboarding.stepSummary.device')}
              value={deviceLayoutLabel(draft.preferredDeviceLayout)}
            />
            <SummaryRow
              label={t('onboarding.stepSummary.detail')}
              value={detailLevelLabel(draft.childModeDetailLevel)}
            />
            <SummaryRow
              label={t('onboarding.stepSummary.routines')}
              value={
                selectedRoutineNames.length > 0
                  ? selectedRoutineNames.join(', ')
                  : t('onboarding.stepSummary.routinesNone')
              }
            />
            <SummaryRow
              label={t('onboarding.stepSummary.pin')}
              value={
                draft.adultPinHash
                  ? t('onboarding.stepSummary.pinConfigured')
                  : t('onboarding.stepSummary.pinNotConfigured')
              }
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
