import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { devices } from './devices';

// Categorías acotadas para el MVP de la Fase 1E
export const fileCategoryEnum = pgEnum('file_category', [
  'REPRESENTATION',
  'DOCUMENTATION',
]);

export const deviceFiles = pgTable('device_files', {
  id: uuid('id').defaultRandom().primaryKey(),
  deviceId: uuid('device_id')
    .notNull()
    .references(() => devices.id, { onDelete: 'cascade' }),
  storageKey: varchar('storage_key', { length: 500 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  size: integer('size').notNull(),
  category: fileCategoryEnum('category').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});