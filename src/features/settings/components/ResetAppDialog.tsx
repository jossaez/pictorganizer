import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

interface ResetAppDialogProps {
  open: boolean;
  isResetting: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
}

export function ResetAppDialog({
  open,
  isResetting,
  onClose,
  onConfirmReset,
}: ResetAppDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);

  function handleClose(): void {
    if (isResetting) return;
    setStep(1);
    onClose();
  }

  useEffect(() => {
    if (!open) {
      setStep(1);
      return;
    }
    function onKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape' && !isResetting) handleClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, isResetting, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-app-title"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {step === 1 ? (
          <>
            <h2 id="reset-app-title" className="text-xl font-bold text-slate-900">
              Restablecer PICTORGANIZER
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Esta acción borrará los datos guardados en este dispositivo. Se eliminarán perfiles,
              rutinas y actividades. No se puede deshacer.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button
                variant="secondary"
                fullWidth
                className="a11y-focus-ring min-h-12 text-red-600 ring-red-200"
                onClick={() => setStep(2)}
              >
                Continuar
              </Button>
              <Button variant="ghost" fullWidth className="a11y-focus-ring min-h-12" onClick={handleClose}>
                Cancelar
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 id="reset-app-title" className="text-xl font-bold text-red-700">
              ¿Seguro que quieres continuar?
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Se borrarán todos los perfiles, rutinas y actividades de este dispositivo. La app
              volverá al estado inicial.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button
                fullWidth
                className="a11y-focus-ring min-h-12 bg-red-600 hover:bg-red-700"
                disabled={isResetting}
                onClick={onConfirmReset}
              >
                {isResetting ? 'Restableciendo…' : 'Sí, restablecer ahora'}
              </Button>
              <Button
                variant="ghost"
                fullWidth
                className="a11y-focus-ring min-h-12"
                disabled={isResetting}
                onClick={handleClose}
              >
                Cancelar
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
