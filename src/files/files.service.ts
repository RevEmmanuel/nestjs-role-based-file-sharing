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

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  constructor(
    @InjectModel(FileEntity.name) private readonly fileModel: Model<FileEntity>,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    createFileDto: CreateFileDto,
    ownerId: number,
  ): Promise<FileEntity> {
    if (!Buffer.isBuffer(file.buffer)) {
      throw new BadRequestException('Expected file.buffer to be a Buffer');
    }
    const { encrypted, iv } = encryptBuffer(file.buffer);
    const storedName = `${Date.now()}-${file.originalname}`;
    const uploadDir = path.join(process.cwd(), 'uploads');

    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, storedName);
    fs.writeFileSync(filePath, encrypted);

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

    return created.save();
  }

  async listFiles(query: ListFilesQueryDto, user: ActiveUserData) {
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
  ): Promise<FileEntity> {
    const file = await this.fileModel.findById(fileId);

    if (!file) {
      throw new NotFoundException('File not found');
    }
    if (dto.description) file.description = dto.description;
    if (dto.tags) file.tags = dto.tags;

    await file.save();
    return file;
  }
}
