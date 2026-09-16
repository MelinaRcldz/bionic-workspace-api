import { Module } from '@nestjs/common';
import { DeviceFilesService } from './device-files.service';
import { DeviceFilesController } from './device-files.controller';
import { StorageModule } from '../storage/storage.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule, StorageModule],
  controllers: [DeviceFilesController],
  providers: [DeviceFilesService],
  exports: [DeviceFilesService],
})
export class DeviceFilesModule {}
