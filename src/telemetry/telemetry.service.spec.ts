import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { DRIZZLE } from '../database/database.module';
import { CreateTelemetryDto } from './dto/create-telemetry.dto';
import { components } from '../database/schema';

const createMockTelemetryDto = (
  overrides: Partial<CreateTelemetryDto> = {},
): CreateTelemetryDto => ({
  componentId: 'component-1',
  value: '50',
  ...overrides,
});

const createMockComponent = (
  overrides: Partial<typeof components.$inferSelect> = {},
): typeof components.$inferSelect => ({
  id: 'component-1',
  deviceId: 'device-1',
  name: 'Componente de prueba',
  type: 'SENSOR',
  minThreshold: '10',
  maxThreshold: '100',
  minSeverity: 'WARNING',
  maxSeverity: 'CRITICAL',
  status: 'OPERATIONAL',
  statusReason: null,
  unit: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('TelemetryService', () => {
  let service: TelemetryService;

  const mockDb = {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  };

  const mockDevice = {
    id: 'device-1',
    userId: 'user-1',
  };

  const mockLog = {
    id: 'log-1',
    value: '50',
    deviceId: 'device-1',
    componentId: 'component-1',
  };

  const mockAlert = {
    id: 'alert-1',
    message: 'Alerta generada',
    severity: 'WARNING',
    valueRecorded: '5',
    deviceId: 'device-1',
    componentId: 'component-1',
    isResolved: false,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [TelemetryService, { provide: DRIZZLE, useValue: mockDb }],
    }).compile();

    service = module.get<TelemetryService>(TelemetryService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('processTelemetry', () => {
    it('debe lanzar NotFoundException si el dispositivo no pertenece al usuario', async () => {
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockResolvedValueOnce([]),
        }),
      });

      const dto = createMockTelemetryDto();

      await expect(
        service.processTelemetry('device-1', 'user-1', dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar NotFoundException si el componente no pertenece al dispositivo', async () => {
      mockDb.select
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValueOnce({
            where: jest.fn().mockResolvedValueOnce([mockDevice]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValueOnce({
            where: jest.fn().mockResolvedValueOnce([]),
          }),
        });

      const dto = createMockTelemetryDto();

      await expect(
        service.processTelemetry('device-1', 'user-1', dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe procesar correctamente una telemetría dentro de rango', async () => {
      const component = createMockComponent();

      mockDb.select
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValueOnce({
            where: jest.fn().mockResolvedValueOnce([mockDevice]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValueOnce({
            where: jest.fn().mockResolvedValueOnce([component]),
          }),
        });

      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([mockLog]),
        }),
      });

      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockResolvedValueOnce([]),
        }),
      });

      const dto = createMockTelemetryDto();

      const result = await service.processTelemetry('device-1', 'user-1', dto);

      expect(result.componentStatus).toBe('OPERATIONAL');
      expect(result.statusReason).toBeNull();
      expect(result.evaluation.isOutOfBounds).toBe(false);
      expect(result.evaluation.breachType).toBeNull();
      expect(result.alert).toBeNull();
    });

    it('debe generar una alerta cuando el valor está por debajo del mínimo', async () => {
      const component = createMockComponent({
        minSeverity: 'WARNING',
      });

      mockDb.select
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValueOnce({
            where: jest.fn().mockResolvedValueOnce([mockDevice]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValueOnce({
            where: jest.fn().mockResolvedValueOnce([component]),
          }),
        });

      mockDb.insert
        .mockReturnValueOnce({
          values: jest.fn().mockReturnValueOnce({
            returning: jest.fn().mockResolvedValueOnce([mockLog]),
          }),
        })
        .mockReturnValueOnce({
          values: jest.fn().mockReturnValueOnce({
            returning: jest.fn().mockResolvedValueOnce([mockAlert]),
          }),
        });

      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockResolvedValueOnce([]),
        }),
      });

      const dto = createMockTelemetryDto({
        value: '5',
      });

      const result = await service.processTelemetry('device-1', 'user-1', dto);

      expect(result.evaluation.isOutOfBounds).toBe(true);
      expect(result.evaluation.breachType).toBe('UNDER_MIN');
      expect(result.componentStatus).toBe('WARNING');
      expect(result.alert).toEqual(mockAlert);
      expect(mockDb.insert).toHaveBeenCalledTimes(2);
    });

    it('debe generar una alerta cuando el valor supera el máximo', async () => {
      const component = createMockComponent({
        maxSeverity: 'CRITICAL',
      });

      mockDb.select
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValueOnce({
            where: jest.fn().mockResolvedValueOnce([mockDevice]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValueOnce({
            where: jest.fn().mockResolvedValueOnce([component]),
          }),
        });

      mockDb.insert
        .mockReturnValueOnce({
          values: jest.fn().mockReturnValueOnce({
            returning: jest.fn().mockResolvedValueOnce([mockLog]),
          }),
        })
        .mockReturnValueOnce({
          values: jest.fn().mockReturnValueOnce({
            returning: jest.fn().mockResolvedValueOnce([mockAlert]),
          }),
        });

      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockResolvedValueOnce([]),
        }),
      });

      const dto = createMockTelemetryDto({
        value: '150',
      });

      const result = await service.processTelemetry('device-1', 'user-1', dto);

      expect(result.evaluation.isOutOfBounds).toBe(true);
      expect(result.evaluation.breachType).toBe('OVER_MAX');
      expect(result.componentStatus).toBe('CRITICAL');
      expect(result.alert).toEqual(mockAlert);
      expect(mockDb.insert).toHaveBeenCalledTimes(2);
    });

    it('debe pasar de CRITICAL a WARNING con motivo RECOVERY cuando vuelve a rango', async () => {
      const component = createMockComponent({
        status: 'CRITICAL',
        statusReason: null,
      });

      mockDb.select
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValueOnce({
            where: jest.fn().mockResolvedValueOnce([mockDevice]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValueOnce({
            where: jest.fn().mockResolvedValueOnce([component]),
          }),
        });

      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([mockLog]),
        }),
      });

      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockResolvedValueOnce([]),
        }),
      });

      const dto = createMockTelemetryDto();

      const result = await service.processTelemetry('device-1', 'user-1', dto);

      expect(result.componentStatus).toBe('WARNING');
      expect(result.statusReason).toBe('RECOVERY');
      expect(result.alert).toBeNull();
    });

    it('debe pasar de WARNING/RECOVERY a OPERATIONAL en la siguiente lectura normal', async () => {
      const component = createMockComponent({
        status: 'WARNING',
        statusReason: 'RECOVERY',
      });

      mockDb.select
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValueOnce({
            where: jest.fn().mockResolvedValueOnce([mockDevice]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValueOnce({
            where: jest.fn().mockResolvedValueOnce([component]),
          }),
        });

      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([mockLog]),
        }),
      });

      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockResolvedValueOnce([]),
        }),
      });

      const dto = createMockTelemetryDto();

      const result = await service.processTelemetry('device-1', 'user-1', dto);

      expect(result.componentStatus).toBe('OPERATIONAL');
      expect(result.statusReason).toBeNull();
      expect(result.alert).toBeNull();
    });

    it('debe pasar de WARNING/PERSISTENT_AFTER_RESOLUTION a OPERATIONAL con una lectura normal', async () => {
      const component = createMockComponent({
        status: 'WARNING',
        statusReason: 'PERSISTENT_AFTER_RESOLUTION',
      });

      mockDb.select
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValueOnce({
            where: jest.fn().mockResolvedValueOnce([mockDevice]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValueOnce({
            where: jest.fn().mockResolvedValueOnce([component]),
          }),
        });

      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([mockLog]),
        }),
      });

      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockResolvedValueOnce([]),
        }),
      });

      const dto = createMockTelemetryDto();

      const result = await service.processTelemetry('device-1', 'user-1', dto);

      expect(result.componentStatus).toBe('OPERATIONAL');
      expect(result.statusReason).toBeNull();
      expect(result.alert).toBeNull();
    });
  });
});
