import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile as NestUploadedFile,
  Res,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DeviceFilesService } from './device-files.service';
import type { UploadedFile } from '../storage/storage.service';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request';

@ApiTags('DeviceFiles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('devices/:deviceId')
export class DeviceFilesController {
  constructor(private readonly deviceFilesService: DeviceFilesService) {}

  /**
   * POST /devices/:deviceId/representation
   * Sube una representación 3/4
   */
  @Post('representation')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Subir la imagen de representación visual 3/4 del dispositivo',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo de imagen (PNG, JPEG, WEBP, máx 5MB)',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Imagen de representación subida exitosamente',
    schema: {
      example: {
        id: 'd0bbe408-2727-4578-8d7a-66ed0301cf56',
        deviceId: '82bae305-6b85-4626-8140-503cd56dd1ff',
        storageKey: 'representations/1788929216496-285444779.jpg',
        originalName: 'foto-dispositivo.jpg',
        mimeType: 'image/jpeg',
        size: 114943,
        category: 'REPRESENTATION',
        createdAt: '2026-09-09T04:46:56.511Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Archivo inválido o excede el peso máximo permitido (5MB)',
  })
  @ApiNotFoundResponse({ description: 'Dispositivo no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async uploadRepresentation(
    @Param('deviceId', ParseUUIDPipe) deviceId: string,
    @NestUploadedFile() file: UploadedFile,
    @Req() req: AuthenticatedRequest,
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
  @ApiOperation({
    summary: 'Obtener las representaciones visuales asociadas al dispositivo',
  })
  @ApiOkResponse({ description: 'Lista de imágenes de representación' })
  @ApiNotFoundResponse({ description: 'Dispositivo no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async getRepresentations(
    @Param('deviceId', ParseUUIDPipe) deviceId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.deviceFilesService.getRepresentations(deviceId, req.user.id);
  }

  /**
   * POST /devices/:deviceId/documentation
   * Sube un archivo de documentación técnica (PDF, manuales, esquemas)
   */
  @Post('documentation')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Subir documentación técnica (manuales, PDFs, esquemas)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo de documentación (PDF, Word, imágenes, máx 10MB)',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Documento subido exitosamente',
    schema: {
      example: {
        id: 'b268ecf5-58e4-4969-b087-2df7ccb64b03',
        deviceId: '82bae305-6b85-4626-8140-503cd56dd1ff',
        storageKey: 'documentation/1788929099591-851954433.pdf',
        originalName: 'manual-tecnico.pdf',
        mimeType: 'application/pdf',
        size: 5906704,
        category: 'DOCUMENTATION',
        createdAt: '2026-09-09T04:44:59.648Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Archivo inválido o excede el peso máximo permitido (10MB)',
  })
  @ApiNotFoundResponse({ description: 'Dispositivo no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async uploadDocumentation(
    @Param('deviceId', ParseUUIDPipe) deviceId: string,
    @NestUploadedFile() file: UploadedFile,
    @Req() req: AuthenticatedRequest,
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
  @ApiOperation({
    summary: 'Obtener la lista de documentos técnicos del dispositivo',
  })
  @ApiOkResponse({ description: 'Lista de documentos del dispositivo' })
  @ApiNotFoundResponse({ description: 'Dispositivo no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async getDocumentation(
    @Param('deviceId', ParseUUIDPipe) deviceId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.deviceFilesService.getDocumentation(deviceId, req.user.id);
  }

  /**
   * GET /devices/:deviceId/files/:fileId/download
   * Descarga o sirve el archivo protegido
   */
  @Get('files/:fileId/download')
  @ApiOperation({ summary: 'Descargar o visualizar un archivo específico' })
  @ApiProduces('application/octet-stream', 'image/png', 'image/jpeg', 'application/pdf')
  @ApiOkResponse({ description: 'Binary stream del archivo solicitado' })
  @ApiNotFoundResponse({
    description: 'Archivo o dispositivo no encontrado',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async downloadFile(
    @Param('deviceId', ParseUUIDPipe) deviceId: string,
    @Param('fileId', ParseUUIDPipe) fileId: string,
    @Req() req: AuthenticatedRequest,
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
  @ApiOperation({
    summary: 'Eliminar un archivo (disco local y base de datos)',
  })
  @ApiOkResponse({
    schema: {
      example: { message: 'Archivo eliminado correctamente' },
    },
  })
  @ApiNotFoundResponse({
    description: 'Archivo o dispositivo no encontrado',
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async deleteFile(
    @Param('deviceId', ParseUUIDPipe) deviceId: string,
    @Param('fileId', ParseUUIDPipe) fileId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.deviceFilesService.deleteFile(fileId, deviceId, req.user.id);
  }

  @Get('files')
  @ApiOperation({
    summary:
      'Obtener la totalidad de archivos del dispositivo agrupados por categoría',
  })
  @ApiOkResponse({
    description: 'Archivos organizados por representación y documentación',
    schema: {
      example: {
        representations: [
          {
            id: 'd0bbe408-2727-4578-8d7a-66ed0301cf56',
            deviceId: '82bae305-6b85-4626-8140-503cd56dd1ff',
            storageKey: 'representations/1788929216496-285444779.jpg',
            originalName: 'foto-dispositivo.jpg',
            mimeType: 'image/jpeg',
            size: 114943,
            category: 'REPRESENTATION',
            createdAt: '2026-09-09T04:46:56.511Z',
          },
        ],
        documentation: [
          {
            id: 'b268ecf5-58e4-4969-b087-2df7ccb64b03',
            deviceId: '82bae305-6b85-4626-8140-503cd56dd1ff',
            storageKey: 'documentation/1788929099591-851954433.pdf',
            originalName: 'manual-tecnico.pdf',
            mimeType: 'application/pdf',
            size: 5906704,
            category: 'DOCUMENTATION',
            createdAt: '2026-09-09T04:44:59.648Z',
          },
        ],
        total: 2,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Dispositivo no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async getAllDeviceFiles(
    @Param('deviceId', ParseUUIDPipe) deviceId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.deviceFilesService.getAllDeviceFiles(deviceId, req.user.id);
  }
}
