import { ApplyRoutineSuccessDialog } from '@/features/routines/components/ApplyRoutineSuccessDialog';
import { DuplicateRoutineDialog } from '@/features/routines/components/DuplicateRoutineDialog';

interface RoutineApplyDialogsProps {
  duplicateTemplateName: string | null;
  isApplying: boolean;
  success: {
    profileName: string;
    routineName: string;
    instancesCreated: number;
  } | null;
  onApplyCopy: () => void;
  onCancelDuplicate: () => void;
  onViewAgenda: () => void;
  onCloseSuccess: () => void;
}

export function RoutineApplyDialogs({
  duplicateTemplateName,
  isApplying,
  success,
  onApplyCopy,
  onCancelDuplicate,
  onViewAgenda,
  onCloseSuccess,
}: RoutineApplyDialogsProps) {
  return (
    <>
      <DuplicateRoutineDialog
        templateName={duplicateTemplateName ?? ''}
        isOpen={duplicateTemplateName !== null}
        isLoading={isApplying}
        onApplyCopy={onApplyCopy}
        onCancel={onCancelDuplicate}
      />
      <ApplyRoutineSuccessDialog
        profileName={success?.profileName ?? ''}
        routineName={success?.routineName ?? ''}
        instancesCreated={success?.instancesCreated ?? 0}
        isOpen={success !== null}
        onViewAgenda={onViewAgenda}
        onClose={onCloseSuccess}
      />
    </>
  );
}
