import { pgTable, uuid, varchar, numeric, timestamp } from 'drizzle-orm/pg-core';
import { devices } from './devices';

export const components = pgTable('components', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(), // ej: "Servomotor Muñeca", "Sensor Térmico Palma"
  type: varchar('type', { length: 100 }).notNull(), // ej: "ACTUATOR", "SENSOR"
  minThreshold: numeric('min_threshold', { precision: 10, scale: 2 }), // ej: 0.00
  maxThreshold: numeric('max_threshold', { precision: 10, scale: 2 }), // ej: 85.50 (Temp max en °C)
  minSeverity: varchar('min_severity', { length: 50 }).default('WARNING').notNull(),
  maxSeverity: varchar('max_severity', { length: 50 }).default('CRITICAL').notNull(),
  unit: varchar('unit', { length: 50 }), // ej: "°C", "RPM", "A"
  deviceId: uuid('device_id')
    .notNull()
    .references(() => devices.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});