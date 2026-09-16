import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../database/database.module';
import { devices } from '../database/schema';
import * as schema from '../database/schema';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class DevicesService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(createDeviceDto: CreateDeviceDto, userId: string) {
    const [newDevice] = await this.db
      .insert(devices)
      .values({
        ...createDeviceDto,
        userId,
      })
      .returning();

    return newDevice;
  }

  async findAllByUser(userId: string) {
    return this.db.select().from(devices).where(eq(devices.userId, userId));
  }

  async findOneByUser(id: string, userId: string) {
    const [device] = await this.db
      .select()
      .from(devices)
      .where(and(eq(devices.id, id), eq(devices.userId, userId)));

    if (!device) {
      throw new NotFoundException('Dispositivo no encontrado');
    }

    return device;
  }

  async update(id: string, userId: string, updateDeviceDto: UpdateDeviceDto) {
    await this.findOneByUser(id, userId);

    const [updatedDevice] = await this.db
      .update(devices)
      .set({ ...updateDeviceDto, updatedAt: new Date() })
      .where(and(eq(devices.id, id), eq(devices.userId, userId)))
      .returning();

    return updatedDevice;
  }

  async remove(id: string, userId: string) {
    await this.findOneByUser(id, userId);

    await this.db
      .delete(devices)
      .where(and(eq(devices.id, id), eq(devices.userId, userId)));

    return { message: 'Dispositivo eliminado correctamente' };
  }
}
