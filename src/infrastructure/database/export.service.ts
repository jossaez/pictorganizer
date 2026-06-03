/** Prepared for future local backup — not implemented in v1 */
export interface LocalDataExport {
  exportedAt: string;
  schemaVersion: number;
  payload: unknown;
}

export async function exportLocalData(): Promise<LocalDataExport> {
  throw new Error('Exportación de datos — próximamente');
}

export async function importLocalData(_data: unknown): Promise<void> {
  throw new Error('Importación de datos — próximamente');
}
