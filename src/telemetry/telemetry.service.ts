import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../database/database.module';
import { devices, components, telemetryLogs, alerts } from '../database/schema';
import * as schema from '../database/schema';
import { CreateTelemetryDto } from './dto/create-telemetry.dto';
import { eq, and, desc } from 'drizzle-orm';

export type AlertSeverity = 'WARNING' | 'CRITICAL';

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
      throw new NotFoundException(
        'Dispositivo no encontrado o no pertenece al usuario',
      );
    }

    const [component] = await this.db
      .select()
      .from(components)
      .where(
        and(eq(components.id, componentId), eq(components.deviceId, deviceId)),
      );

    if (!component) {
      throw new NotFoundException(
        'El componente no pertenece al dispositivo indicado',
      );
    }

    return { device, component };
  }

  private evaluateThresholds(
    valueStr: string,
    component: typeof components.$inferSelect,
  ) {
    const val = parseFloat(valueStr);

    const min =
      component.minThreshold !== null
        ? parseFloat(component.minThreshold)
        : null;

    const max =
      component.maxThreshold !== null
        ? parseFloat(component.maxThreshold)
        : null;

    let isOutOfBounds = false;
    let breachType: 'UNDER_MIN' | 'OVER_MAX' | null = null;

    if (min !== null && val < min) {
      isOutOfBounds = true;
      breachType = 'UNDER_MIN';
    } else if (max !== null && val > max) {
      isOutOfBounds = true;
      breachType = 'OVER_MAX';
    }

    return {
      isOutOfBounds,
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

    // 2. Evaluar valor contra umbrales
    const evaluation = this.evaluateThresholds(
      createTelemetryDto.value,
      component,
    );

    let generatedAlert: typeof alerts.$inferSelect | null = null;
    let newStatus = 'OPERATIONAL';
    let newStatusReason: string | null = null;

    // 3. Determinar estado del componente y generar alerta si corresponde
    if (evaluation.isOutOfBounds) {
      // 🔴 FUERA DE RANGO -> Asignar severidad y resetear statusReason
      const severity: AlertSeverity =
        evaluation.breachType === 'OVER_MAX'
          ? (component.maxSeverity as AlertSeverity) || 'CRITICAL'
          : (component.minSeverity as AlertSeverity) || 'WARNING';

      newStatus = severity;
      newStatusReason = null;

      const message =
        evaluation.breachType === 'OVER_MAX'
          ? `El componente superó el umbral máximo de ${evaluation.max} con un valor de ${createTelemetryDto.value}`
          : `El componente cayó por debajo del umbral mínimo de ${evaluation.min} con un valor de ${createTelemetryDto.value}`;

      const [alertCreated] = await this.db
        .insert(alerts)
        .values({
          message,
          severity,
          valueRecorded: createTelemetryDto.value,
          deviceId,
          componentId: component.id,
          isResolved: false,
        })
        .returning();

      generatedAlert = alertCreated;
    } else {
      // 🟢 DENTRO DE RANGO -> Evaluar según estado previo del componente
      if (component.status === 'CRITICAL') {
        // Primera lectura normal tras un CRITICAL
        newStatus = 'WARNING';
        newStatusReason = 'RECOVERY';
      } else if (
        component.status === 'WARNING' &&
        component.statusReason === 'RECOVERY'
      ) {
        // Segunda lectura normal consecutiva -> Recuperación completa
        newStatus = 'OPERATIONAL';
        newStatusReason = null;
      } else {
        // Lectura normal sin recuperación pendiente -> OPERATIONAL
        newStatus = 'OPERATIONAL';
        newStatusReason = null;
      }
    }

    // 4. Actualizar estado del componente
    await this.db
      .update(components)
      .set({
        status: newStatus,
        statusReason: newStatusReason,
        updatedAt: new Date(),
      })
      .where(eq(components.id, component.id));

    return {
      message: evaluation.isOutOfBounds
        ? 'Telemetría procesada: ¡Alerta generada!'
        : 'Telemetría procesada exitosamente',
      log,
      componentStatus: newStatus,
      statusReason: newStatusReason,
      evaluation: {
        isOutOfBounds: evaluation.isOutOfBounds,
        breachType: evaluation.breachType,
      },
      alert: generatedAlert,
    };
  }

  async findAllByDevice(deviceId: string, userId: string) {
    const [device] = await this.db
      .select()
      .from(devices)
      .where(and(eq(devices.id, deviceId), eq(devices.userId, userId)));

    if (!device) {
      throw new NotFoundException(
        'Dispositivo no encontrado o no pertenece al usuario',
      );
    }

    return this.db
      .select()
      .from(telemetryLogs)
      .where(eq(telemetryLogs.deviceId, deviceId))
      .orderBy(desc(telemetryLogs.createdAt));
  }
}
