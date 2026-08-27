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

  // Evalúa el valor contra los umbrales configurados en el componente
  private evaluateThresholds(valueStr: string, component: typeof components.$inferSelect) {
    const val = parseFloat(valueStr);
    const min = component.minThreshold !== null ? parseFloat(component.minThreshold) : null;
    const max = component.maxThreshold !== null ? parseFloat(component.maxThreshold) : null;

    let isOutofBounds = false;
    let breachType: 'UNDER_MIN' | 'OVER_MAX' | null = null;

    if (min !== null && val < min) {
      isOutofBounds = true;
      breachType = 'UNDER_MIN';
    } else if (max !== null && val > max) {
      isOutofBounds = true;
      breachType = 'OVER_MAX';
    }

    return {
      isOutofBounds,
      breachType,
      val,
      min,
      max,
    };
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

    // 1. Guardar log histórico
    const [log] = await this.db
      .insert(telemetryLogs)
      .values({
        value: createTelemetryDto.value,
        deviceId,
        componentId: component.id,
      })
      .returning();

    // 2. Evaluar valor contra umbrales operativos
    const evaluation = this.evaluateThresholds(createTelemetryDto.value, component);

    return {
      message: 'Telemetría procesada y evaluada correctamente',
      log,
      evaluation: {
        isOutofBounds: evaluation.isOutofBounds,
        breachType: evaluation.breachType,
      },
    };
  }
}