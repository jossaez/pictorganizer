const PIN_SALT = 'pictorganizer-adult-pin-v1';

export function validatePinFormat(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export async function hashPin(pin: string): Promise<string> {
  if (!validatePinFormat(pin)) {
    throw new Error('PIN inválido');
  }

  const data = new TextEncoder().encode(`${PIN_SALT}:${pin}`);

  if (typeof crypto !== 'undefined' && crypto.subtle?.digest) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return bufferToHex(hashBuffer);
  }

  // Fallback sin Web Crypto (tests Node antiguos)
  return fallbackHash(data);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  if (!validatePinFormat(pin) || !hash) return false;
  const computed = await hashPin(pin);
  return computed === hash;
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function fallbackHash(data: Uint8Array): string {
  let hash = 0;
  for (const byte of data) {
    hash = (hash * 31 + byte) >>> 0;
  }
  return `fallback-${hash.toString(16)}-${data.length}`;
}
