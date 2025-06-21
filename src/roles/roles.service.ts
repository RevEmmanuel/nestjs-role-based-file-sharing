import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from 'src/roles/entities/role.entity';
import { Permission } from 'src/roles/entities/permission.entity';
import { Model } from 'mongoose';
import { CreateRoleDto } from 'src/roles/dto/create-role.dto';
import { WinstonLogger } from '../../config/winston.logger';

@Injectable()
export class RolesService {
  private readonly logger = new WinstonLogger(RolesService.name);
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
  ) {}

  async createRole(dto: CreateRoleDto): Promise<Role> {
    this.logger.log(`Creating role: ${dto.name}`);
    const permissions = await this.permissionModel.find({
      name: { $in: dto.permissions },
    });

    if (permissions.length !== dto.permissions.length) {
      this.logger.warn(
        `Permissions not found or incomplete for role ${dto.name}`,
      );
      throw new NotFoundException('One or more permissions not found');
    }

    const role = new this.roleModel({
      name: dto.name,
      label: dto.label,
      permissions: permissions.map((p: Permission) => p._id),
    });

    const createdRole = await this.roleModel.create(role);
    this.logger.log(`Role created successfully: ${dto.name}`);
    return createdRole;
  }

  async findAllRoles(): Promise<Role[]> {
    this.logger.log('Fetching all roles');
    const roles = await this.roleModel.find().populate('permissions');
    this.logger.log(`Fetched ${roles.length} roles`);
    return roles;
  }

  async findPermissions(): Promise<Permission[]> {
    this.logger.log('Fetching all permissions');
    const permissions = await this.permissionModel.find();
    this.logger.log(`Fetched ${permissions.length} permissions`);
    return permissions;
  }

  async findRoleById(id: string): Promise<Role> {
    this.logger.log(`Finding role by ID: ${id}`);
    const role = await this.roleModel.findById(id).populate('permissions');
    if (!role) {
      this.logger.warn(`Role with ID ${id} not found`);
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    this.logger.log(`Role found: ${role.name} (ID: ${id})`);
    return role;
  }

  async findPermissionById(id: string): Promise<Permission> {
    this.logger.log(`Finding permission by ID: ${id}`);
    const permission = await this.permissionModel.findById(id);
    if (!permission) {
      this.logger.warn(`Permission with ID ${id} not found`);
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    this.logger.log(`Permission found: ${permission.name} (ID: ${id})`);
    return permission;
  }
}
