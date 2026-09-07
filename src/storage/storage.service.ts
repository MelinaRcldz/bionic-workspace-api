import { Injectable, InternalServerErrorException, NotFoundException, } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

// Definición de interfaz para evitar conflictos con los tipos globales de Express/Multer
export type UploadedFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@Injectable()
export class StorageService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    // Aseguramos que la carpeta uploads exista al iniciar
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Guarda un archivo recibido por Multer en el almacenamiento local
   */
  async saveFile(file: UploadedFile, subfolder = ''): Promise<string> {
    try {
      const targetDir = path.join(this.uploadDir, subfolder);

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Generamos un nombre único usando timestamp y aleatoriedad
      const fileExtension = path.extname(file.originalname);
      const uniqueFileName = `${Date.now()}-${Math.round(
        Math.random() * 1e9,
      )}${fileExtension}`;

      const relativeStorageKey = path
        .join(subfolder, uniqueFileName)
        .replace(/\\/g, '/');

      const absolutePath = path.join(
        this.uploadDir,
        relativeStorageKey,
      );

      await fs.promises.writeFile(absolutePath, file.buffer);

      return relativeStorageKey;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al guardar el archivo en disco',
      );
    }
  }

  /**
   * Elimina un archivo físicamente de disco mediante su storageKey
   */
  async deleteFile(storageKey: string): Promise<void> {
    try {
      const absolutePath = path.join(this.uploadDir, storageKey);

      if (fs.existsSync(absolutePath)) {
        await fs.promises.unlink(absolutePath);
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al eliminar el archivo de disco',
      );
    }
  }

  /**
   * Obtiene la ruta absoluta de un archivo almacenado
   */
  getAbsolutePath(storageKey: string): string {
    const absolutePath = path.join(this.uploadDir, storageKey);

    if (!fs.existsSync(absolutePath)) {
      throw new NotFoundException('El archivo físico no existe');
    }

    return absolutePath;
  }
}