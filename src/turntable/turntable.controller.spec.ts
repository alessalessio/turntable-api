import { Test, TestingModule } from '@nestjs/testing';
import { TurntableController } from './turntable.controller';
import { TurntableService } from './turntable.service';
import { MidiTracksService } from '../midi/midi-tracks.service';
import { PowerState, VinylState, PlaybackState } from './turntable.interface';

describe('TurntableController', () => {
  let controller: TurntableController;

  const mockTrack = {
    id: 'test-track',
    title: 'Test Track',
    composer: 'Test Composer',
    url: 'http://example.com/test.mid',
  };

  beforeEach(async () => {
    const mockMidiTracksService = {
      isAvailable: jest.fn().mockReturnValue(true),
      getLoadError: jest.fn().mockReturnValue(null),
      getRandomTrack: jest.fn().mockReturnValue(mockTrack),
      getAllTracks: jest.fn().mockReturnValue([mockTrack]),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TurntableController],
      providers: [
        TurntableService,
        { provide: MidiTracksService, useValue: mockMidiTracksService },
      ],
    }).compile();
    controller = module.get<TurntableController>(TurntableController);
  });

  describe('getState', () => {
    it('should return current turntable state', () => {
      const result = controller.getState();
      expect(result.powerState).toBe(PowerState.OFF);
      expect(result._links).toBeDefined();
    });
  });

  describe('powerOn', () => {
    it('should power on the turntable', () => {
      const result = controller.powerOn();
      expect(result.powerState).toBe(PowerState.ON);
    });
  });

  describe('powerOff', () => {
    it('should power off the turntable', () => {
      controller.powerOn();
      const result = controller.powerOff();
      expect(result.powerState).toBe(PowerState.OFF);
    });
  });

  describe('putVinyl', () => {
    it('should put random vinyl on the turntable', () => {
      controller.powerOn();
      const result = controller.putVinyl();
      expect(result.vinylState).toBe(VinylState.LOADED);
      expect(result.currentVinyl?.id).toBe(mockTrack.id);
      expect(result.currentVinyl?.composer).toBe(mockTrack.composer);
      expect(result.currentVinyl?.midiUrl).toBe(mockTrack.url);
    });
  });

  describe('removeVinyl', () => {
    it('should remove vinyl from the turntable', () => {
      controller.powerOn();
      controller.putVinyl();
      const result = controller.removeVinyl();
      expect(result.vinylState).toBe(VinylState.EMPTY);
      expect(result.currentVinyl).toBeNull();
    });
  });

  describe('play', () => {
    it('should start playing', () => {
      controller.powerOn();
      controller.putVinyl();
      const result = controller.play();
      expect(result.playbackState).toBe(PlaybackState.PLAYING);
    });
  });

  describe('stop', () => {
    it('should stop playing', () => {
      controller.powerOn();
      controller.putVinyl();
      controller.play();
      const result = controller.stop();
      expect(result.playbackState).toBe(PlaybackState.STOPPED);
    });
  });
});
