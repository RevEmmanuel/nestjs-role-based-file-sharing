import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Get,
  Query,
  ParseFilePipeBuilder,
  Patch,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user.data.interface';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { ListFilesQueryDto } from 'src/files/dto/list-files-query.dto';
import { Permissions } from 'src/iam/decorators/permissions.decorator';
import { Permission } from 'src/users/enums/permission.enum';
import { Auth } from 'src/iam/decorators/auth.decorator';
import { AuthType } from 'src/iam/enums/auth-type.enum';
import { UpdateFileDto } from 'src/files/dto/update-file.dto';

@Auth(AuthType.Bearer)
@ApiBearerAuth('JWT-auth')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @Permissions(Permission.FileUpload)
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 }) // 5 MB
        .build(),
    )
    file: Express.Multer.File,
    @Body() dto: CreateFileDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.filesService.uploadFile(file, dto, user.sub);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'tags', required: false, isArray: true })
  @ApiQuery({ name: 'mimetype', required: false })
  @Permissions(Permission.FileRead)
  @ApiOperation({ summary: 'Get a list of files' })
  async listFiles(
    @Query() query: ListFilesQueryDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.filesService.listFiles(query, user);
  }

  @Patch(':id')
  @Permissions(Permission.FileUpdateMetadata)
  @ApiOperation({ summary: 'Update file metadata' })
  @ApiQuery({ name: 'id', required: true })
  async updateFileMetadata(
    @Param('id') fileId: string,
    @Body() dto: UpdateFileDto,
  ) {
    console.log(dto);
    return this.filesService.updateFileMetadata(fileId, dto);
  }
}
