import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export enum AlertSeverityEnum {
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

export class CreateComponentDto {
  @ApiProperty({
    description: 'Nombre descriptivo del componente',
    example: 'Servo Motor SG90',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({
    description: 'Tipo o categoría de componente (ej. ACTUATOR, SENSOR)',
    example: 'ACTUATOR',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  type!: string;

  @ApiPropertyOptional({
    description: 'Umbral mínimo operativo permitido',
    example: '0.00',
  })
  @IsOptional()
  @IsNumberString()
  minThreshold?: string;

  @ApiPropertyOptional({
    description: 'Umbral máximo operativo permitido',
    example: '85.50',
  })
  @IsOptional()
  @IsNumberString()
  maxThreshold?: string;

  @ApiPropertyOptional({
    description: 'Severidad asignada al superar el umbral mínimo',
    enum: AlertSeverityEnum,
    example: AlertSeverityEnum.WARNING,
  })
  @IsOptional()
  @IsEnum(AlertSeverityEnum)
  minSeverity?: AlertSeverityEnum;

  @ApiPropertyOptional({
    description: 'Severidad asignada al superar el umbral máximo',
    enum: AlertSeverityEnum,
    example: AlertSeverityEnum.CRITICAL,
  })
  @IsOptional()
  @IsEnum(AlertSeverityEnum)
  maxSeverity?: AlertSeverityEnum;

  @ApiPropertyOptional({
    description: 'Unidad de medida del componente',
    example: '°C',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  unit?: string;
}
