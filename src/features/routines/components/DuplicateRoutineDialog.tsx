import { Button } from '@/components/ui/Button';

interface DuplicateRoutineDialogProps {
  templateName: string;
  isOpen: boolean;
  isLoading?: boolean;
  onApplyCopy: () => void;
  onCancel: () => void;
}

export function DuplicateRoutineDialog({
  templateName,
  isOpen,
  isLoading = false,
  onApplyCopy,
  onCancel,
}: DuplicateRoutineDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="duplicate-routine-title"
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
        <h2 id="duplicate-routine-title" className="text-xl font-bold text-slate-900">
          Rutina ya añadida
        </h2>
        <p className="mt-3 text-slate-600">
          <span className="font-medium text-slate-800">{templateName}</span> ya está en la agenda de
          este perfil.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Puedes aplicarla de nuevo como copia si lo necesitas.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" className="flex-1" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={onApplyCopy} disabled={isLoading}>
            Aplicar como copia
          </Button>
        </div>
      </div>
    </div>
  );
}
