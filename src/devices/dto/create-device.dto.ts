import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateDeviceDto {
  @ApiProperty({
    description: 'Nombre descriptivo del dispositivo biónico',
    example: 'Brazo Biónico REX-01',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({
    description: 'Modelo técnico del dispositivo',
    example: 'REX-V2',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  model!: string;

  @ApiProperty({
    description: 'Número de serie único del dispositivo',
    example: 'SN-2026-REX-001',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  serialNumber!: string;
}
