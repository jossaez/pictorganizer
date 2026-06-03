import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ToggleRow } from '@/features/settings/components/ToggleRow';
import { PinSetupFlow, PinVerifyFlow } from '@/features/adult-mode/components/PinSetupFlow';
import { settingsRepository } from '@/infrastructure/repositories';
import { useAppSettings } from '@/features/settings/hooks/useAppSettings';
import { useAppStore } from '@/store/app.store';
import { hasAdultPin } from '@/domain/services/adult-pin.utils';

type PinDialogMode = 'none' | 'create' | 'change-verify' | 'change-new' | 'disable-verify';

export function AdultPinSettings() {
  const setPinSettings = useAppStore((s) => s.setPinSettings);
  const { updateSettings, isSaving } = useAppSettings();

  const settings = useLiveQuery(() => settingsRepository.getOrCreateAppSettings(), []);
  const [mode, setMode] = useState<PinDialogMode>('none');
  const [message, setMessage] = useState<string | null>(null);

  if (settings === undefined) {
    return <p className="py-3 text-sm text-slate-500">Cargando PIN…</p>;
  }

  const pinExists = hasAdultPin(settings);

  async function savePinHash(pinHash: string): Promise<void> {
    const updated = await updateSettings({
      adultPinHash: pinHash,
      requirePinForAdultMode: true,
    });
    if (updated) {
      setPinSettings({ adultPinHash: pinHash, requirePinForAdultMode: true });
      setMessage('PIN guardado correctamente.');
      setMode('none');
    }
  }

  async function disablePin(): Promise<void> {
    const updated = await updateSettings({
      adultPinHash: undefined,
      requirePinForAdultMode: false,
    });
    if (updated) {
      useAppStore.getState().lockAdultSession();
      setPinSettings({ adultPinHash: null, requirePinForAdultMode: false });
      setMessage('PIN desactivado.');
      setMode('none');
    }
  }

  async function toggleRequirePin(on: boolean): Promise<void> {
    if (!pinExists) return;
    const updated = await updateSettings({ requirePinForAdultMode: on });
    if (updated) {
      setPinSettings({ requirePinForAdultMode: on });
      if (!on) {
        useAppStore.getState().lockAdultSession();
      }
    }
  }

  return (
    <div className="space-y-4 py-3">
      <p className="text-sm text-slate-600">
        Protege el modo adulto para que la persona usuaria no cambie la agenda por accidente.
      </p>
      <p className="text-sm text-amber-800">
        Si olvidas el PIN, por ahora tendrás que restablecer la app.
      </p>

      {message && (
        <p className="text-sm text-emerald-700" role="status">
          {message}
        </p>
      )}

      {!pinExists && mode === 'none' && (
        <Button
          variant="secondary"
          className="w-full min-h-12"
          disabled={isSaving}
          onClick={() => setMode('create')}
        >
          Crear PIN
        </Button>
      )}

      {pinExists && mode === 'none' && (
        <>
          <ToggleRow
            label="Solicitar PIN al salir del modo niño"
            description="Pide el PIN para entrar en ajustes y edición"
            checked={settings.requirePinForAdultMode}
            disabled={isSaving}
            onChange={(on) => void toggleRequirePin(on)}
          />
          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="secondary"
              className="min-h-12"
              disabled={isSaving}
              onClick={() => setMode('change-verify')}
            >
              Cambiar PIN
            </Button>
            <Button
              variant="ghost"
              className="min-h-12 text-red-600"
              disabled={isSaving}
              onClick={() => setMode('disable-verify')}
            >
              Desactivar PIN
            </Button>
          </div>
        </>
      )}

      {mode === 'create' && (
        <PinSetupFlow
          title="Crear PIN de adulto"
          onComplete={(hash) => void savePinHash(hash)}
        />
      )}

      {mode === 'change-verify' && settings.adultPinHash && (
        <PinVerifyFlow
          pinHash={settings.adultPinHash}
          onVerified={() => setMode('change-new')}
        />
      )}

      {mode === 'change-new' && (
        <PinSetupFlow
          title="Nuevo PIN de adulto"
          onComplete={(hash) => void savePinHash(hash)}
        />
      )}

      {mode === 'disable-verify' && settings.adultPinHash && (
        <PinVerifyFlow
          title="Confirma el PIN para desactivarlo"
          pinHash={settings.adultPinHash}
          onVerified={() => void disablePin()}
        />
      )}

      {mode !== 'none' && (
        <Button variant="ghost" className="min-h-11" onClick={() => setMode('none')}>
          Cancelar
        </Button>
      )}
    </div>
  );
}
