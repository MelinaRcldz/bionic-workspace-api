import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { CreateTelemetryDto } from './dto/create-telemetry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request';

@UseGuards(JwtAuthGuard)
@Controller('devices/:deviceId/telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Post()
  create(
    @Param('deviceId') deviceId: string,
    @Body() createTelemetryDto: CreateTelemetryDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.telemetryService.processTelemetry(
      deviceId,
      req.user.id,
      createTelemetryDto,
    );
  }

  @Get()
  findAll(
    @Param('deviceId') deviceId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.telemetryService.findAllByDevice(deviceId, req.user.id);
  }
}
