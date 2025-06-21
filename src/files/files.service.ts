import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { FileEntity } from './entities/file.entity';
import { CreateFileDto } from './dto/create-file.dto';
import * as fs from 'fs';
import * as path from 'path';
import { encryptBuffer } from './utils/encryption';
import { ActiveUserData } from 'src/iam/interfaces/active-user.data.interface';
import { ListFilesQueryDto } from 'src/files/dto/list-files-query.dto';
import { RolePermissionsMap } from 'src/users/constants/role-permissions.map';
import { UpdateFileDto } from 'src/files/dto/update-file.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    @InjectModel(FileEntity.name) private readonly fileModel: Model<FileEntity>,
    private eventEmitter: EventEmitter2,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    createFileDto: CreateFileDto,
    ownerId: number,
  ): Promise<FileEntity> {
    if (!Buffer.isBuffer(file.buffer)) {
      this.logger.error('File buffer is not a valid Buffer');
      throw new BadRequestException('Expected file.buffer to be a Buffer');
    }
    const { encrypted, iv } = encryptBuffer(file.buffer);
    const storedName = `${Date.now()}-${file.originalname}`;
    const uploadDir = path.join(process.cwd(), 'uploads');

    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      this.logger.log(`Created upload directory at ${uploadDir}`);
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, storedName);
    fs.writeFileSync(filePath, encrypted);
    this.logger.log(`File saved to disk: ${filePath}`);

    const created = new this.fileModel({
      originalName: file.originalname,
      storedName,
      mimeType: file.mimetype,
      size: file.size,
      ownerId,
      iv,
      tags: createFileDto.tags || [],
      description: createFileDto.description,
    });
    this.logger.log(
      `File uploaded: "${file.originalname}" (${file.mimetype}, ${file.size} bytes) by user ${ownerId}`,
    );
    const createdFile = await created.save();
    this.eventEmitter.emit('audit.log', {
      action: 'upload',
      resourceId: createdFile.id as string,
      resourceType: 'File',
      performedBy: ownerId.toString(),
      metadata: {
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      },
    });
    return createdFile;
  }

  async listFiles(query: ListFilesQueryDto, user: ActiveUserData) {
    this.logger.log(`Listing files from disk: ${query}`);
    const { page = 1, limit = 10, search, tags, mimetype } = query;

    const filter: FilterQuery<FileEntity> = {
      $or: [
        { ownerId: user.sub },
        { permissions: { $in: RolePermissionsMap[user.role] ?? [] } },
      ],
    };

    if (search) {
      filter.originalName = { $regex: search, $options: 'i' };
    }

    if (tags?.length) {
      filter.tags = { $in: tags };
    }

    if (mimetype) {
      filter.mimetype = mimetype;
    }

    const total = await this.fileModel.countDocuments(filter);

    const files = await this.fileModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    this.logger.log(
      `User ${user.email} listed ${files.length} files (page ${page})`,
    );
    this.eventEmitter.emit('audit.log', {
      action: 'fetch',
      resourceType: 'File',
      performedBy: user.sub,
      metadata: {
        fileIds: files.map((f) => f._id),
        filter: filter,
      },
    });

    return {
      page,
      limit,
      total,
      data: files,
    };
  }

  async updateFileMetadata(
    fileId: string,
    dto: UpdateFileDto,
    actorId: number,
  ): Promise<FileEntity> {
    const file = await this.fileModel.findById(fileId);

    if (!file) {
      this.logger.warn(`File with ID ${fileId} not found for update`);
      throw new NotFoundException('File not found');
    }
    if (dto.description) file.description = dto.description;
    if (dto.tags) file.tags = dto.tags;

    await file.save();
    this.logger.log(`File metadata updated (ID: ${fileId})`);
    this.eventEmitter.emit('audit.log', {
      action: 'update',
      resourceId: file.id as string,
      resourceType: 'File',
      performedBy: actorId,
      metadata: {
        originalName: file.originalName,
        size: file.size,
        mimeType: file.mimeType,
      },
    });
    return file;
  }
}
