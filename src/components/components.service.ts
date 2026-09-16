import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../database/database.module';
import { components, devices } from '../database/schema';
import * as schema from '../database/schema';
import { CreateComponentDto } from './dto/create-component.dto';
import { UpdateComponentDto } from './dto/update-component.dto';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class ComponentsService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  // Verifica que el dispositivo pertenezca al usuario autenticado
  private async verifyDeviceOwnership(deviceId: string, userId: string) {
    const [device] = await this.db
      .select()
      .from(devices)
      .where(and(eq(devices.id, deviceId), eq(devices.userId, userId)));

    if (!device) {
      throw new NotFoundException(
        'Dispositivo no encontrado o no pertenece al usuario',
      );
    }
    return device;
  }

  // Validación de lógica de negocio para umbrales operativos
  private validateThresholds(min?: string, max?: string) {
    if (min !== undefined && max !== undefined) {
      const minNum = parseFloat(min);
      const maxNum = parseFloat(max);

      if (isNaN(minNum) || isNaN(maxNum)) {
        throw new BadRequestException(
          'Los umbrales deben ser valores numéricos válidos',
        );
      }

      if (minNum >= maxNum) {
        throw new BadRequestException(
          `El umbral mínimo (${minNum}) debe ser menor que el umbral máximo (${maxNum})`,
        );
      }
    }
  }

  async create(
    deviceId: string,
    userId: string,
    createComponentDto: CreateComponentDto,
  ) {
    await this.verifyDeviceOwnership(deviceId, userId);

    // Validar rango numérico de umbrales
    this.validateThresholds(
      createComponentDto.minThreshold,
      createComponentDto.maxThreshold,
    );

    const [newComponent] = await this.db
      .insert(components)
      .values({
        ...createComponentDto,
        deviceId,
      })
      .returning();

    return newComponent;
  }

  async findAllByDevice(deviceId: string, userId: string) {
    await this.verifyDeviceOwnership(deviceId, userId);

    return this.db
      .select()
      .from(components)
      .where(eq(components.deviceId, deviceId));
  }

  async findOne(id: string, deviceId: string, userId: string) {
    await this.verifyDeviceOwnership(deviceId, userId);

    const [component] = await this.db
      .select()
      .from(components)
      .where(and(eq(components.id, id), eq(components.deviceId, deviceId)));

    if (!component) {
      throw new NotFoundException('Componente no encontrado');
    }

    return component;
  }

  async update(
    id: string,
    deviceId: string,
    userId: string,
    updateComponentDto: UpdateComponentDto,
  ) {
    const currentComponent = await this.findOne(id, deviceId, userId);

    // Evaluar los nuevos umbrales combinados con los existentes
    const effectiveMin =
      updateComponentDto.minThreshold ??
      currentComponent.minThreshold ??
      undefined;
    const effectiveMax =
      updateComponentDto.maxThreshold ??
      currentComponent.maxThreshold ??
      undefined;

    this.validateThresholds(effectiveMin, effectiveMax);

    const [updatedComponent] = await this.db
      .update(components)
      .set({ ...updateComponentDto, updatedAt: new Date() })
      .where(and(eq(components.id, id), eq(components.deviceId, deviceId)))
      .returning();

    return updatedComponent;
  }

  async remove(id: string, deviceId: string, userId: string) {
    await this.findOne(id, deviceId, userId);

    await this.db
      .delete(components)
      .where(and(eq(components.id, id), eq(components.deviceId, deviceId)));

    return { message: 'Componente eliminado correctamente' };
  }
}
