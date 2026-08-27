import { pgTable, uuid, varchar, numeric, timestamp, boolean } from 'drizzle-orm/pg-core';
import { devices } from './devices';
import { components } from './components';

export const alerts = pgTable('alerts', {
  id: uuid('id').defaultRandom().primaryKey(),
  message: varchar('message', { length: 255 }).notNull(),
  severity: varchar('severity', { length: 50 }).notNull(), // 'WARNING' | 'CRITICAL'
  valueRecorded: numeric('value_recorded', { precision: 10, scale: 2 }).notNull(),
  isResolved: boolean('is_resolved').default(false).notNull(),
  deviceId: uuid('device_id')
    .notNull()
    .references(() => devices.id, { onDelete: 'cascade' }),
  componentId: uuid('component_id')
    .notNull()
    .references(() => components.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at'),
});