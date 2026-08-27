import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../database/database.module';
import { devices, components, telemetryLogs } from '../database/schema';
import * as schema from '../database/schema';
import { CreateTelemetryDto } from './dto/create-telemetry.dto';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class TelemetryService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  private async verifyDeviceAndComponent(
    deviceId: string,
    componentId: string,
    userId: string,
  ) {
    const [device] = await this.db
      .select()
      .from(devices)
      .where(and(eq(devices.id, deviceId), eq(devices.userId, userId)));

    if (!device) {
      throw new NotFoundException('Dispositivo no encontrado o no pertenece al usuario');
    }

    const [component] = await this.db
      .select()
      .from(components)
      .where(and(eq(components.id, componentId), eq(components.deviceId, deviceId)));

    if (!component) {
      throw new NotFoundException('El componente no pertenece al dispositivo indicado');
    }

    return { device, component };
  }

  async processTelemetry(
    deviceId: string,
    userId: string,
    createTelemetryDto: CreateTelemetryDto,
  ) {
    const { component } = await this.verifyDeviceAndComponent(
      deviceId,
      createTelemetryDto.componentId,
      userId,
    );

    // Persistencia histórica en la tabla telemetry_logs
    const [log] = await this.db
      .insert(telemetryLogs)
      .values({
        value: createTelemetryDto.value,
        deviceId,
        componentId: component.id,
      })
      .returning();

    return {
      message: 'Telemetría registrada exitosamente',
      log,
    };
  }
}