/**
 * FSM data definitions for documentation generation.
 * These mirror the runtime FSM but are defined separately to avoid
 * importing the full NestJS service in documentation scripts.
 */

export type StateId = 'S1' | 'S2' | 'S3' | 'S4' | 'S5';

export type ActionName =
  | 'power-on'
  | 'power-off'
  | 'put-vinyl'
  | 'change-vinyl'
  | 'remove-vinyl'
  | 'play'
  | 'stop';

export interface IFsmState {
  id: StateId;
  powerState: string;
  vinylState: string;
  playbackState: string;
}

export interface IFsmTransition {
  from: StateId;
  action: ActionName;
  to: StateId;
}

export interface IActionLink {
  href: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

/**
 * FSM States - explicit enumeration of all valid state combinations.
 */
export const FSM_STATES: Record<StateId, IFsmState> = {
  S1: {
    id: 'S1',
    powerState: 'OFF',
    vinylState: 'EMPTY',
    playbackState: 'STOPPED',
  },
  S2: {
    id: 'S2',
    powerState: 'OFF',
    vinylState: 'LOADED',
    playbackState: 'STOPPED',
  },
  S3: {
    id: 'S3',
    powerState: 'ON',
    vinylState: 'EMPTY',
    playbackState: 'STOPPED',
  },
  S4: {
    id: 'S4',
    powerState: 'ON',
    vinylState: 'LOADED',
    playbackState: 'STOPPED',
  },
  S5: {
    id: 'S5',
    powerState: 'ON',
    vinylState: 'LOADED',
    playbackState: 'PLAYING',
  },
};

/**
 * FSM Transitions - explicit list of allowed state transitions.
 */
export const FSM_TRANSITIONS: IFsmTransition[] = [
  { from: 'S1', action: 'power-on', to: 'S3' },
  { from: 'S2', action: 'power-on', to: 'S4' },
  { from: 'S3', action: 'power-off', to: 'S1' },
  { from: 'S4', action: 'power-off', to: 'S2' },
  { from: 'S3', action: 'put-vinyl', to: 'S4' },
  { from: 'S4', action: 'change-vinyl', to: 'S4' },
  { from: 'S4', action: 'remove-vinyl', to: 'S3' },
  { from: 'S4', action: 'play', to: 'S5' },
  { from: 'S5', action: 'stop', to: 'S4' },
];

/**
 * HATEOAS link metadata per action.
 */
export const ACTION_LINKS: Record<ActionName, IActionLink> = {
  'power-on': { href: '/turntable/power/on', method: 'POST' },
  'power-off': { href: '/turntable/power/off', method: 'POST' },
  'put-vinyl': { href: '/turntable/vinyl', method: 'PUT' },
  'change-vinyl': { href: '/turntable/vinyl', method: 'PUT' },
  'remove-vinyl': { href: '/turntable/vinyl', method: 'DELETE' },
  play: { href: '/turntable/play', method: 'POST' },
  stop: { href: '/turntable/stop', method: 'POST' },
};

/**
 * Action descriptions for OpenAPI documentation.
 */
export const ACTION_DESCRIPTIONS: Record<ActionName, { summary: string; description: string }> = {
  'power-on': {
    summary: 'Power on the turntable',
    description: 'Powers on the turntable. Only allowed when turntable is OFF.',
  },
  'power-off': {
    summary: 'Power off the turntable',
    description: 'Powers off the turntable. Only allowed when turntable is ON and playback is STOPPED.',
  },
  'put-vinyl': {
    summary: 'Put a vinyl on the turntable',
    description: 'Loads a random vinyl from the catalog. Only allowed when ON, STOPPED, and no vinyl loaded.',
  },
  'change-vinyl': {
    summary: 'Change the vinyl on the turntable',
    description: 'Replaces the current vinyl with a random one. Only allowed when ON, STOPPED, and vinyl is loaded.',
  },
  'remove-vinyl': {
    summary: 'Remove the vinyl from the turntable',
    description: 'Removes the current vinyl. Only allowed when ON, STOPPED, and vinyl is loaded.',
  },
  play: {
    summary: 'Start playback',
    description: 'Starts playing the loaded vinyl. Only allowed when ON, vinyl LOADED, and STOPPED.',
  },
  stop: {
    summary: 'Stop playback',
    description: 'Stops the current playback. Only allowed when PLAYING.',
  },
};

