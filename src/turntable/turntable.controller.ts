import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TurntableService } from './turntable.service';
import { ITurntableResource } from './turntable.interface';

/**
 * Controller for turntable resource endpoints.
 * Implements HATEOAS-compliant REST API for managing turntable state.
 */
@Controller('turntable')
export class TurntableController {
  constructor(private readonly turntableService: TurntableService) {}

  /**
   * GET /turntable - Retrieve current turntable state with HATEOAS links
   */
  @Get()
  getState(): ITurntableResource {
    return this.turntableService.getState();
  }

  /**
   * POST /turntable/power/on - Power on the turntable
   */
  @Post('power/on')
  @HttpCode(HttpStatus.OK)
  powerOn(): ITurntableResource {
    return this.turntableService.powerOn();
  }

  /**
   * POST /turntable/power/off - Power off the turntable
   */
  @Post('power/off')
  @HttpCode(HttpStatus.OK)
  powerOff(): ITurntableResource {
    return this.turntableService.powerOff();
  }

  /**
   * PUT /turntable/vinyl - Put or change vinyl (randomly selected from MIDI catalog)
   * No request body required - server selects a random MIDI track
   */
  @Put('vinyl')
  @HttpCode(HttpStatus.OK)
  putVinyl(): ITurntableResource {
    return this.turntableService.putVinyl();
  }

  /**
   * DELETE /turntable/vinyl - Remove vinyl from the turntable
   */
  @Delete('vinyl')
  @HttpCode(HttpStatus.OK)
  removeVinyl(): ITurntableResource {
    return this.turntableService.removeVinyl();
  }

  /**
   * POST /turntable/play - Start playing music (state change only)
   */
  @Post('play')
  @HttpCode(HttpStatus.OK)
  play(): ITurntableResource {
    return this.turntableService.play();
  }

  /**
   * POST /turntable/stop - Stop playing music (state change only)
   */
  @Post('stop')
  @HttpCode(HttpStatus.OK)
  stop(): ITurntableResource {
    return this.turntableService.stop();
  }
}
