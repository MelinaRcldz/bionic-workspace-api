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
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  type!: string; // ej: "ACTUATOR", "SENSOR"

  @IsOptional()
  @IsNumberString()
  minThreshold?: string;

  @IsOptional()
  @IsNumberString()
  maxThreshold?: string;

  @IsOptional()
  @IsEnum(AlertSeverityEnum)
  minSeverity?: AlertSeverityEnum;

  @IsOptional()
  @IsEnum(AlertSeverityEnum)
  maxSeverity?: AlertSeverityEnum;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  unit?: string; // ej: "°C", "RPM", "A"
}