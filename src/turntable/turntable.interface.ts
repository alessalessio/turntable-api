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
 * Collection of HATEOAS links
 */
export interface IHateoasLinks {
  self: IHateoasLink;
  'power-on'?: IHateoasLink;
  'power-off'?: IHateoasLink;
  'put-vinyl'?: IHateoasLink;
  'change-vinyl'?: IHateoasLink;
  'remove-vinyl'?: IHateoasLink;
  play?: IHateoasLink;
  stop?: IHateoasLink;
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
