import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  PowerState,
  VinylState,
  PlaybackState,
  ITurntableState,
  ITurntableResource,
  IHateoasLinks,
  IVinyl,
  ErrorCode,
} from './turntable.interface';
import { MidiTracksService } from '../midi/midi-tracks.service';

/**
 * Service managing the turntable domain state and transitions.
 * Implements the state machine for a vinyl turntable with HATEOAS link generation.
 */
@Injectable()
export class TurntableService {
  private state: ITurntableState = {
    powerState: PowerState.OFF,
    vinylState: VinylState.EMPTY,
    playbackState: PlaybackState.STOPPED,
    currentVinyl: null,
  };

  constructor(private readonly midiTracksService: MidiTracksService) {}

  /**
   * Gets the current turntable state with HATEOAS links
   */
  getState(): ITurntableResource {
    return {
      ...this.state,
      _links: this.generateLinks(),
    };
  }

  /**
   * Powers on the turntable.
   * Precondition: powerState = OFF
   */
  powerOn(): ITurntableResource {
    if (this.state.powerState !== PowerState.OFF) {
      throw new HttpException(
        {
          error: {
            code: ErrorCode.INVALID_STATE_TRANSITION,
            message: 'Cannot power on: turntable is already ON',
          },
        },
        HttpStatus.CONFLICT,
      );
    }
    this.state.powerState = PowerState.ON;
    return this.getState();
  }

  /**
   * Powers off the turntable.
   * Precondition: powerState = ON and playbackState = STOPPED
   */
  powerOff(): ITurntableResource {
    if (this.state.powerState !== PowerState.ON) {
      throw new HttpException(
        {
          error: {
            code: ErrorCode.INVALID_STATE_TRANSITION,
            message: 'Cannot power off: turntable is already OFF',
          },
        },
        HttpStatus.CONFLICT,
      );
    }
    if (this.state.playbackState !== PlaybackState.STOPPED) {
      throw new HttpException(
        {
          error: {
            code: ErrorCode.INVALID_STATE_TRANSITION,
            message: 'Cannot power off: music is currently playing',
          },
        },
        HttpStatus.CONFLICT,
      );
    }
    this.state.powerState = PowerState.OFF;
    return this.getState();
  }

  /**
   * Puts or changes a vinyl on the turntable by randomly selecting from the MIDI catalog.
   * Precondition: powerState = ON and playbackState = STOPPED
   */
  putVinyl(): ITurntableResource {
    if (this.state.powerState !== PowerState.ON) {
      throw new HttpException(
        {
          error: {
            code: ErrorCode.INVALID_STATE_TRANSITION,
            message: 'Cannot put vinyl: turntable is OFF',
          },
        },
        HttpStatus.CONFLICT,
      );
    }
    if (this.state.playbackState !== PlaybackState.STOPPED) {
      throw new HttpException(
        {
          error: {
            code: ErrorCode.INVALID_STATE_TRANSITION,
            message: 'Cannot change vinyl: music is currently playing',
          },
        },
        HttpStatus.CONFLICT,
      );
    }
    if (!this.midiTracksService.isAvailable()) {
      throw new HttpException(
        {
          error: {
            code: ErrorCode.INTERNAL_ERROR,
            message: this.midiTracksService.getLoadError() ?? 'MIDI catalog not available',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const track = this.midiTracksService.getRandomTrack();
    const vinyl: IVinyl = {
      id: track.id,
      title: track.title,
      composer: track.composer,
      midiUrl: track.url,
    };
    this.state.vinylState = VinylState.LOADED;
    this.state.currentVinyl = vinyl;
    return this.getState();
  }

  /**
   * Removes the vinyl from the turntable.
   * Precondition: powerState = ON and playbackState = STOPPED
   */
  removeVinyl(): ITurntableResource {
    if (this.state.powerState !== PowerState.ON) {
      throw new HttpException(
        {
          error: {
            code: ErrorCode.INVALID_STATE_TRANSITION,
            message: 'Cannot remove vinyl: turntable is OFF',
          },
        },
        HttpStatus.CONFLICT,
      );
    }
    if (this.state.playbackState !== PlaybackState.STOPPED) {
      throw new HttpException(
        {
          error: {
            code: ErrorCode.INVALID_STATE_TRANSITION,
            message: 'Cannot remove vinyl: music is currently playing',
          },
        },
        HttpStatus.CONFLICT,
      );
    }
    if (this.state.vinylState !== VinylState.LOADED) {
      throw new HttpException(
        {
          error: {
            code: ErrorCode.INVALID_STATE_TRANSITION,
            message: 'Cannot remove vinyl: no vinyl is loaded',
          },
        },
        HttpStatus.CONFLICT,
      );
    }
    this.state.vinylState = VinylState.EMPTY;
    this.state.currentVinyl = null;
    return this.getState();
  }

  /**
   * Starts playing music (state transition only).
   * Precondition: powerState = ON, vinylState = LOADED, playbackState = STOPPED
   */
  play(): ITurntableResource {
    if (this.state.powerState !== PowerState.ON) {
      throw new HttpException(
        {
          error: {
            code: ErrorCode.INVALID_STATE_TRANSITION,
            message: 'Cannot start music: turntable is OFF',
          },
        },
        HttpStatus.CONFLICT,
      );
    }
    if (this.state.vinylState !== VinylState.LOADED) {
      throw new HttpException(
        {
          error: {
            code: ErrorCode.INVALID_STATE_TRANSITION,
            message: 'Cannot start music: no vinyl is loaded',
          },
        },
        HttpStatus.CONFLICT,
      );
    }
    if (this.state.playbackState !== PlaybackState.STOPPED) {
      throw new HttpException(
        {
          error: {
            code: ErrorCode.INVALID_STATE_TRANSITION,
            message: 'Cannot start music: music is already playing',
          },
        },
        HttpStatus.CONFLICT,
      );
    }
    this.state.playbackState = PlaybackState.PLAYING;
    return this.getState();
  }

  /**
   * Stops playing music (state transition only).
   * Precondition: playbackState = PLAYING
   */
  stop(): ITurntableResource {
    if (this.state.playbackState !== PlaybackState.PLAYING) {
      throw new HttpException(
        {
          error: {
            code: ErrorCode.INVALID_STATE_TRANSITION,
            message: 'Cannot stop music: music is not playing',
          },
        },
        HttpStatus.CONFLICT,
      );
    }
    this.state.playbackState = PlaybackState.STOPPED;
    return this.getState();
  }

  /**
   * Generates HATEOAS links based on current state.
   * Only includes links for valid state transitions.
   */
  private generateLinks(): IHateoasLinks {
    const links: IHateoasLinks = {
      self: { href: '/turntable', method: 'GET' },
    };
    const { powerState, vinylState, playbackState } = this.state;
    if (powerState === PowerState.OFF) {
      links['power-on'] = { href: '/turntable/power/on', method: 'POST' };
    }
    if (powerState === PowerState.ON && playbackState === PlaybackState.STOPPED) {
      links['power-off'] = { href: '/turntable/power/off', method: 'POST' };
    }
    if (powerState === PowerState.ON && playbackState === PlaybackState.STOPPED) {
      if (vinylState === VinylState.EMPTY) {
        links['put-vinyl'] = { href: '/turntable/vinyl', method: 'PUT' };
      } else {
        links['change-vinyl'] = { href: '/turntable/vinyl', method: 'PUT' };
        links['remove-vinyl'] = { href: '/turntable/vinyl', method: 'DELETE' };
      }
    }
    if (
      powerState === PowerState.ON &&
      vinylState === VinylState.LOADED &&
      playbackState === PlaybackState.STOPPED
    ) {
      links.play = { href: '/turntable/play', method: 'POST' };
    }
    if (playbackState === PlaybackState.PLAYING) {
      links.stop = { href: '/turntable/stop', method: 'POST' };
    }
    return links;
  }
}
