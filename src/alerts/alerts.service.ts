import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, desc } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.module';
import { devices, alerts } from '../database/schema';
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
}