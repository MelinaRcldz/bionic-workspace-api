import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  model!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  serialNumber!: string;
}
