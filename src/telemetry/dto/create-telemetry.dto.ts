import { IsNotEmpty, IsNumberString, IsUUID } from 'class-validator';

export class CreateTelemetryDto {
  @IsUUID()
  @IsNotEmpty()
  componentId!: string;

  @IsNumberString()
  @IsNotEmpty()
  value!: string;
}
