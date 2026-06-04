import { ChevronRight } from 'lucide-react';
import { useCallback, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { ProfileAvatar } from '@/components/media/ProfileAvatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SelectRow } from '@/features/settings/components/SelectRow';
import { ToggleRow } from '@/features/settings/components/ToggleRow';
import { ResetAppDialog } from '@/features/settings/components/ResetAppDialog';
import { AdultPinSettings } from '@/features/settings/components/AdultPinSettings';
import { LockAdultModeButton } from '@/features/adult-mode/components/LockAdultModeButton';
import {
  CELEBRATION_STYLE_LABEL_KEYS,
  CHILD_DETAIL_LEVEL_LABEL_KEYS,
  DEVICE_LAYOUT_LABEL_KEYS,
  NOTIFICATION_TIMING_LABEL_KEYS,
  TIMER_STYLE_LABEL_KEYS,
} from '@/features/settings/constants/settings-labels';
import { LanguageSelectionPage } from '@/features/onboarding/pages/LanguageSelectionPage';
import { useLanguage } from '@/hooks/useLanguage';
import { useDatabaseMaintenance, useDatabaseSummary } from '@/features/settings/hooks/useDatabaseMaintenance';
import { useNotificationReminders } from '@/features/settings/hooks/useNotificationReminders';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { resetDatabase } from '@/infrastructure/database/database-maintenance.service';
import { useAvatars } from '@/features/profiles/hooks/useAvatars';
import { useProfiles } from '@/features/profiles/hooks/useProfiles';
import {
  CelebrationStyle,
  ChildModeDetailLevel,
  DeviceLayout,
  TimerStyle,
} from '@/domain/enums';
import { normalizeCelebrationStyle } from '@/domain/celebration/celebration-style.utils';
import { useDevice } from '@/hooks/useDevice';
import { useAppStore } from '@/store/app.store';
import { cn } from '@/utils/cn';

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      <Card className="mt-3 divide-y divide-slate-100">{children}</Card>
    </section>
  );
}

export function SettingsPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const setUserMode = useAppStore((s) => s.setUserMode);
  const lockAdultSession = useAppStore((s) => s.lockAdultSession);
  const reduceMotion = useAppStore((s) => s.reduceMotion);
  const largeText = useAppStore((s) => s.largeText);
  const highContrast = useAppStore((s) => s.highContrast);
  const preferredDeviceLayout = useAppStore((s) => s.preferredDeviceLayout);
  const { deviceType, effectiveLayout, orientation, isEffectiveTablet } = useDevice();
  const { activeProfile } = useProfiles();
  const { avatars } = useAvatars();

  const {
    profileSettings,
    isProfileSettingsLoading,
    error,
    isSaving,
    setAccessibility,
    updateProfileSettings,
  } = useSettings(activeProfileId);

  const celebrationOptions = Object.values(CelebrationStyle).map((value) => ({
    value,
    label: t(CELEBRATION_STYLE_LABEL_KEYS[value]),
  }));

  const timerOptions = Object.values(TimerStyle).map((value) => ({
    value,
    label: t(TIMER_STYLE_LABEL_KEYS[value]),
  }));

  const detailOptions = Object.values(ChildModeDetailLevel).map((value) => ({
    value,
    label: t(CHILD_DETAIL_LEVEL_LABEL_KEYS[value]),
  }));

  const deviceOptions = Object.values(DeviceLayout).map((value) => ({
    value,
    label: t(DEVICE_LAYOUT_LABEL_KEYS[value]),
  }));

  const notificationTimingOptions = NOTIFICATION_TIMING_LABEL_KEYS.map((opt) => ({
    value: String(opt.value),
    label: t(opt.labelKey),
  }));

  const [reminderMessage, setReminderMessage] = useState<string | null>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [cleanupConfirmOpen, setCleanupConfirmOpen] = useState(false);

  const { summary: dbSummary, isLoading: isDbSummaryLoading } = useDatabaseSummary();
  const {
    integrityReport,
    cleanupResult,
    isRunning: isMaintenanceRunning,
    error: maintenanceError,
    runIntegrityCheck,
    runCleanup,
  } = useDatabaseMaintenance();

  const handlePermissionDenied = useCallback(() => {
    setReminderMessage(t('settings.allowNotificationsHint'));
  }, [t]);

  const notificationsEnabled = profileSettings?.notificationsEnabled ?? false;

  const {
    platform: notificationPlatform,
    permission: notificationPermission,
    isRequesting: isRequestingNotifications,
    handleEnableReminders,
    handleDisableReminders,
    handleTimingChange,
    requestNotificationPermissions,
  } = useNotificationReminders(activeProfileId, notificationsEnabled, handlePermissionDenied);

  async function handleToggleReminders(on: boolean): Promise<void> {
    if (!activeProfileId) return;
    setReminderMessage(null);

    if (on) {
      const granted = await handleEnableReminders();
      if (!granted) {
        await updateProfileSettings(activeProfileId, { notificationsEnabled: false });
        return;
      }
      await updateProfileSettings(activeProfileId, { notificationsEnabled: true });
      return;
    }

    await handleDisableReminders();
    await updateProfileSettings(activeProfileId, { notificationsEnabled: false });
  }

  async function handleNotificationTimingChange(value: string): Promise<void> {
    if (!activeProfileId) return;
    const minutes = Number(value);
    await updateProfileSettings(activeProfileId, { notificationMinutesBefore: minutes });
    await handleTimingChange();
  }

  async function handleRescheduleReminders(): Promise<void> {
    if (!activeProfileId) return;
    setReminderMessage(null);
    const granted = await handleEnableReminders();
    if (granted) {
      setReminderMessage(t('settings.remindersRescheduled'));
    }
  }

  async function handleCancelReminders(): Promise<void> {
    if (!activeProfileId) return;
    setReminderMessage(null);
    await handleDisableReminders();
    setReminderMessage(t('settings.remindersCancelled'));
  }

  function handleEnterChildMode(): void {
    lockAdultSession();
    setUserMode('child');
    navigate('/child');
  }

  function formatLastUpdate(iso: string | null | undefined): string {
    if (!iso) return t('settings.data.noData');
    try {
      return new Date(iso).toLocaleString('es-ES', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return iso;
    }
  }

  async function handleConfirmReset(): Promise<void> {
    setIsResetting(true);
    try {
      await resetDatabase();
      window.location.assign('/onboarding');
    } catch (err) {
      console.error('[SettingsPage] reset:', err);
      setIsResetting(false);
    }
  }

  async function handleConfirmCleanup(): Promise<void> {
    setCleanupConfirmOpen(false);
    await runCleanup();
  }

  return (
    <div
      className={cn(
        'space-y-8',
        isEffectiveTablet && 'grid grid-cols-2 items-start gap-x-8 gap-y-8',
      )}
    >
      <div className={cn('space-y-8', isEffectiveTablet && 'col-span-2')}>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t('settings.title')}</h2>
          <p className="mt-1 text-slate-600">{t('settings.subtitle')}</p>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="space-y-8">
        <SettingsSection title={t('language.section')} description={t('language.subtitle')}>
          <div className="py-3">
            <LanguageSelectionPage compact selectedLanguage={language} onSelected={() => {}} />
          </div>
        </SettingsSection>

        <SettingsSection
          title={t('settings.activeProfile')}
          description={t('settings.activeProfileHint')}
        >
          {activeProfile ? (
            <div className="flex items-center gap-4 px-1 py-2">
              <ProfileAvatar profile={activeProfile} size="md" avatars={avatars} />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900">{activeProfile.name}</p>
                <p className="text-sm text-slate-500">{t('adultMode.selectedProfile')}</p>
              </div>
              <Link
                to="/profiles"
                className="flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)]"
              >
                {t('common.change')}
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          ) : (
            <div className="py-3">
              <p className="text-slate-600">{t('settings.noActiveProfile')}</p>
              <Link to="/profiles" className="mt-2 inline-block text-sm font-semibold text-[var(--color-primary)]">
                {t('settings.chooseProfile')}
              </Link>
            </div>
          )}
        </SettingsSection>

        <SettingsSection
          title={t('settings.visualPrefs')}
          description={t('settings.visualPrefsHint')}
        >
          {!activeProfileId ? (
            <p className="py-3 text-sm text-slate-500">{t('settings.selectProfilePrefs')}</p>
          ) : isProfileSettingsLoading || !profileSettings ? (
            <p className="py-3 text-sm text-slate-500">{t('settings.loadingPrefs')}</p>
          ) : (
            <>
              <ToggleRow
                label={t('settings.showTimer')}
                description={t('settings.showTimerHint')}
                checked={profileSettings.showTimer}
                disabled={isSaving}
                onChange={(on) =>
                  void updateProfileSettings(activeProfileId, { showTimer: on })
                }
              />
              <ToggleRow
                label={t('settings.showAnticipation')}
                description={t('settings.showAnticipationHint')}
                checked={profileSettings.showAnticipation}
                disabled={isSaving}
                onChange={(on) =>
                  void updateProfileSettings(activeProfileId, { showAnticipation: on })
                }
              />
              <SelectRow
                label={t('settings.celebrationType')}
                description={t('settings.celebrationHint')}
                value={normalizeCelebrationStyle(profileSettings.celebrationStyle)}
                options={celebrationOptions}
                disabled={isSaving}
                onChange={(value) =>
                  void updateProfileSettings(activeProfileId, { celebrationStyle: value })
                }
              />
              <SelectRow
                label={t('settings.timerStyle')}
                value={profileSettings.timerStyle}
                options={timerOptions}
                disabled={isSaving}
                onChange={(value) =>
                  void updateProfileSettings(activeProfileId, { timerStyle: value })
                }
              />
            </>
          )}
        </SettingsSection>

        <SettingsSection
          title={t('settings.reminders')}
          description={t('settings.remindersHint')}
        >
          {!activeProfileId ? (
            <p className="py-3 text-sm text-slate-500">{t('settings.selectProfileReminders')}</p>
          ) : isProfileSettingsLoading || !profileSettings ? (
            <p className="py-3 text-sm text-slate-500">{t('settings.loadingPrefs')}</p>
          ) : !notificationPlatform.supported ? (
            <p className="py-3 text-sm text-slate-600">
              {t('settings.remindersWebHint')}
            </p>
          ) : (
            <>
              <ToggleRow
                label={t('settings.enableReminders')}
                description={t('settings.enableRemindersHint')}
                checked={notificationsEnabled}
                disabled={isSaving || isRequestingNotifications}
                onChange={(on) => void handleToggleReminders(on)}
              />
              {notificationsEnabled && (
                <SelectRow
                  label={t('settings.reminderWhen')}
                  description={t('settings.reminderWhenHint')}
                  value={String(profileSettings.notificationMinutesBefore ?? 0)}
                  options={notificationTimingOptions}
                  disabled={isSaving || isRequestingNotifications}
                  onChange={(value) => void handleNotificationTimingChange(value)}
                />
              )}
              {notificationsEnabled && notificationPermission === 'denied' && (
                <div className="py-3">
                  <p className="text-sm text-amber-800">
                    {t('settings.allowNotificationsHint')}
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-3 min-h-11"
                    disabled={isRequestingNotifications}
                    onClick={() => void requestNotificationPermissions()}
                  >
                    {t('settings.allowNotifications')}
                  </Button>
                </div>
              )}
              {notificationsEnabled && notificationPermission === 'prompt' && (
                <div className="py-3">
                  <p className="text-sm text-slate-600">
                    {t('settings.allowNotificationsHint')}
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-3 min-h-11"
                    disabled={isRequestingNotifications}
                    onClick={() => void requestNotificationPermissions()}
                  >
                    {t('settings.allowNotifications')}
                  </Button>
                </div>
              )}
              {notificationsEnabled && (
                <div className="flex flex-col gap-2 py-3 sm:flex-row">
                  <Button
                    variant="secondary"
                    className="min-h-11 flex-1"
                    disabled={isSaving || isRequestingNotifications}
                    onClick={() => void handleRescheduleReminders()}
                  >
                    {t('settings.rescheduleReminders')}
                  </Button>
                  <Button
                    variant="ghost"
                    className="min-h-11 flex-1"
                    disabled={isSaving || isRequestingNotifications}
                    onClick={() => void handleCancelReminders()}
                  >
                    {t('settings.cancelReminders')}
                  </Button>
                </div>
              )}
              <div className="py-3">
                <Link
                  to="/settings/diagnostics"
                  className="text-sm font-semibold text-[var(--color-primary)]"
                >
                  {t('settings.diagnosticsLink')}
                </Link>
              </div>
              {reminderMessage && (
                <p className="px-1 py-2 text-sm text-amber-800" role="status">
                  {reminderMessage}
                </p>
              )}
            </>
          )}
        </SettingsSection>

        <SettingsSection title={t('settings.pinSection')} description={t('settings.pinSectionHint')}>
          <AdultPinSettings />
        </SettingsSection>

        <SettingsSection title={t('settings.childModeSection')} description={t('settings.childModeSectionHint')}>
          <div className="py-3">
            <p className="text-sm text-slate-600">
              {t('childMode.enterHint')}
            </p>
            <Button fullWidth className="mt-4 min-h-14" onClick={handleEnterChildMode}>
              {t('childMode.enterTitle')}
            </Button>
            <LockAdultModeButton className="mt-3 w-full min-h-12" />
          </div>
        </SettingsSection>
      </div>

      <div className="space-y-8">
        <SettingsSection title={t('settings.deviceSection')} description={t('settings.deviceHint')}>
          <SelectRow
            label={t('settings.preferredDevice')}
            description={t('settings.preferredDeviceHint')}
            value={preferredDeviceLayout}
            options={deviceOptions}
            disabled={isSaving}
            onChange={(value) => void setAccessibility({ preferredDeviceLayout: value })}
          />
          <div className="py-3 text-sm text-slate-600">
            <p>
              {t('settings.currentLayout')}:{' '}
              <span className="font-medium text-slate-900">
                {effectiveLayout === 'mobile' ? t('settings.phone') : t('settings.tablet')}
              </span>
            </p>
            <p className="mt-1">
              {t('settings.detectedScreen')}: {deviceType} · {orientation === 'portrait' ? t('settings.portrait') : t('settings.landscape')}
            </p>
          </div>
        </SettingsSection>

        <SettingsSection title={t('settings.accessibility')} description={t('settings.accessibilityHint')}>
          <ToggleRow
            label={t('settings.largeText')}
            description={t('settings.largeTextHint')}
            checked={largeText}
            disabled={isSaving}
            onChange={(on) => void setAccessibility({ largeText: on })}
          />
          <ToggleRow
            label={t('settings.reduceMotion')}
            description={t('settings.reduceMotionHint')}
            checked={reduceMotion}
            disabled={isSaving}
            onChange={(on) => void setAccessibility({ reduceMotion: on })}
          />
          <ToggleRow
            label={t('settings.highContrast')}
            description={t('settings.highContrastHint')}
            checked={highContrast}
            disabled={isSaving}
            onChange={(on) => void setAccessibility({ highContrast: on })}
          />
          {!activeProfileId ? (
            <p className="py-3 text-sm text-slate-500">
              {t('settings.selectProfileDetailChild')}
            </p>
          ) : isProfileSettingsLoading || !profileSettings ? (
            <p className="py-3 text-sm text-slate-500">{t('settings.loadingPrefs')}</p>
          ) : (
            <SelectRow
              label={t('settings.childDetailLevel')}
              description={t('settings.childDetailHint')}
              value={profileSettings.childModeDetailLevel}
              options={detailOptions}
              disabled={isSaving}
              onChange={(value) =>
                void updateProfileSettings(activeProfileId, { childModeDetailLevel: value })
              }
            />
          )}
        </SettingsSection>

        <SettingsSection title={t('settings.dataSection')}>
          <div className="space-y-4 py-3">
            <div>
              <p className="font-medium text-slate-900">{t('settings.data.storedTitle')}</p>
              <p className="mt-2 text-sm text-slate-600">
                {t('settings.data.storedDesc')}
              </p>
            </div>

            {isDbSummaryLoading || !dbSummary ? (
              <p className="text-sm text-slate-500">{t('settings.data.loadingSummary')}</p>
            ) : (
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <dt className="text-slate-500">{t('settings.data.profiles')}</dt>
                  <dd className="text-lg font-bold text-slate-900">{dbSummary.profileCount}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <dt className="text-slate-500">{t('settings.data.appliedRoutines')}</dt>
                  <dd className="text-lg font-bold text-slate-900">
                    {dbSummary.appliedRoutinesCount}
                  </dd>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <dt className="text-slate-500">{t('settings.data.futureActivities')}</dt>
                  <dd className="text-lg font-bold text-slate-900">
                    {dbSummary.futureActivitiesCount}
                  </dd>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <dt className="text-slate-500">{t('settings.data.historicalActivities')}</dt>
                  <dd className="text-lg font-bold text-slate-900">
                    {dbSummary.historicalActivitiesCount}
                  </dd>
                </div>
                <div className="col-span-2 rounded-xl bg-slate-50 px-3 py-2">
                  <dt className="text-slate-500">{t('settings.data.lastUpdate')}</dt>
                  <dd className="font-medium text-slate-900">
                    {formatLastUpdate(dbSummary.lastLocalUpdateAt)}
                  </dd>
                </div>
              </dl>
            )}

            <Button
              fullWidth
              variant="secondary"
              className="min-h-12"
              disabled={isMaintenanceRunning}
              onClick={() => void runIntegrityCheck()}
            >
              {isMaintenanceRunning ? t('settings.data.checking') : t('settings.data.validateIntegrity')}
            </Button>

            {integrityReport && (
              <div
                className={`rounded-xl px-4 py-3 text-sm ${
                  integrityReport.isHealthy ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'
                }`}
                role="status"
              >
                {integrityReport.isHealthy ? (
                  <p>{t('settings.data.integrityOk')}</p>
                ) : (
                  <div>
                    <p className="font-semibold">
                      {t('settings.data.issuesFound', { count: integrityReport.issueCount })}
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {integrityReport.issues.slice(0, 5).map((issue) => (
                        <li key={`${issue.code}-${issue.entityId ?? issue.message}`}>{issue.message}</li>
                      ))}
                    </ul>
                    {integrityReport.issues.length > 5 && (
                      <p className="mt-2 text-xs">{t('settings.data.andMore', { count: integrityReport.issues.length - 5 })}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {cleanupConfirmOpen ? (
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-700">
                  {t('settings.data.cleanupConfirm')}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="secondary"
                    className="min-h-11 flex-1"
                    disabled={isMaintenanceRunning}
                    onClick={() => void handleConfirmCleanup()}
                  >
                    {t('settings.data.confirmCleanup')}
                  </Button>
                  <Button
                    variant="ghost"
                    className="min-h-11 flex-1"
                    onClick={() => setCleanupConfirmOpen(false)}
                  >
                    {t('common.cancel')}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                fullWidth
                variant="secondary"
                className="min-h-12"
                disabled={isMaintenanceRunning}
                onClick={() => setCleanupConfirmOpen(true)}
              >
                {t('settings.data.cleanupOld')}
              </Button>
            )}

            {cleanupResult && (
              <p className="text-sm text-slate-600" role="status">
                {t('settings.data.cleanupDone', { instances: cleanupResult.deletedInstances, routines: cleanupResult.deletedRoutines })}
              </p>
            )}

            {maintenanceError && (
              <p className="text-sm text-red-700" role="alert">
                {maintenanceError}
              </p>
            )}

            <Button fullWidth variant="secondary" disabled className="min-h-12">
              {t('settings.data.exportSoon')}
            </Button>
            <Button fullWidth variant="secondary" disabled className="min-h-12">
              {t('settings.data.importSoon')}
            </Button>
            <Button
              fullWidth
              variant="secondary"
              className="min-h-12 text-red-600 ring-red-100"
              onClick={() => setResetDialogOpen(true)}
            >
              {t('settings.resetApp')}
            </Button>
          </div>
        </SettingsSection>
      </div>

      <ResetAppDialog
        open={resetDialogOpen}
        isResetting={isResetting}
        onClose={() => setResetDialogOpen(false)}
        onConfirmReset={() => void handleConfirmReset()}
      />
    </div>
  );
}
