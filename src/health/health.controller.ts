import { Controller, Get } from '@nestjs/common';

/**
 * Health check response structure
 */
interface IHealthResponse {
  status: string;
  timestamp: string;
}

/**
 * Controller for health check endpoint.
 */
@Controller('health')
export class HealthController {
  /**
   * GET /health - Technical health check
   */
  @Get()
  check(): IHealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}

