import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DeviceFilesService } from './device-files.service';
import { DRIZZLE } from '../database/database.module';
import { StorageService } from '../storage/storage.service';
import type { UploadedFile } from '../storage/storage.service';

const createMockFile = (
  overrides: Partial<UploadedFile> = {},
): UploadedFile => ({
  fieldname: 'file',
  originalname: 'test.png',
  encoding: '7bit',
  mimetype: 'image/png',
  size: 1024,
  buffer: Buffer.from('test'),
  ...overrides,
});

describe('DeviceFilesService', () => {
  let service: DeviceFilesService;

  const mockDb = {
    select: jest.fn(),
    insert: jest.fn(),
    delete: jest.fn(),
  };

  const mockStorageService = {
    saveFile: jest.fn(),
    deleteFile: jest.fn(),
    getAbsolutePath: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceFilesService,
        { provide: DRIZZLE, useValue: mockDb },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<DeviceFilesService>(DeviceFilesService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('uploadRepresentation', () => {
    it('debe lanzar BadRequestException si no se adjunta archivo', async () => {
      await expect(
        service.uploadRepresentation('dev-1', 'user-1', undefined),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si el tipo MIME no es de imagen', async () => {
      const mockFile = createMockFile({
        mimetype: 'application/pdf',
        size: 1024,
      });

      await expect(
        service.uploadRepresentation('dev-1', 'user-1', mockFile),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si el peso excede los 5MB', async () => {
      const mockFile = createMockFile({
        size: 6 * 1024 * 1024,
      });

      await expect(
        service.uploadRepresentation('dev-1', 'user-1', mockFile),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar NotFoundException si el dispositivo no pertenece al usuario', async () => {
      const mockFile = createMockFile();

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockResolvedValueOnce([]),
        }),
      });

      await expect(
        service.uploadRepresentation('dev-1', 'user-1', mockFile),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
