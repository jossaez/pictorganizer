import { describe, expect, it } from 'vitest';
import { ChildModeDetailLevel } from '../../../domain/enums';
import { getChildDetailDisplay } from './child-detail-level';

describe('getChildDetailDisplay', () => {
  it('minimal: solo pictograma y título', () => {
    const d = getChildDetailDisplay(ChildModeDetailLevel.Minimal);
    expect(d.showTime).toBe(false);
    expect(d.showDetailToggle).toBe(false);
  });

  it('standard: incluye hora', () => {
    const d = getChildDetailDisplay(ChildModeDetailLevel.Standard);
    expect(d.showTime).toBe(true);
    expect(d.showDetailToggle).toBe(false);
  });

  it('detailed: incluye ver detalle', () => {
    const d = getChildDetailDisplay(ChildModeDetailLevel.Detailed);
    expect(d.showTime).toBe(true);
    expect(d.showDetailToggle).toBe(true);
  });
});
