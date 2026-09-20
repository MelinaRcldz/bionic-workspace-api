import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TelemetryService } from './telemetry.service';
import { CreateTelemetryDto } from './dto/create-telemetry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request';

@ApiTags('Telemetry')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('devices/:deviceId/telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar telemetría y evaluar umbrales automáticos',
  })
  @ApiCreatedResponse({
    description:
      'Telemetría procesada exitosamente. Si supera umbrales, genera una alerta y actualiza el estado del componente.',
    schema: {
      example: {
        message: 'Telemetría procesada: ¡Alerta generada!',
        log: {
          id: '92720514-1813-49f7-9116-9e29bc218141',
          value: '75.00',
          deviceId: '82bae305-6b85-4626-8140-503cd56dd1ff',
          componentId: 'a7d45b89-448c-441b-a781-6ba0fe26f978',
          createdAt: '2026-08-27T12:21:49.011Z',
        },
        componentStatus: 'CRITICAL',
        statusReason: null,
        evaluation: {
        isOutOfBounds: true,
        breachType: 'OVER_MAX',
        },
        alert: {
          id: 'c32913a4-b64c-4d05-a176-db560f36dc0c',
          message:
            'El componente superó el umbral máximo de 40 con un valor de 75.00',
          severity: 'CRITICAL',
          valueRecorded: '75.00',
          isResolved: false,
          deviceId: '82bae305-6b85-4626-8140-503cd56dd1ff',
          componentId: 'a7d45b89-448c-441b-a781-6ba0fe26f978',
          createdAt: '2026-08-27T12:21:49.047Z',
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Datos de telemetría inválidos' })
  @ApiNotFoundResponse({
    description: 'Dispositivo o componente no encontrado o no pertenece al usuario',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  processTelemetry(
    @Param('deviceId', ParseUUIDPipe) deviceId: string,
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
  @ApiOperation({
    summary: 'Obtener el historial de telemetría de un dispositivo',
  })
  @ApiOkResponse({
    description: 'Listado histórico de lecturas de telemetría',
  })
  @ApiNotFoundResponse({
    description: 'Dispositivo no encontrado o no pertenece al usuario',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  findAllByDevice(
    @Param('deviceId', ParseUUIDPipe) deviceId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.telemetryService.findAllByDevice(deviceId, req.user.id);
  }
}
