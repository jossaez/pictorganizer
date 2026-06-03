import { CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ApplyRoutineSuccessDialogProps {
  profileName: string;
  routineName: string;
  instancesCreated: number;
  isOpen: boolean;
  onViewAgenda: () => void;
  onClose: () => void;
}

export function ApplyRoutineSuccessDialog({
  profileName,
  routineName,
  instancesCreated,
  isOpen,
  onViewAgenda,
  onClose,
}: ApplyRoutineSuccessDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-success-title"
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
          <CalendarCheck className="h-8 w-8" aria-hidden />
        </div>
        <h2 id="apply-success-title" className="text-xl font-bold text-slate-900">
          Rutina añadida
        </h2>
        <p className="mt-3 text-slate-600">
          <span className="font-medium text-slate-800">{routineName}</span> se ha añadido a la agenda
          de <span className="font-medium text-slate-800">{profileName}</span>.
        </p>
        {instancesCreated > 0 && (
          <p className="mt-2 text-sm text-slate-500">
            {instancesCreated} actividad{instancesCreated === 1 ? '' : 'es'} programada
            {instancesCreated === 1 ? '' : 's'}.
          </p>
        )}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Seguir explorando
          </Button>
          <Button className="flex-1" onClick={onViewAgenda}>
            Ver agenda
          </Button>
        </div>
      </div>
    </div>
  );
}
