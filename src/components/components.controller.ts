import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ComponentsService } from './components.service';
import { CreateComponentDto } from './dto/create-component.dto';
import { UpdateComponentDto } from './dto/update-component.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request';

@UseGuards(JwtAuthGuard)
@Controller('devices/:deviceId/components')
export class ComponentsController {
  constructor(private readonly componentsService: ComponentsService) {}

  @Post()
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
  findAll(
    @Param('deviceId') deviceId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.componentsService.findAllByDevice(deviceId, req.user.id);
  }

  @Get(':id')
  findOne(
    @Param('deviceId') deviceId: string,
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.componentsService.findOne(id, deviceId, req.user.id);
  }

  @Patch(':id')
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
  remove(
    @Param('deviceId') deviceId: string,
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.componentsService.remove(id, deviceId, req.user.id);
  }
}
