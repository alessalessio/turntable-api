import { Module } from '@nestjs/common';
import { MidiTracksService } from './midi-tracks.service';

/**
 * Module for MIDI-related services.
 */
@Module({
  providers: [MidiTracksService],
  exports: [MidiTracksService],
})
export class MidiModule {}

