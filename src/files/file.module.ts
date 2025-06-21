import { Module } from '@nestjs/common';
import { FilesController } from 'src/files/files.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FileEntity, FileSchema } from 'src/files/entities/file.entity';
import { FilesService } from 'src/files/files.service';
import { FilesGateway } from 'src/files/gateway/files.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: FileEntity.name,
        schema: FileSchema,
      },
    ]),
  ],
  providers: [FilesService, FilesGateway],
  controllers: [FilesController],
})
export class FileModule {}
