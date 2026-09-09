import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DRIZZLE } from '../database/database.module';
import { devices, deviceFiles } from '../database/schema';
import { StorageService } from '../storage/storage.service';
import type { UploadedFile } from '../storage/storage.service';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class DeviceFilesService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: PostgresJsDatabase,
    private readonly storageService: StorageService,
  ) {}
  
  /**
   * Helper privado para verificar ownership (device.id + device.userId)
   */
  private async verifyDeviceOwnership(deviceId: string, userId: string) {
    const [device] = await this.db
      .select()
      .from(devices)
      .where(and(eq(devices.id, deviceId), eq(devices.userId, userId)));

    if (!device) {
      throw new NotFoundException(
        'Dispositivo no encontrado o no pertenece al usuario',
      );
    }
    return device;
  }
  /**
   * Helper privado para validar tamaño y tipo MIME de los archivos adjuntos
   */
  private validateFile(file: UploadedFile, allowedMimeTypes: string[], maxSizeMB = 10) {
    if (!file) {
      throw new BadRequestException('Se requiere adjuntar un archivo');
    }

    // 1. Validar tamaño máximo
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new BadRequestException(
        `El archivo excede el tamaño máximo permitido de ${maxSizeMB}MB`,
      );
    }

    // 2. Validar tipo MIME
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido (${file.mimetype}). Tipos válidos: ${allowedMimeTypes.join(', ')}`,
      );
    }
  }

  /**
   * Registra una nueva representación visual 3/4 para el dispositivo
   */
  async uploadRepresentation(
    deviceId: string,
    userId: string,
    file: UploadedFile,
  ) {
    // 1. Validar tipo MIME y tamaño (máx 5MB)
    this.validateFile(file, ['image/png', 'image/jpeg', 'image/webp'], 5);

    // 2. Validar que el dispositivo pertenezca al usuario autenticado
    await this.verifyDeviceOwnership(deviceId, userId);

    // 3. Guardar el archivo físicamente en disco dentro de la carpeta 'representations'
    const storageKey = await this.storageService.saveFile(
      file,
      'representations',
    );

    // 4. Insertar la metadata en la base de datos
    const [newFile] = await this.db
      .insert(deviceFiles)
      .values({
        deviceId,
        storageKey,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        category: 'REPRESENTATION',
      })
      .returning();

    return newFile;
  }

  /**
   * Obtiene el listado de representaciones visuales asociadas al dispositivo
   */
  async getRepresentations(deviceId: string, userId: string) {
    await this.verifyDeviceOwnership(deviceId, userId);

    return this.db
      .select()
      .from(deviceFiles)
      .where(
        and(
          eq(deviceFiles.deviceId, deviceId),
          eq(deviceFiles.category, 'REPRESENTATION'),
        ),
      );
  }

  /**
   * Obtiene la ruta física absoluta de un archivo para descarga/visualización
   */
  async getFileAbsolutePath(fileId: string, deviceId: string, userId: string) {
    await this.verifyDeviceOwnership(deviceId, userId);

    const [file] = await this.db
      .select()
      .from(deviceFiles)
      .where(
        and(
          eq(deviceFiles.id, fileId),
          eq(deviceFiles.deviceId, deviceId),
        ),
      );

    if (!file) {
      throw new NotFoundException('Archivo no encontrado para este dispositivo');
    }

    return {
      absolutePath: this.storageService.getAbsolutePath(file.storageKey),
      file,
    };
  }

  /**
   * Registra un nuevo archivo de documentación técnica para el dispositivo
   */
  async uploadDocumentation(
    deviceId: string,
    userId: string,
    file: UploadedFile,
  ) {
    // 1. Validar tipo MIME y tamaño (máx 10MB)
    this.validateFile(
      file,
      [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg',
        'image/webp',
      ],
      10,
    );

    // 2. Validar ownership
    await this.verifyDeviceOwnership(deviceId, userId);

    // 3. Guardar el archivo físicamente dentro de la subcarpeta 'documentation'
    const storageKey = await this.storageService.saveFile(
      file,
      'documentation',
    );

    // 4. Persistir metadata con category = 'DOCUMENTATION'
    const [newFile] = await this.db
      .insert(deviceFiles)
      .values({
        deviceId,
        storageKey,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        category: 'DOCUMENTATION',
      })
      .returning();

    return newFile;
  }

  /**
   * Obtiene la lista de documentos técnicos asociados al dispositivo
   */
  async getDocumentation(deviceId: string, userId: string) {
    await this.verifyDeviceOwnership(deviceId, userId);

    return this.db
      .select()
      .from(deviceFiles)
      .where(
        and(
          eq(deviceFiles.deviceId, deviceId),
          eq(deviceFiles.category, 'DOCUMENTATION'),
        ),
      );
  }

  /**
   * Elimina un archivo asociado a un dispositivo (físicamente de disco y de la base de datos)
   */
  async deleteFile(fileId: string, deviceId: string, userId: string) {
    // 1. Validar ownership del dispositivo
    await this.verifyDeviceOwnership(deviceId, userId);

    // 2. Buscar el archivo específico del dispositivo
    const [file] = await this.db
      .select()
      .from(deviceFiles)
      .where(
        and(
          eq(deviceFiles.id, fileId),
          eq(deviceFiles.deviceId, deviceId),
        ),
      );

    if (!file) {
      throw new NotFoundException('Archivo no encontrado para este dispositivo');
    }

    // 3. Eliminar el archivo físicamente de disco mediante el StorageService
    await this.storageService.deleteFile(file.storageKey);

    // 4. Eliminar el registro en la base de datos
    await this.db.delete(deviceFiles).where(eq(deviceFiles.id, fileId));

    return { message: 'Archivo eliminado correctamente' };
  }

  /**
   * Obtiene la totalidad de archivos (representaciones y documentación) asociados a un dispositivo
   */
  async getAllDeviceFiles(deviceId: string, userId: string) {
    // 1. Validar ownership del dispositivo
    await this.verifyDeviceOwnership(deviceId, userId);

    // 2. Traer todos los archivos pertenecientes al dispositivo
    const files = await this.db
      .select()
      .from(deviceFiles)
      .where(eq(deviceFiles.deviceId, deviceId));

    // 3. Devolver organizados por categoría
    return {
      representations: files.filter((f) => f.category === 'REPRESENTATION'),
      documentation: files.filter((f) => f.category === 'DOCUMENTATION'),
      total: files.length,
    };
  }
}