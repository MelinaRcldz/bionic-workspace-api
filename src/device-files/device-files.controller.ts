import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile as NestUploadedFile,
  Res,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DeviceFilesService } from './device-files.service';
import type { UploadedFile } from '../storage/storage.service';

@UseGuards(JwtAuthGuard)
@Controller('devices/:deviceId')
export class DeviceFilesController {
  constructor(private readonly deviceFilesService: DeviceFilesService) { }

  /**
   * POST /devices/:deviceId/representation
   * Sube una representación 3/4
   */
  @Post('representation')
  @UseInterceptors(FileInterceptor('file'))
  async uploadRepresentation(
    @Param('deviceId', ParseUUIDPipe) deviceId: string,
    @NestUploadedFile() file: UploadedFile,
    @Req() req: any,
  ) {
    return this.deviceFilesService.uploadRepresentation(
      deviceId,
      req.user.id,
      file,
    );
  }

  /**
   * GET /devices/:deviceId/representation
   * Obtiene las representaciones cargadas para el dispositivo
   */
  @Get('representation')
  async getRepresentations(
    @Param('deviceId', ParseUUIDPipe) deviceId: string,
    @Req() req: any,
  ) {
    return this.deviceFilesService.getRepresentations(deviceId, req.user.id);
  }

  /**
   * POST /devices/:deviceId/documentation
   * Sube un archivo de documentación técnica (PDF, manuales, esquemas)
   */
  @Post('documentation')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocumentation(
    @Param('deviceId', ParseUUIDPipe) deviceId: string,
    @NestUploadedFile() file: UploadedFile,
    @Req() req: any,
  ) {
    return this.deviceFilesService.uploadDocumentation(
      deviceId,
      req.user.id,
      file,
    );
  }

  /**
   * GET /devices/:deviceId/documentation
   * Obtiene la lista de documentos técnicos del dispositivo
   */
  @Get('documentation')
  async getDocumentation(
    @Param('deviceId', ParseUUIDPipe) deviceId: string,
    @Req() req: any,
  ) {
    return this.deviceFilesService.getDocumentation(deviceId, req.user.id);
  }

  /**
   * GET /devices/:deviceId/files/:fileId/download
   * Descarga o sirve el archivo protegido
   */
  @Get('files/:fileId/download')
  async downloadFile(
    @Param('deviceId', ParseUUIDPipe) deviceId: string,
    @Param('fileId', ParseUUIDPipe) fileId: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const { absolutePath, file } =
      await this.deviceFilesService.getFileAbsolutePath(
        fileId,
        deviceId,
        req.user.id,
      );

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${file.originalName}"`,
    );

    return res.sendFile(absolutePath);
  }

  /**
   * DELETE /devices/:deviceId/files/:fileId
   * Elimina un archivo (representación o documentación) perteneciente al dispositivo
   */
  @Delete('files/:fileId')
  async deleteFile(
    @Param('deviceId', ParseUUIDPipe) deviceId: string,
    @Param('fileId', ParseUUIDPipe) fileId: string,
    @Req() req: any,
  ) {
    return this.deviceFilesService.deleteFile(
      fileId,
      deviceId,
      req.user.id,
    );
  }

  @Get('files')
  async getAllDeviceFiles(
    @Param('deviceId', ParseUUIDPipe) deviceId: string,
    @Req() req: any,
  ) {
    return this.deviceFilesService.getAllDeviceFiles(
      deviceId,
      req.user.id,
    );
  }
}