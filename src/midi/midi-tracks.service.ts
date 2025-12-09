import { Injectable, OnModuleInit } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { IMidiTrack } from '../turntable/turntable.interface';

/**
 * Service for loading and managing the MIDI track catalog.
 * Loads tracks from config/midi-tracks.json at startup.
 */
@Injectable()
export class MidiTracksService implements OnModuleInit {
  private tracks: IMidiTrack[] = [];
  private loadError: string | null = null;

  /**
   * Loads MIDI tracks from JSON file on module initialization
   */
  onModuleInit(): void {
    try {
      const configPath = join(process.cwd(), 'config', 'midi-tracks.json');
      const fileContent = readFileSync(configPath, 'utf-8');
      const parsed: unknown = JSON.parse(fileContent);
      if (!Array.isArray(parsed)) {
        this.loadError = 'MIDI tracks file must contain an array';
        return;
      }
      this.tracks = parsed as IMidiTrack[];
      if (this.tracks.length === 0) {
        this.loadError = 'MIDI tracks catalog is empty';
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.loadError = `Failed to load MIDI tracks: ${message}`;
    }
  }

  /**
   * Checks if the catalog is available and non-empty
   */
  isAvailable(): boolean {
    return this.loadError === null && this.tracks.length > 0;
  }

  /**
   * Gets the load error message if any
   */
  getLoadError(): string | null {
    return this.loadError;
  }

  /**
   * Selects a random track from the catalog
   */
  getRandomTrack(): IMidiTrack {
    if (!this.isAvailable()) {
      throw new Error(this.loadError ?? 'MIDI catalog not available');
    }
    const index = Math.floor(Math.random() * this.tracks.length);
    return this.tracks[index];
  }

  /**
   * Gets all tracks (for testing purposes)
   */
  getAllTracks(): IMidiTrack[] {
    return [...this.tracks];
  }
}

