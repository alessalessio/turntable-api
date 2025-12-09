import { Controller, Get } from '@nestjs/common';
import { IEntryPointResource } from './turntable/turntable.interface';

/**
 * Controller for API entry point.
 * Provides HATEOAS discovery for available resources.
 */
@Controller()
export class AppController {
  /**
   * GET / - API entry point with HATEOAS links
   */
  @Get()
  getEntryPoint(): IEntryPointResource {
    return {
      _links: {
        self: { href: '/', method: 'GET' },
        turntable: { href: '/turntable', method: 'GET' },
      },
    };
  }
}

