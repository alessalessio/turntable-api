import { HttpException, HttpStatus } from '@nestjs/common';
import { TurntableService } from './turntable.service';
import { MidiTracksService } from '../midi/midi-tracks.service';
import { PowerState, VinylState, PlaybackState, ErrorCode } from './turntable.interface';

describe('TurntableService', () => {
  let service: TurntableService;
  let midiTracksService: MidiTracksService;

  const mockTrack = {
    id: 'test-track',
    title: 'Test Track',
    composer: 'Test Composer',
    url: 'http://example.com/test.mid',
  };

  beforeEach(() => {
    midiTracksService = {
      isAvailable: jest.fn().mockReturnValue(true),
      getLoadError: jest.fn().mockReturnValue(null),
      getRandomTrack: jest.fn().mockReturnValue(mockTrack),
      getAllTracks: jest.fn().mockReturnValue([mockTrack]),
    } as unknown as MidiTracksService;
    service = new TurntableService(midiTracksService);
  });

  describe('getState', () => {
    it('should return initial state with power-on link only', () => {
      const state = service.getState();
      expect(state.powerState).toBe(PowerState.OFF);
      expect(state.vinylState).toBe(VinylState.EMPTY);
      expect(state.playbackState).toBe(PlaybackState.STOPPED);
      expect(state.currentVinyl).toBeNull();
      expect(state._links.self).toBeDefined();
      expect(state._links['power-on']).toBeDefined();
      expect(state._links['power-off']).toBeUndefined();
      expect(state._links.play).toBeUndefined();
    });
  });

  describe('powerOn', () => {
    it('should power on when OFF', () => {
      const state = service.powerOn();
      expect(state.powerState).toBe(PowerState.ON);
      expect(state._links['power-on']).toBeUndefined();
      expect(state._links['power-off']).toBeDefined();
      expect(state._links['put-vinyl']).toBeDefined();
    });

    it('should throw when already ON', () => {
      service.powerOn();
      expect(() => service.powerOn()).toThrow(HttpException);
      try {
        service.powerOn();
      } catch (e) {
        const error = e as HttpException;
        expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
        const response = error.getResponse() as { error: { code: string } };
        expect(response.error.code).toBe(ErrorCode.INVALID_STATE_TRANSITION);
      }
    });
  });

  describe('powerOff', () => {
    it('should power off when ON and STOPPED', () => {
      service.powerOn();
      const state = service.powerOff();
      expect(state.powerState).toBe(PowerState.OFF);
      expect(state._links['power-on']).toBeDefined();
    });

    it('should throw when OFF', () => {
      expect(() => service.powerOff()).toThrow(HttpException);
    });

    it('should throw when PLAYING', () => {
      service.powerOn();
      service.putVinyl();
      service.play();
      expect(() => service.powerOff()).toThrow(HttpException);
    });
  });

  describe('putVinyl', () => {
    it('should load random vinyl when ON', () => {
      service.powerOn();
      const state = service.putVinyl();
      expect(state.vinylState).toBe(VinylState.LOADED);
      expect(state.currentVinyl).toEqual({
        id: mockTrack.id,
        title: mockTrack.title,
        composer: mockTrack.composer,
        midiUrl: mockTrack.url,
      });
      expect(state._links['change-vinyl']).toBeDefined();
      expect(state._links['change-vinyl']?.method).toBe('PUT');
      expect(state._links['remove-vinyl']).toBeDefined();
      expect(state._links.play).toBeDefined();
      expect(midiTracksService.getRandomTrack).toHaveBeenCalled();
    });

    it('should change vinyl when already loaded', () => {
      service.powerOn();
      service.putVinyl();
      const newTrack = { ...mockTrack, id: 'new-track', title: 'New Track' };
      (midiTracksService.getRandomTrack as jest.Mock).mockReturnValue(newTrack);
      const state = service.putVinyl();
      expect(state.currentVinyl?.id).toBe('new-track');
    });

    it('should throw when OFF', () => {
      expect(() => service.putVinyl()).toThrow(HttpException);
    });

    it('should throw when PLAYING', () => {
      service.powerOn();
      service.putVinyl();
      service.play();
      expect(() => service.putVinyl()).toThrow(HttpException);
    });

    it('should throw 500 when MIDI catalog not available', () => {
      (midiTracksService.isAvailable as jest.Mock).mockReturnValue(false);
      (midiTracksService.getLoadError as jest.Mock).mockReturnValue('Catalog not loaded');
      service.powerOn();
      try {
        service.putVinyl();
        fail('Should have thrown');
      } catch (e) {
        const error = e as HttpException;
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        const response = error.getResponse() as { error: { code: string } };
        expect(response.error.code).toBe(ErrorCode.INTERNAL_ERROR);
      }
    });
  });

  describe('removeVinyl', () => {
    it('should remove vinyl when loaded and stopped', () => {
      service.powerOn();
      service.putVinyl();
      const state = service.removeVinyl();
      expect(state.vinylState).toBe(VinylState.EMPTY);
      expect(state.currentVinyl).toBeNull();
      expect(state._links['put-vinyl']).toBeDefined();
      expect(state._links['put-vinyl']?.method).toBe('PUT');
    });

    it('should throw when no vinyl loaded', () => {
      service.powerOn();
      expect(() => service.removeVinyl()).toThrow(HttpException);
    });

    it('should throw when OFF', () => {
      expect(() => service.removeVinyl()).toThrow(HttpException);
    });

    it('should throw when PLAYING', () => {
      service.powerOn();
      service.putVinyl();
      service.play();
      expect(() => service.removeVinyl()).toThrow(HttpException);
    });
  });

  describe('play', () => {
    it('should start playing when ON, LOADED, and STOPPED', () => {
      service.powerOn();
      service.putVinyl();
      const state = service.play();
      expect(state.playbackState).toBe(PlaybackState.PLAYING);
      expect(state._links.stop).toBeDefined();
      expect(state._links.play).toBeUndefined();
      expect(state._links['power-off']).toBeUndefined();
      expect(state._links['change-vinyl']).toBeUndefined();
    });

    it('should throw when OFF', () => {
      expect(() => service.play()).toThrow(HttpException);
    });

    it('should throw when no vinyl loaded', () => {
      service.powerOn();
      expect(() => service.play()).toThrow(HttpException);
    });

    it('should throw when already PLAYING', () => {
      service.powerOn();
      service.putVinyl();
      service.play();
      expect(() => service.play()).toThrow(HttpException);
    });
  });

  describe('stop', () => {
    it('should stop when PLAYING', () => {
      service.powerOn();
      service.putVinyl();
      service.play();
      const state = service.stop();
      expect(state.playbackState).toBe(PlaybackState.STOPPED);
      expect(state._links.play).toBeDefined();
      expect(state._links.stop).toBeUndefined();
    });

    it('should throw when not PLAYING', () => {
      service.powerOn();
      expect(() => service.stop()).toThrow(HttpException);
    });
  });

  describe('HATEOAS links', () => {
    it('should only show power-on when OFF', () => {
      const state = service.getState();
      expect(Object.keys(state._links)).toEqual(['self', 'power-on']);
    });

    it('should show correct links when ON and EMPTY', () => {
      service.powerOn();
      const state = service.getState();
      expect(state._links['power-off']).toBeDefined();
      expect(state._links['put-vinyl']).toBeDefined();
      expect(state._links['put-vinyl']?.method).toBe('PUT');
      expect(state._links.play).toBeUndefined();
    });

    it('should show correct links when ON and LOADED and STOPPED', () => {
      service.powerOn();
      service.putVinyl();
      const state = service.getState();
      expect(state._links['power-off']).toBeDefined();
      expect(state._links['change-vinyl']).toBeDefined();
      expect(state._links['change-vinyl']?.method).toBe('PUT');
      expect(state._links['remove-vinyl']).toBeDefined();
      expect(state._links.play).toBeDefined();
      expect(state._links.stop).toBeUndefined();
    });

    it('should only show stop when PLAYING', () => {
      service.powerOn();
      service.putVinyl();
      service.play();
      const state = service.getState();
      expect(Object.keys(state._links)).toEqual(['self', 'stop']);
    });
  });
});
