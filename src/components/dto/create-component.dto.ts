import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

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
  @IsString()
  @MaxLength(50)
  unit?: string; // ej: "°C", "RPM", "A"
}