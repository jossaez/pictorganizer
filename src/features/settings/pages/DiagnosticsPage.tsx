import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Capacitor } from '@capacitor/core';
import {
  checkPermissions,
  getNotificationPlatformInfo,
  getPendingNotificationSummaries,
  isSupported,
  type PendingNotificationSummary,
} from '@/infrastructure/notifications/local-notification.service';
import { syncActiveProfileNotificationsNextDays } from '@/infrastructure/notifications/notification-sync';
import { getDatabaseSummary } from '@/infrastructure/database/database-maintenance.service';
import { profileRepository } from '@/infrastructure/repositories';
import { useProfiles } from '@/features/profiles/hooks/useProfiles';
import { useAppStore } from '@/store/app.store';

function formatDateTime(date: Date | undefined): string {
  if (!date) return '—';
  try {
    return date.toLocaleString('es-ES', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return date.toISOString();
  }
}

function yesNo(value: boolean): string {
  return value ? 'Sí' : 'No';
}

export function DiagnosticsPage() {
  const activeProfileId = useAppStore((s) => s.activeProfileId);
  const { activeProfile } = useProfiles();
  const platform = getNotificationPlatformInfo();

  const [permission, setPermission] = useState<string>('—');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean | null>(null);
  const [notificationMinutesBefore, setNotificationMinutesBefore] = useState<number | null>(null);
  const [pending, setPending] = useState<PendingNotificationSummary[]>([]);
  const [futureActivitiesCount, setFutureActivitiesCount] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDiagnostics = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const permissionState = await checkPermissions();
      setPermission(permissionState);

      if (activeProfileId) {
        const settings = await profileRepository.getSettingsByProfileId(activeProfileId);
        setNotificationsEnabled(settings?.notificationsEnabled ?? false);
        setNotificationMinutesBefore(settings?.notificationMinutesBefore ?? 0);
      } else {
        setNotificationsEnabled(null);
        setNotificationMinutesBefore(null);
      }

      const summary = await getDatabaseSummary();
      setFutureActivitiesCount(summary.futureActivitiesCount);
      setPending(await getPendingNotificationSummaries());
    } finally {
      setIsRefreshing(false);
    }
  }, [activeProfileId]);

  useEffect(() => {
    void loadDiagnostics();
  }, [loadDiagnostics]);

  async function handleReschedule(): Promise<void> {
    syncActiveProfileNotificationsNextDays();
    await loadDiagnostics();
  }

  const sortedPending = [...pending].sort((a, b) => {
    const aTime = a.scheduleAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const bTime = b.scheduleAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return aTime - bTime;
  });

  return (
    <div className="space-y-6">
      <Link
        to="/settings"
        className="a11y-focus-ring inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver a ajustes
      </Link>

      <div>
        <h2 className="text-2xl font-bold text-slate-900">Diagnóstico de recordatorios</h2>
        <p className="mt-1 text-slate-600">
          Información técnica para comprobar avisos locales en este dispositivo.
        </p>
      </div>

      <Card className="divide-y divide-slate-100">
        <dl className="grid gap-4 p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Plataforma</dt>
            <dd className="font-medium text-slate-900">
              {Capacitor.getPlatform()} ({platform.platform})
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Notificaciones soportadas</dt>
            <dd className="font-medium text-slate-900">{yesNo(isSupported())}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Permisos concedidos</dt>
            <dd className="font-medium text-slate-900">
              {permission === 'granted' ? 'Sí' : permission === 'denied' ? 'No' : permission}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Recordatorios activos (perfil)</dt>
            <dd className="font-medium text-slate-900">
              {notificationsEnabled == null ? '—' : yesNo(notificationsEnabled)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Perfil activo</dt>
            <dd className="font-medium text-slate-900">
              {activeProfile?.name ?? 'Ninguno'}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Aviso antes de la actividad</dt>
            <dd className="font-medium text-slate-900">
              {notificationMinutesBefore == null
                ? '—'
                : notificationMinutesBefore === 0
                  ? 'A la hora'
                  : `${notificationMinutesBefore} min`}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Actividades futuras (Dexie)</dt>
            <dd className="font-medium text-slate-900">
              {futureActivitiesCount ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Notificaciones programadas (7 días)</dt>
            <dd className="font-medium text-slate-900">{pending.length}</dd>
          </div>
        </dl>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="secondary"
          className="min-h-11 gap-2"
          disabled={isRefreshing}
          onClick={() => void loadDiagnostics()}
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          {isRefreshing ? 'Actualizando…' : 'Actualizar diagnóstico'}
        </Button>
        <Button
          variant="secondary"
          className="min-h-11"
          disabled={!isSupported() || !activeProfileId}
          onClick={() => void handleReschedule()}
        >
          Reprogramar próximos 7 días
        </Button>
      </div>

      <section>
        <h3 className="text-lg font-bold text-slate-900">Próximas notificaciones</h3>
        <p className="mt-1 text-sm text-slate-600">
          Solo se programan actividades de los próximos 7 días en Android.
        </p>

        {sortedPending.length === 0 ? (
          <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            No hay notificaciones pendientes visibles para el plugin.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {sortedPending.slice(0, 20).map((item) => (
              <li key={item.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <p className="font-semibold text-slate-900">{item.title ?? 'Sin título'}</p>
                <p className="mt-1 text-sm text-slate-600">{item.body ?? '—'}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {formatDateTime(item.scheduleAt)}
                  {item.activityInstanceId ? ` · ${item.activityInstanceId.slice(0, 8)}…` : ''}
                </p>
              </li>
            ))}
            {sortedPending.length > 20 && (
              <li className="text-sm text-slate-500">
                …y {sortedPending.length - 20} más
              </li>
            )}
          </ul>
        )}
      </section>
    </div>
  );
}
