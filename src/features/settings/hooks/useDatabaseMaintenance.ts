import { useCallback, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  cleanupDeletedRecords,
  getDatabaseSummary,
  type CleanupResult,
  type DatabaseSummary,
  type IntegrityReport,
  validateDatabaseIntegrity,
} from '@/infrastructure/database/database-maintenance.service';

export function useDatabaseSummary() {
  const summary = useLiveQuery(async (): Promise<DatabaseSummary> => getDatabaseSummary(), [], undefined);

  return {
    summary,
    isLoading: summary === undefined,
  };
}

export function useDatabaseMaintenance() {
  const [integrityReport, setIntegrityReport] = useState<IntegrityReport | null>(null);
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runIntegrityCheck = useCallback(async (): Promise<IntegrityReport | null> => {
    setIsRunning(true);
    setError(null);
    try {
      const report = await validateDatabaseIntegrity();
      setIntegrityReport(report);
      return report;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo validar la base de datos';
      setError(message);
      return null;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const runCleanup = useCallback(async (): Promise<CleanupResult | null> => {
    setIsRunning(true);
    setError(null);
    try {
      const result = await cleanupDeletedRecords();
      setCleanupResult(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo limpiar la base de datos';
      setError(message);
      return null;
    } finally {
      setIsRunning(false);
    }
  }, []);

  return {
    integrityReport,
    cleanupResult,
    isRunning,
    error,
    runIntegrityCheck,
    runCleanup,
    clearReports: () => {
      setIntegrityReport(null);
      setCleanupResult(null);
      setError(null);
    },
  };
}
