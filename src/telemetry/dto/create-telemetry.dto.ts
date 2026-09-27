import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsUUID } from 'class-validator';

export class CreateTelemetryDto {
  @ApiProperty({
    description: 'ID único del componente que emite la telemetría',
    example: 'a7d45b89-448c-441b-a781-6ba0fe26f978',
  })
  @IsUUID('4', { message: 'El componentId debe ser un UUID válido' })
  @IsNotEmpty()
  componentId!: string;

  @ApiProperty({
    description: 'Valor de la telemetría',
    example: '25.5',
  })
  @IsNumberString()
  @IsNotEmpty()
  value!: string;
}
