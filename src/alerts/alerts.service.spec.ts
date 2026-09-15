import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { DRIZZLE } from '../database/database.module';

describe('AlertsService', () => {
  let service: AlertsService;

  const mockDb = {
    select: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        {
          provide: DRIZZLE,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAlertsByDevice', () => {
    it('should throw NotFoundException if the device does not belong to the user', async () => {
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      await expect(
        service.findAlertsByDevice('device-id', 'user-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return alerts belonging to the device', async () => {
      const alerts = [
        { id: 'alert-1', deviceId: 'device-id' },
        { id: 'alert-2', deviceId: 'device-id' },
      ];

      mockDb.select
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([{ id: 'device-id' }]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(alerts),
            }),
          }),
        });

      await expect(
        service.findAlertsByDevice('device-id', 'user-id'),
      ).resolves.toEqual(alerts);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if the alert does not belong to the user', async () => {
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(service.findOne('alert-id', 'user-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return the requested alert', async () => {
      const alert = {
        id: 'alert-id',
        deviceId: 'device-id',
        componentId: 'component-id',
        severity: 'CRITICAL',
        isResolved: false,
      };

      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([{ alert }]),
          }),
        }),
      });

      await expect(service.findOne('alert-id', 'user-id')).resolves.toEqual(
        alert,
      );
    });
  });

  describe('resolveAlert', () => {
    it('should throw NotFoundException if the alert does not belong to the user', async () => {
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(service.resolveAlert('alert-id', 'user-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should resolve the alert and set the component to OPERATIONAL when there is no active out-of-bounds telemetry', async () => {
      const alert = {
        id: 'alert-id',
        componentId: 'component-id',
        isResolved: false,
      };

      const updatedAlert = {
        ...alert,
        isResolved: true,
        resolvedAt: new Date(),
      };

      const component = {
        id: 'component-id',
        minThreshold: '10',
        maxThreshold: '100',
        status: 'CRITICAL',
        statusReason: null,
      };

      mockDb.select
        // Verify alert ownership
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([{ alert }]),
            }),
          }),
        })
        // Find component
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([component]),
          }),
        })
        // Find latest telemetry
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([{ value: '50' }]),
              }),
            }),
          }),
        });

      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedAlert]),
          }),
        }),
      });

      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      await expect(
        service.resolveAlert('alert-id', 'user-id'),
      ).resolves.toEqual({
        message: 'Alerta marcada como resuelta exitosamente',
        alert: updatedAlert,
      });
    });

    it('should keep the component in WARNING when the latest telemetry is still out of bounds', async () => {
      const alert = {
        id: 'alert-id',
        componentId: 'component-id',
        isResolved: false,
      };

      const updatedAlert = {
        ...alert,
        isResolved: true,
        resolvedAt: new Date(),
      };

      const component = {
        id: 'component-id',
        minThreshold: '10',
        maxThreshold: '100',
        status: 'CRITICAL',
        statusReason: null,
      };

      mockDb.select
        // Verify alert ownership
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            innerJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([{ alert }]),
            }),
          }),
        })
        // Find component
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([component]),
          }),
        })
        // Latest telemetry is still above max
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([{ value: '150' }]),
              }),
            }),
          }),
        });

      const persistentAlertUpdate = {
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      };

      mockDb.update
        .mockReturnValueOnce({
          set: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              returning: jest.fn().mockResolvedValue([updatedAlert]),
            }),
          }),
        })
        .mockReturnValueOnce(persistentAlertUpdate);

      await service.resolveAlert('alert-id', 'user-id');

      expect(mockDb.update).toHaveBeenCalledTimes(2);

      expect(persistentAlertUpdate.set).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'WARNING',
          statusReason: 'PERSISTENT_AFTER_RESOLUTION',
        }),
      );
    });
  });
});
