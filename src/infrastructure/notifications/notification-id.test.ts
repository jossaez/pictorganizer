import { describe, expect, it } from 'vitest';
import { activityInstanceIdToNotificationId } from './notification-id';

describe('activityInstanceIdToNotificationId', () => {
  it('devuelve entero positivo estable', () => {
    const id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    expect(activityInstanceIdToNotificationId(id)).toBe(activityInstanceIdToNotificationId(id));
    expect(activityInstanceIdToNotificationId(id)).toBeGreaterThan(0);
  });

  it('ids distintos producen hashes distintos', () => {
    const a = activityInstanceIdToNotificationId('instance-a');
    const b = activityInstanceIdToNotificationId('instance-b');
    expect(a).not.toBe(b);
  });
});
