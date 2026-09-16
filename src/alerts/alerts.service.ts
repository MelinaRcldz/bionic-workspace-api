import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, desc } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.module';
import { devices, alerts, components, telemetryLogs } from '../database/schema';
import * as schema from '../database/schema';

@Injectable()
export class AlertsService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findAlertsByDevice(deviceId: string, userId: string) {
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
      .from(alerts)
      .where(eq(alerts.deviceId, deviceId))
      .orderBy(desc(alerts.createdAt));
  }

  async findOne(alertId: string, userId: string) {
    // Buscar la alerta unida a su dispositivo para validar pertenencia al usuario
    const [result] = await this.db
      .select({
        alert: alerts,
      })
      .from(alerts)
      .innerJoin(devices, eq(alerts.deviceId, devices.id))
      .where(and(eq(alerts.id, alertId), eq(devices.userId, userId)));

    if (!result) {
      throw new NotFoundException(
        'Alerta no encontrada o no pertenece al usuario',
      );
    }

    return result.alert;
  }

  async resolveAlert(alertId: string, userId: string) {
    // 1. Verificar que la alerta exista y pertenezca al usuario
    const [result] = await this.db
      .select({
        alert: alerts,
      })
      .from(alerts)
      .innerJoin(devices, eq(alerts.deviceId, devices.id))
      .where(and(eq(alerts.id, alertId), eq(devices.userId, userId)));

    if (!result) {
      throw new NotFoundException(
        'Alerta no encontrada o no pertenece al usuario',
      );
    }

    // 2. Marcar la alerta como resuelta
    const [updatedAlert] = await this.db
      .update(alerts)
      .set({
        isResolved: true,
        resolvedAt: new Date(),
      })
      .where(eq(alerts.id, alertId))
      .returning();

    // 3. Buscar el componente afectado
    const [component] = await this.db
      .select()
      .from(components)
      .where(eq(components.id, updatedAlert.componentId));

    if (component) {
      // 4. Buscar la última telemetría del componente
      const [lastLog] = await this.db
        .select()
        .from(telemetryLogs)
        .where(eq(telemetryLogs.componentId, component.id))
        .orderBy(desc(telemetryLogs.createdAt))
        .limit(1);

      let newStatus = 'OPERATIONAL';
      let newStatusReason: string | null = null;

      // 5. Comprobar si el problema físico sigue presente
      if (lastLog) {
        const val = parseFloat(lastLog.value);

        const min =
          component.minThreshold !== null
            ? parseFloat(component.minThreshold)
            : null;

        const max =
          component.maxThreshold !== null
            ? parseFloat(component.maxThreshold)
            : null;

        const isStillOutOfBounds =
          (min !== null && val < min) || (max !== null && val > max);

        if (isStillOutOfBounds) {
          newStatus = 'WARNING';
          newStatusReason = 'PERSISTENT_AFTER_RESOLUTION';
        }
      }

      // 6. Actualizar el estado actual del componente
      await this.db
        .update(components)
        .set({
          status: newStatus,
          statusReason: newStatusReason,
          updatedAt: new Date(),
        })
        .where(eq(components.id, component.id));
    }

    return {
      message: 'Alerta marcada como resuelta exitosamente',
      alert: updatedAlert,
    };
  }
}
