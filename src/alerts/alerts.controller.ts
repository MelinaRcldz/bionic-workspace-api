import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller()
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get('devices/:deviceId/alerts')
  findAlertsByDevice(
    @Param('deviceId') deviceId: string,
    @Req() req: any,
  ) {
    return this.alertsService.findAlertsByDevice(
      deviceId,
      req.user.id,
    );
  }
  
  @Get('alerts/:id')
  findOne(
    @Param('id') alertId: string,
    @Req() req: any,
  ) {
    return this.alertsService.findOne(alertId, req.user.id);
  }
}