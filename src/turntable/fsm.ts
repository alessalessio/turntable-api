import {
  PowerState,
  VinylState,
  PlaybackState,
  ActionName,
  StateId,
  IFsmState,
  IFsmTransition,
} from './turntable.interface';

/**
 * FSM States - explicit enumeration of all valid state combinations.
 * Maps StateId to the concrete state values.
 */
export const FSM_STATES: Record<StateId, IFsmState> = {
  S1: {
    id: 'S1',
    powerState: PowerState.OFF,
    vinylState: VinylState.EMPTY,
    playbackState: PlaybackState.STOPPED,
  },
  S2: {
    id: 'S2',
    powerState: PowerState.OFF,
    vinylState: VinylState.LOADED,
    playbackState: PlaybackState.STOPPED,
  },
  S3: {
    id: 'S3',
    powerState: PowerState.ON,
    vinylState: VinylState.EMPTY,
    playbackState: PlaybackState.STOPPED,
  },
  S4: {
    id: 'S4',
    powerState: PowerState.ON,
    vinylState: VinylState.LOADED,
    playbackState: PlaybackState.STOPPED,
  },
  S5: {
    id: 'S5',
    powerState: PowerState.ON,
    vinylState: VinylState.LOADED,
    playbackState: PlaybackState.PLAYING,
  },
};

/**
 * FSM Transitions - explicit list of allowed state transitions.
 * Single source of truth for what actions are valid from each state.
 */
export const FSM_TRANSITIONS: IFsmTransition[] = [
  // powerOn: OFF → ON (preserves vinyl state)
  { from: 'S1', action: 'power-on', to: 'S3' },
  { from: 'S2', action: 'power-on', to: 'S4' },
  // powerOff: ON → OFF (preserves vinyl state, requires STOPPED)
  { from: 'S3', action: 'power-off', to: 'S1' },
  { from: 'S4', action: 'power-off', to: 'S2' },
  // vinyl operations (require ON and STOPPED)
  { from: 'S3', action: 'put-vinyl', to: 'S4' },
  { from: 'S4', action: 'change-vinyl', to: 'S4' },
  { from: 'S4', action: 'remove-vinyl', to: 'S3' },
  // playback (require ON, LOADED, STOPPED/PLAYING)
  { from: 'S4', action: 'play', to: 'S5' },
  { from: 'S5', action: 'stop', to: 'S4' },
];

/**
 * HATEOAS link metadata per action.
 * Defines the HTTP endpoint and method for each action.
 */
export const ACTION_LINKS: Record<ActionName, { href: string; method: 'GET' | 'POST' | 'PUT' | 'DELETE' }> = {
  'power-on': { href: '/turntable/power/on', method: 'POST' },
  'power-off': { href: '/turntable/power/off', method: 'POST' },
  'put-vinyl': { href: '/turntable/vinyl', method: 'PUT' },
  'change-vinyl': { href: '/turntable/vinyl', method: 'PUT' },
  'remove-vinyl': { href: '/turntable/vinyl', method: 'DELETE' },
  play: { href: '/turntable/play', method: 'POST' },
  stop: { href: '/turntable/stop', method: 'POST' },
};

/**
 * Helper to get human-readable state label.
 */
export function getStateLabel(state: IFsmState): string {
  return `${state.powerState} / ${state.vinylState} / ${state.playbackState}`;
}

