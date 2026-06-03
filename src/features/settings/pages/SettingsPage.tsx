import { ChevronRight } from 'lucide-react';
import { useCallback, useState, type ReactNode } from 'react';
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
  CELEBRATION_STYLE_LABELS,
  CHILD_DETAIL_LEVEL_LABELS,
  DEVICE_LAYOUT_LABELS,
  NOTIFICATION_TIMING_OPTIONS,
  TIMER_STYLE_LABELS,
} from '@/features/settings/constants/settings-labels';
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
    label: CELEBRATION_STYLE_LABELS[value],
  }));

  const timerOptions = Object.values(TimerStyle).map((value) => ({
    value,
    label: TIMER_STYLE_LABELS[value],
  }));

  const detailOptions = Object.values(ChildModeDetailLevel).map((value) => ({
    value,
    label: CHILD_DETAIL_LEVEL_LABELS[value],
  }));

  const deviceOptions = Object.values(DeviceLayout).map((value) => ({
    value,
    label: DEVICE_LAYOUT_LABELS[value],
  }));

  const notificationTimingOptions = NOTIFICATION_TIMING_OPTIONS.map((opt) => ({
    value: String(opt.value),
    label: opt.label,
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
    setReminderMessage(
      'Para recibir recordatorios de actividades, permite las notificaciones en este dispositivo.',
    );
  }, []);

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
      setReminderMessage('Recordatorios reprogramados para los próximos 7 días.');
    }
  }

  async function handleCancelReminders(): Promise<void> {
    if (!activeProfileId) return;
    setReminderMessage(null);
    await handleDisableReminders();
    setReminderMessage('Recordatorios cancelados en este dispositivo.');
  }

  function handleEnterChildMode(): void {
    lockAdultSession();
    setUserMode('child');
    navigate('/child');
  }

  function formatLastUpdate(iso: string | null | undefined): string {
    if (!iso) return 'Sin datos';
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
          <h2 className="text-2xl font-bold text-slate-900">Ajustes</h2>
          <p className="mt-1 text-slate-600">Configura la app para toda la familia.</p>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="space-y-8">
        <SettingsSection
          title="Perfil activo"
          description="La agenda y las preferencias visuales usan este perfil."
        >
          {activeProfile ? (
            <div className="flex items-center gap-4 px-1 py-2">
              <ProfileAvatar profile={activeProfile} size="md" avatars={avatars} />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900">{activeProfile.name}</p>
                <p className="text-sm text-slate-500">Perfil seleccionado</p>
              </div>
              <Link
                to="/profiles"
                className="flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)]"
              >
                Cambiar
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          ) : (
            <div className="py-3">
              <p className="text-slate-600">No hay perfil activo.</p>
              <Link to="/profiles" className="mt-2 inline-block text-sm font-semibold text-[var(--color-primary)]">
                Elegir perfil
              </Link>
            </div>
          )}
        </SettingsSection>

        <SettingsSection
          title="Preferencias visuales"
          description="Opciones de la agenda para el perfil activo."
        >
          {!activeProfileId ? (
            <p className="py-3 text-sm text-slate-500">Selecciona un perfil para editar preferencias.</p>
          ) : isProfileSettingsLoading || !profileSettings ? (
            <p className="py-3 text-sm text-slate-500">Cargando preferencias…</p>
          ) : (
            <>
              <ToggleRow
                label="Mostrar temporizador visual"
                description="Barra o reloj durante la actividad"
                checked={profileSettings.showTimer}
                disabled={isSaving}
                onChange={(on) =>
                  void updateProfileSettings(activeProfileId, { showTimer: on })
                }
              />
              <ToggleRow
                label="Mostrar Ahora / Después / Más tarde"
                description="Anticipación del día en la agenda"
                checked={profileSettings.showAnticipation}
                disabled={isSaving}
                onChange={(on) =>
                  void updateProfileSettings(activeProfileId, { showAnticipation: on })
                }
              />
              <SelectRow
                label="Tipo de celebración"
                description="Al completar una actividad"
                value={normalizeCelebrationStyle(profileSettings.celebrationStyle)}
                options={celebrationOptions}
                disabled={isSaving}
                onChange={(value) =>
                  void updateProfileSettings(activeProfileId, { celebrationStyle: value })
                }
              />
              <SelectRow
                label="Estilo de temporizador"
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
          title="Recordatorios"
          description="Avisos locales para actividades programadas. Solo en la app móvil."
        >
          {!activeProfileId ? (
            <p className="py-3 text-sm text-slate-500">Selecciona un perfil para configurar recordatorios.</p>
          ) : isProfileSettingsLoading || !profileSettings ? (
            <p className="py-3 text-sm text-slate-500">Cargando preferencias…</p>
          ) : !notificationPlatform.supported ? (
            <p className="py-3 text-sm text-slate-600">
              Los recordatorios estarán disponibles al instalar la app en Android.
            </p>
          ) : (
            <>
              <ToggleRow
                label="Activar recordatorios"
                description="Recibir avisos antes o durante las actividades"
                checked={notificationsEnabled}
                disabled={isSaving || isRequestingNotifications}
                onChange={(on) => void handleToggleReminders(on)}
              />
              {notificationsEnabled && (
                <SelectRow
                  label="Cuándo avisar"
                  description="Sin recordatorio = desactivar el interruptor de arriba"
                  value={String(profileSettings.notificationMinutesBefore ?? 0)}
                  options={notificationTimingOptions}
                  disabled={isSaving || isRequestingNotifications}
                  onChange={(value) => void handleNotificationTimingChange(value)}
                />
              )}
              {notificationsEnabled && notificationPermission === 'denied' && (
                <div className="py-3">
                  <p className="text-sm text-amber-800">
                    Para recibir recordatorios de actividades, permite las notificaciones en este
                    dispositivo.
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-3 min-h-11"
                    disabled={isRequestingNotifications}
                    onClick={() => void requestNotificationPermissions()}
                  >
                    Permitir notificaciones
                  </Button>
                </div>
              )}
              {notificationsEnabled && notificationPermission === 'prompt' && (
                <div className="py-3">
                  <p className="text-sm text-slate-600">
                    Para recibir recordatorios de actividades, permite las notificaciones en este
                    dispositivo.
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-3 min-h-11"
                    disabled={isRequestingNotifications}
                    onClick={() => void requestNotificationPermissions()}
                  >
                    Permitir notificaciones
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
                    Reprogramar recordatorios
                  </Button>
                  <Button
                    variant="ghost"
                    className="min-h-11 flex-1"
                    disabled={isSaving || isRequestingNotifications}
                    onClick={() => void handleCancelReminders()}
                  >
                    Cancelar recordatorios
                  </Button>
                </div>
              )}
              <div className="py-3">
                <Link
                  to="/settings/diagnostics"
                  className="text-sm font-semibold text-[var(--color-primary)]"
                >
                  Ver diagnóstico de recordatorios
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

        <SettingsSection title="PIN de adulto" description="Protege el acceso a ajustes y edición.">
          <AdultPinSettings />
        </SettingsSection>

        <SettingsSection title="Modo niño" description="Vista simple para la persona usuaria.">
          <div className="py-3">
            <p className="text-sm text-slate-600">
              Oculta edición y configuración. Solo consultar la agenda y completar actividades.
            </p>
            <Button fullWidth className="mt-4 min-h-14" onClick={handleEnterChildMode}>
              Entrar en modo niño
            </Button>
            <LockAdultModeButton className="mt-3 w-full min-h-12" />
          </div>
        </SettingsSection>
      </div>

      <div className="space-y-8">
        <SettingsSection title="Dispositivo" description="Cómo se adapta la interfaz.">
          <SelectRow
            label="Tipo de dispositivo preferido"
            description="Automático detecta el tamaño de pantalla"
            value={preferredDeviceLayout}
            options={deviceOptions}
            disabled={isSaving}
            onChange={(value) => void setAccessibility({ preferredDeviceLayout: value })}
          />
          <div className="py-3 text-sm text-slate-600">
            <p>
              Layout actual:{' '}
              <span className="font-medium text-slate-900">
                {effectiveLayout === 'mobile' ? 'Teléfono' : 'Tablet'}
              </span>
            </p>
            <p className="mt-1">
              Pantalla detectada: {deviceType} · {orientation === 'portrait' ? 'Vertical' : 'Horizontal'}
            </p>
          </div>
        </SettingsSection>

        <SettingsSection title="Accesibilidad" description="Comodidad visual para toda la app.">
          <ToggleRow
            label="Texto grande"
            description="Aumenta el tamaño de la tipografía"
            checked={largeText}
            disabled={isSaving}
            onChange={(on) => void setAccessibility({ largeText: on })}
          />
          <ToggleRow
            label="Reducir animaciones"
            description="Menos movimiento en transiciones y celebraciones"
            checked={reduceMotion}
            disabled={isSaving}
            onChange={(on) => void setAccessibility({ reduceMotion: on })}
          />
          <ToggleRow
            label="Alto contraste"
            description="Colores más marcados y legibles"
            checked={highContrast}
            disabled={isSaving}
            onChange={(on) => void setAccessibility({ highContrast: on })}
          />
          {!activeProfileId ? (
            <p className="py-3 text-sm text-slate-500">
              Selecciona un perfil para ajustar el nivel de detalle en modo niño.
            </p>
          ) : isProfileSettingsLoading || !profileSettings ? (
            <p className="py-3 text-sm text-slate-500">Cargando preferencias…</p>
          ) : (
            <SelectRow
              label="Nivel de detalle en modo niño"
              description="Cuánta información ve la persona usuaria"
              value={profileSettings.childModeDetailLevel}
              options={detailOptions}
              disabled={isSaving}
              onChange={(value) =>
                void updateProfileSettings(activeProfileId, { childModeDetailLevel: value })
              }
            />
          )}
        </SettingsSection>

        <SettingsSection title="Datos y almacenamiento">
          <div className="space-y-4 py-3">
            <div>
              <p className="font-medium text-slate-900">Datos guardados en este dispositivo</p>
              <p className="mt-2 text-sm text-slate-600">
                PICTORGANIZER guarda la agenda y los perfiles en este dispositivo para que puedas
                usar la app sin conexión.
              </p>
            </div>

            {isDbSummaryLoading || !dbSummary ? (
              <p className="text-sm text-slate-500">Cargando resumen…</p>
            ) : (
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <dt className="text-slate-500">Perfiles</dt>
                  <dd className="text-lg font-bold text-slate-900">{dbSummary.profileCount}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <dt className="text-slate-500">Rutinas aplicadas</dt>
                  <dd className="text-lg font-bold text-slate-900">
                    {dbSummary.appliedRoutinesCount}
                  </dd>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <dt className="text-slate-500">Actividades futuras</dt>
                  <dd className="text-lg font-bold text-slate-900">
                    {dbSummary.futureActivitiesCount}
                  </dd>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <dt className="text-slate-500">Actividades históricas</dt>
                  <dd className="text-lg font-bold text-slate-900">
                    {dbSummary.historicalActivitiesCount}
                  </dd>
                </div>
                <div className="col-span-2 rounded-xl bg-slate-50 px-3 py-2">
                  <dt className="text-slate-500">Última actualización local</dt>
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
              {isMaintenanceRunning ? 'Comprobando…' : 'Validar integridad'}
            </Button>

            {integrityReport && (
              <div
                className={`rounded-xl px-4 py-3 text-sm ${
                  integrityReport.isHealthy ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'
                }`}
                role="status"
              >
                {integrityReport.isHealthy ? (
                  <p>Todo parece correcto. No se encontraron problemas.</p>
                ) : (
                  <div>
                    <p className="font-semibold">
                      Se encontraron {integrityReport.issueCount} aviso
                      {integrityReport.issueCount === 1 ? '' : 's'}:
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {integrityReport.issues.slice(0, 5).map((issue) => (
                        <li key={`${issue.code}-${issue.entityId ?? issue.message}`}>{issue.message}</li>
                      ))}
                    </ul>
                    {integrityReport.issues.length > 5 && (
                      <p className="mt-2 text-xs">…y {integrityReport.issues.length - 5} más</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {cleanupConfirmOpen ? (
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-700">
                  Se eliminarán permanentemente los registros borrados hace más de 30 días.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="secondary"
                    className="min-h-11 flex-1"
                    disabled={isMaintenanceRunning}
                    onClick={() => void handleConfirmCleanup()}
                  >
                    Confirmar limpieza
                  </Button>
                  <Button
                    variant="ghost"
                    className="min-h-11 flex-1"
                    onClick={() => setCleanupConfirmOpen(false)}
                  >
                    Cancelar
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
                Limpiar registros antiguos
              </Button>
            )}

            {cleanupResult && (
              <p className="text-sm text-slate-600" role="status">
                Limpieza completada: {cleanupResult.deletedInstances} actividades y{' '}
                {cleanupResult.deletedRoutines} rutinas antiguas eliminadas.
              </p>
            )}

            {maintenanceError && (
              <p className="text-sm text-red-700" role="alert">
                {maintenanceError}
              </p>
            )}

            <Button fullWidth variant="secondary" disabled className="min-h-12">
              Exportar datos — Próximamente
            </Button>
            <Button fullWidth variant="secondary" disabled className="min-h-12">
              Importar datos — Próximamente
            </Button>
            <Button
              fullWidth
              variant="secondary"
              className="min-h-12 text-red-600 ring-red-100"
              onClick={() => setResetDialogOpen(true)}
            >
              Restablecer PICTORGANIZER
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
