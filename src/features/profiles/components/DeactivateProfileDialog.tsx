import { Button } from '@/components/ui/Button';

interface DeactivateProfileDialogProps {
  profileName: string;
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeactivateProfileDialog({
  profileName,
  isOpen,
  isLoading = false,
  onConfirm,
  onCancel,
}: DeactivateProfileDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deactivate-profile-title"
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <h2 id="deactivate-profile-title" className="text-xl font-bold text-slate-900">
          ¿Desactivar perfil?
        </h2>
        <p className="mt-3 text-slate-600">
          <span className="font-medium text-slate-800">{profileName}</span> dejará de mostrarse, pero
          sus datos no se borrarán definitivamente.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            className="flex-1 bg-red-500 hover:bg-red-600"
            onClick={onConfirm}
            disabled={isLoading}
          >
            Desactivar
          </Button>
        </div>
      </div>
    </div>
  );
}
