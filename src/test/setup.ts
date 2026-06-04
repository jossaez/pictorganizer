import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';
import { beforeAll } from 'vitest';
import { initI18n } from '@/i18n';

beforeAll(async () => {
  await initI18n('es');
});

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });

  Element.prototype.scrollIntoView = () => undefined;
}
