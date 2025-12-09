import { MidiTracksService } from './midi-tracks.service';

describe('MidiTracksService', () => {
  let service: MidiTracksService;

  beforeEach(() => {
    service = new MidiTracksService();
  });

  describe('onModuleInit', () => {
    it('should load tracks from config file', () => {
      service.onModuleInit();
      expect(service.isAvailable()).toBe(true);
      expect(service.getAllTracks().length).toBeGreaterThan(0);
    });
  });

  describe('getRandomTrack', () => {
    it('should return a track from the catalog', () => {
      service.onModuleInit();
      const track = service.getRandomTrack();
      expect(track).toBeDefined();
      expect(track.id).toBeDefined();
      expect(track.title).toBeDefined();
      expect(track.composer).toBeDefined();
      expect(track.url).toBeDefined();
    });

    it('should throw when catalog not loaded', () => {
      expect(() => service.getRandomTrack()).toThrow();
    });
  });

  describe('isAvailable', () => {
    it('should return false before loading', () => {
      expect(service.isAvailable()).toBe(false);
    });

    it('should return true after successful load', () => {
      service.onModuleInit();
      expect(service.isAvailable()).toBe(true);
    });
  });
});

