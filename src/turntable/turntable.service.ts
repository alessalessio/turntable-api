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
  ActionName,
  StateId,
} from './turntable.interface';
import { FSM_STATES, FSM_TRANSITIONS, ACTION_LINKS } from './fsm';
import { MidiTracksService } from '../midi/midi-tracks.service';

/**
 * Service managing the turntable domain state and transitions.
 * Uses an explicit FSM as the single source of truth.
 */
@Injectable()
export class TurntableService {
  private currentStateId: StateId = 'S1';
  private state: ITurntableState = {
    powerState: PowerState.OFF,
    vinylState: VinylState.EMPTY,
    playbackState: PlaybackState.STOPPED,
    currentVinyl: null,
  };

  constructor(private readonly midiTracksService: MidiTracksService) {}

  /**
   * Gets the current turntable state with HATEOAS links.
   */
  getState(): ITurntableResource {
    return {
      ...this.state,
      _links: this.generateLinks(),
    };
  }

  /**
   * Powers on the turntable.
   */
  powerOn(): ITurntableResource {
    return this.applyAction('power-on');
  }

  /**
   * Powers off the turntable.
   */
  powerOff(): ITurntableResource {
    return this.applyAction('power-off');
  }

  /**
   * Puts or changes a vinyl on the turntable.
   */
  putVinyl(): ITurntableResource {
    const action = this.state.vinylState === VinylState.EMPTY
      ? 'put-vinyl'
      : 'change-vinyl';
    return this.applyAction(action);
  }

  /**
   * Removes the vinyl from the turntable.
   */
  removeVinyl(): ITurntableResource {
    return this.applyAction('remove-vinyl');
  }

  /**
   * Starts playing music.
   */
  play(): ITurntableResource {
    return this.applyAction('play');
  }

  /**
   * Stops playing music.
   */
  stop(): ITurntableResource {
    return this.applyAction('stop');
  }

  /**
   * Applies an action using FSM transition lookup.
   * Finds valid transition, updates state, then runs side effects.
   */
  private applyAction(action: ActionName): ITurntableResource {
    const transition = FSM_TRANSITIONS.find(
      (t) => t.from === this.currentStateId && t.action === action,
    );
    if (!transition) {
      throw new HttpException(
        {
          error: {
            code: ErrorCode.INVALID_STATE_TRANSITION,
            message: this.getErrorMessage(action),
          },
        },
        HttpStatus.CONFLICT,
      );
    }
    this.currentStateId = transition.to;
    const fsmState = FSM_STATES[this.currentStateId];
    this.state.powerState = fsmState.powerState;
    this.state.vinylState = fsmState.vinylState;
    this.state.playbackState = fsmState.playbackState;
    this.applySideEffects(action);
    return this.getState();
  }

  /**
   * Executes side effects for actions that require them.
   */
  private applySideEffects(action: ActionName): void {
    switch (action) {
      case 'put-vinyl':
      case 'change-vinyl':
        this.setRandomVinyl();
        break;
      case 'remove-vinyl':
        this.clearVinyl();
        break;
      default:
        break;
    }
  }

  /**
   * Sets a random vinyl from the MIDI catalog.
   */
  private setRandomVinyl(): void {
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
    this.state.currentVinyl = vinyl;
  }

  /**
   * Clears the current vinyl.
   */
  private clearVinyl(): void {
    this.state.currentVinyl = null;
  }

  /**
   * Returns a human-readable error message for a failed action.
   */
  private getErrorMessage(action: ActionName): string {
    const messages: Record<ActionName, string> = {
      'power-on': 'Cannot power on: turntable is already ON',
      'power-off': 'Cannot power off: turntable is OFF or music is playing',
      'put-vinyl': 'Cannot put vinyl: turntable is OFF, music is playing, or vinyl already loaded',
      'change-vinyl': 'Cannot change vinyl: turntable is OFF, music is playing, or no vinyl loaded',
      'remove-vinyl': 'Cannot remove vinyl: turntable is OFF, music is playing, or no vinyl loaded',
      play: 'Cannot play: turntable is OFF, no vinyl loaded, or already playing',
      stop: 'Cannot stop: music is not playing',
    };
    return messages[action];
  }

  /**
   * Generates HATEOAS links by filtering FSM transitions from current state.
   */
  private generateLinks(): IHateoasLinks {
    const links: IHateoasLinks = {
      self: { href: '/turntable', method: 'GET' },
    };
    const availableTransitions = FSM_TRANSITIONS.filter(
      (t) => t.from === this.currentStateId,
    );
    for (const t of availableTransitions) {
      links[t.action] = ACTION_LINKS[t.action];
    }
    return links;
  }
}
