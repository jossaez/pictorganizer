import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

interface DatabaseErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showSettingsLink?: boolean;
}

export function DatabaseErrorState({
  title = 'No se pudo acceder a los datos',
  message,
  onRetry,
  showSettingsLink = true,
}: DatabaseErrorStateProps) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-[var(--color-bg)] px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-100">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
          <AlertTriangle className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="mt-4 text-xl font-bold text-slate-900">{title}</h1>
        <p className="mt-3 text-slate-600">{message}</p>
        <div className="mt-6 flex flex-col gap-3">
          {onRetry && (
            <Button fullWidth onClick={onRetry}>
              Reintentar
            </Button>
          )}
          {showSettingsLink && (
            <Link
              to="/settings"
              className="inline-flex min-h-12 items-center justify-center rounded-xl px-4 text-sm font-semibold text-[var(--color-primary)] ring-1 ring-slate-200"
            >
              Ir a ajustes
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
