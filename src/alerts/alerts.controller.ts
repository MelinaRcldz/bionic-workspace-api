import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request';

@ApiTags('Alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get('devices/:deviceId/alerts')
  @ApiOperation({
    summary: 'Obtener todas las alertas generadas por un dispositivo',
  })
  @ApiOkResponse({
    description:
      'Lista de alertas del dispositivo ordenadas por fecha reciente',
  })
  @ApiNotFoundResponse({
    description: 'Dispositivo no encontrado o no pertenece al usuario',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  findAlertsByDevice(
    @Param('deviceId') deviceId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.alertsService.findAlertsByDevice(deviceId, req.user.id);
  }

  @Get('alerts/:id')
  @ApiOperation({ summary: 'Obtener el detalle de una alerta por ID' })
  @ApiOkResponse({
    description: 'Detalle de la alerta solicitada',
    schema: {
      example: {
        id: 'c32913a4-b64c-4d05-a176-db560f36dc0c',
        message:
          'El componente superó el umbral máximo de 40 con un valor de 75.00',
        severity: 'CRITICAL',
        valueRecorded: '75.00',
        isResolved: false,
        deviceId: '82bae305-6b85-4626-8140-503cd56dd1ff',
        componentId: 'a7d45b89-448c-441b-a781-6ba0fe26f978',
        createdAt: '2026-08-27T12:21:49.047Z',
        resolvedAt: null,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Alerta no encontrada o no pertenece al usuario',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  findOne(
    @Param('id', ParseUUIDPipe) alertId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.alertsService.findOne(alertId, req.user.id);
  }

  @ApiOperation({ summary: 'Marcar una alerta como resuelta' })
  @ApiOkResponse({
    description: 'Alerta resuelta exitosamente',
    schema: {
      example: {
        message: 'Alerta marcada como resuelta exitosamente',
        alert: {
          id: 'c32913a4-b64c-4d05-a176-db560f36dc0c',
          message:
            'El componente superó el umbral máximo de 40 con un valor de 75.00',
          severity: 'CRITICAL',
          valueRecorded: '75.00',
          isResolved: true,
          deviceId: '82bae305-6b85-4626-8140-503cd56dd1ff',
          componentId: 'a7d45b89-448c-441b-a781-6ba0fe26f978',
          createdAt: '2026-08-27T12:21:49.047Z',
          resolvedAt: '2026-08-28T09:51:25.162Z',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Alerta no encontrada o no pertenece al usuario',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  resolve(
    @Param('id', ParseUUIDPipe) alertId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.alertsService.resolveAlert(alertId, req.user.id);
  }
}
