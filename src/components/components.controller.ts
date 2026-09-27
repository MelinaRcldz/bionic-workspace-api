import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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
import { ComponentsService } from './components.service';
import { CreateComponentDto } from './dto/create-component.dto';
import { UpdateComponentDto } from './dto/update-component.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request';

@ApiTags('Components')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('devices/:deviceId/components')
export class ComponentsController {
  constructor(private readonly componentsService: ComponentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Agregar un nuevo componente a un dispositivo' })
  @ApiCreatedResponse({
    description: 'Componente creado exitosamente',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Servo Motor SG90',
        type: 'ACTUATOR',
        minThreshold: '0.00',
        maxThreshold: '85.50',
        minSeverity: 'WARNING',
        maxSeverity: 'CRITICAL',
        status: 'OPERATIONAL',
        statusReason: null,
        unit: '°C',
        deviceId: '987e6543-e21b-12d3-a456-426614174000',
        createdAt: '2026-09-20T14:00:00.000Z',
        updatedAt: '2026-09-20T14:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Datos del componente inválidos' })
  @ApiNotFoundResponse({
    description: 'Dispositivo no encontrado o no pertenece al usuario',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  create(
    @Param('deviceId') deviceId: string,
    @Body() createComponentDto: CreateComponentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.componentsService.create(
      deviceId,
      req.user.id,
      createComponentDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los componentes de un dispositivo' })
  @ApiOkResponse({
    description: 'Lista de componentes pertenecientes al dispositivo',
  })
  @ApiNotFoundResponse({
    description: 'Dispositivo no encontrado o no pertenece al usuario',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  findAll(
    @Param('deviceId') deviceId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.componentsService.findAllByDevice(deviceId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un componente por ID' })
  @ApiOkResponse({
    description: 'Componente encontrado',
  })
  @ApiNotFoundResponse({
    description: 'Componente o dispositivo no encontrado',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  findOne(
    @Param('deviceId') deviceId: string,
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.componentsService.findOne(id, deviceId, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar la información de un componente' })
  @ApiOkResponse({ description: 'Componente actualizado exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos de actualización inválidos' })
  @ApiNotFoundResponse({
    description: 'Componente o dispositivo no encontrado',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  update(
    @Param('deviceId') deviceId: string,
    @Param('id') id: string,
    @Body() updateComponentDto: UpdateComponentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.componentsService.update(
      id,
      deviceId,
      req.user.id,
      updateComponentDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un componente' })
  @ApiOkResponse({
    schema: {
      example: { message: 'Componente eliminado correctamente' },
    },
  })
  @ApiNotFoundResponse({
    description: 'Componente o dispositivo no encontrado',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  remove(
    @Param('deviceId') deviceId: string,
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.componentsService.remove(id, deviceId, req.user.id);
  }
}
