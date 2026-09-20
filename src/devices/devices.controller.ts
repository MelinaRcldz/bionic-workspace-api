import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
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
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request';

@ApiTags('Devices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo dispositivo biónico' })
  @ApiCreatedResponse({
    description: 'Dispositivo creado exitosamente',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Brazo Biónico REX-01',
        model: 'REX-V2',
        serialNumber: 'SN-2026-REX-001',
        userId: '987e6543-e21b-12d3-a456-426614174000',
        createdAt: '2026-09-20T14:00:00.000Z',
        updatedAt: '2026-09-20T14:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Datos del dispositivo inválidos' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  create(
    @Body() createDeviceDto: CreateDeviceDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.devicesService.create(createDeviceDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los dispositivos del usuario' })
  @ApiOkResponse({
    description: 'Lista de dispositivos pertenecientes al usuario',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  findAll(@Req() req: AuthenticatedRequest) {
    return this.devicesService.findAllByUser(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un dispositivo por su ID' })
  @ApiOkResponse({ description: 'Dispositivo encontrado' })
  @ApiNotFoundResponse({ description: 'Dispositivo no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.devicesService.findOneByUser(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar la información de un dispositivo' })
  @ApiOkResponse({ description: 'Dispositivo actualizado exitosamente' })
  @ApiNotFoundResponse({ description: 'Dispositivo no encontrado' })
  @ApiBadRequestResponse({ description: 'Datos de actualización inválidos' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.devicesService.update(id, req.user.id, updateDeviceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un dispositivo' })
  @ApiOkResponse({
    schema: {
      example: { message: 'Dispositivo eliminado correctamente' },
    },
  })
  @ApiNotFoundResponse({ description: 'Dispositivo no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.devicesService.remove(id, req.user.id);
  }
}
