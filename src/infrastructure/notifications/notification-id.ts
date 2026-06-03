/**
 * Converts an ActivityInstance id (UUID string) into a stable positive integer
 * for Capacitor Local Notifications. The same instance id must always map to
 * the same notification id so pending notifications can be cancelled reliably.
 */
export function activityInstanceIdToNotificationId(instanceId: string): number {
  let hash = 0;
  for (let i = 0; i < instanceId.length; i++) {
    hash = (hash << 5) - hash + instanceId.charCodeAt(i);
    hash |= 0;
  }
  const id = Math.abs(hash);
  return id === 0 ? 1 : id;
}

/** Alias documented for infrastructure consumers. */
export const getNotificationIdForActivityInstance = activityInstanceIdToNotificationId;
