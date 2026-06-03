import { describe, expect, it } from 'vitest';
import { hashPin, validatePinFormat, verifyPin } from '@/domain/services/pin.service';
import { hasAdultPin, isAdultPinRequired } from '@/domain/services/adult-pin.utils';

describe('pin.service', () => {
  it('validatePinFormat accepts 4 digits only', () => {
    expect(validatePinFormat('1234')).toBe(true);
    expect(validatePinFormat('123')).toBe(false);
    expect(validatePinFormat('12a4')).toBe(false);
    expect(validatePinFormat('12345')).toBe(false);
  });

  it('hashPin and verifyPin round-trip', async () => {
    const hash = await hashPin('4829');
    expect(hash).not.toBe('4829');
    expect(await verifyPin('4829', hash)).toBe(true);
    expect(await verifyPin('0000', hash)).toBe(false);
  });

  it('verifyPin rejects invalid format', async () => {
    const hash = await hashPin('1111');
    expect(await verifyPin('111', hash)).toBe(false);
  });
});

describe('adult-pin.utils', () => {
  it('isAdultPinRequired when hash and flag are set', () => {
    expect(
      isAdultPinRequired({ adultPinHash: 'abc', requirePinForAdultMode: true }),
    ).toBe(true);
    expect(
      isAdultPinRequired({ adultPinHash: 'abc', requirePinForAdultMode: false }),
    ).toBe(false);
    expect(isAdultPinRequired({ requirePinForAdultMode: true })).toBe(false);
  });

  it('hasAdultPin detects stored hash', () => {
    expect(hasAdultPin({ adultPinHash: 'hash' })).toBe(true);
    expect(hasAdultPin({})).toBe(false);
  });
});
