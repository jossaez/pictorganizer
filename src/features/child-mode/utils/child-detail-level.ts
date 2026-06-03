import { ChildModeDetailLevel } from '../../../domain/enums';

export interface ChildDetailDisplay {
  showTime: boolean;
  showStateBadge: boolean;
  showDetailToggle: boolean;
}

/** Maps ProfileSettings.childModeDetailLevel to UI visibility in Modo Niño */
export function getChildDetailDisplay(level?: ChildModeDetailLevel): ChildDetailDisplay {
  switch (level) {
    case ChildModeDetailLevel.Minimal:
      return { showTime: false, showStateBadge: false, showDetailToggle: false };
    case ChildModeDetailLevel.Detailed:
      return { showTime: true, showStateBadge: false, showDetailToggle: true };
    case ChildModeDetailLevel.Standard:
    default:
      return { showTime: true, showStateBadge: false, showDetailToggle: false };
  }
}
