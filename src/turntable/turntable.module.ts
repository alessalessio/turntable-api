import { Module } from '@nestjs/common';
import { TurntableController } from './turntable.controller';
import { TurntableService } from './turntable.service';
import { MidiModule } from '../midi/midi.module';

/**
 * Module for turntable domain functionality.
 */
@Module({
  imports: [MidiModule],
  controllers: [TurntableController],
  providers: [TurntableService],
  exports: [TurntableService],
})
export class TurntableModule {}
