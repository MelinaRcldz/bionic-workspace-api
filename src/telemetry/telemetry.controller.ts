import { Controller, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { CreateTelemetryDto } from './dto/create-telemetry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('devices/:deviceId/telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Post()
  create(
    @Param('deviceId') deviceId: string,
    @Body() createTelemetryDto: CreateTelemetryDto,
    @Req() req: any,
  ) {
    return this.telemetryService.processTelemetry(
      deviceId,
      req.user.id,
      createTelemetryDto,
    );
  }
}