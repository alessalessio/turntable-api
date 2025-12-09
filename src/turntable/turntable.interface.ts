/**
 * Power state of the turntable
 */
export enum PowerState {
  OFF = 'OFF',
  ON = 'ON',
}

/**
 * Vinyl loading state
 */
export enum VinylState {
  EMPTY = 'EMPTY',
  LOADED = 'LOADED',
}

/**
 * Playback state of the turntable
 */
export enum PlaybackState {
  STOPPED = 'STOPPED',
  PLAYING = 'PLAYING',
}

/**
 * MIDI track from the catalog
 */
export interface IMidiTrack {
  id: string;
  title: string;
  composer: string;
  url: string;
}

/**
 * Vinyl record data (mounted on turntable)
 */
export interface IVinyl {
  id: string;
  title: string;
  composer: string;
  midiUrl: string;
}

/**
 * HATEOAS link structure
 */
export interface IHateoasLink {
  href: string;
  method: string;
  templated?: boolean;
}

/**
 * Action names for state machine transitions
 */
export type ActionName =
  | 'power-on'
  | 'power-off'
  | 'put-vinyl'
  | 'change-vinyl'
  | 'remove-vinyl'
  | 'play'
  | 'stop';

/**
 * FSM state identifiers
 */
export type StateId = 'S1' | 'S2' | 'S3' | 'S4' | 'S5';

/**
 * FSM state definition (without currentVinyl which is a side-effect value)
 */
export interface IFsmState {
  id: StateId;
  powerState: PowerState;
  vinylState: VinylState;
  playbackState: PlaybackState;
}

/**
 * FSM transition definition
 */
export interface IFsmTransition {
  from: StateId;
  action: ActionName;
  to: StateId;
}

/**
 * Collection of HATEOAS links
 */
export type IHateoasLinks = {
  self: IHateoasLink;
} & Partial<Record<ActionName, IHateoasLink>>;

/**
 * State machine transition definition
 */
export interface ITransition {
  guard: (state: ITurntableState) => boolean;
  apply: (state: ITurntableState) => ITurntableState;
  link: {
    href: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  };
}

/**
 * Turntable state representation
 */
export interface ITurntableState {
  powerState: PowerState;
  vinylState: VinylState;
  playbackState: PlaybackState;
  currentVinyl: IVinyl | null;
}

/**
 * Turntable resource representation with HATEOAS links
 */
export interface ITurntableResource extends ITurntableState {
  _links: IHateoasLinks;
}

/**
 * API entry point links
 */
export interface IEntryPointLinks {
  self: IHateoasLink;
  turntable: IHateoasLink;
}

/**
 * API entry point resource
 */
export interface IEntryPointResource {
  _links: IEntryPointLinks;
}

/**
 * Error codes for API responses
 */
export enum ErrorCode {
  INVALID_STATE_TRANSITION = 'INVALID_STATE_TRANSITION',
  BAD_REQUEST = 'BAD_REQUEST',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  PLAYBACK_ERROR = 'PLAYBACK_ERROR',
}

/**
 * Error response structure
 */
export interface IErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
  };
}
