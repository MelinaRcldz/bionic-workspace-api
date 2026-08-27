import { pgTable, uuid, numeric, timestamp } from 'drizzle-orm/pg-core';
import { devices } from './devices';
import { components } from './components';

export const telemetryLogs = pgTable('telemetry_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  value: numeric('value', { precision: 10, scale: 2 }).notNull(),
  deviceId: uuid('device_id')
    .notNull()
    .references(() => devices.id, { onDelete: 'cascade' }),
  componentId: uuid('component_id')
    .notNull()
    .references(() => components.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});