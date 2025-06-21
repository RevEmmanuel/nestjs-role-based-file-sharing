import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Permission as PermissionEnum } from 'src/users/enums/permission.enum';
import { Role } from 'src/roles/entities/role.entity';
import { Permission } from 'src/roles/entities/permission.entity';
import { RolePermissionsMap } from 'src/users/constants/role-permissions.map';
import { User } from 'src/users/entities/user.entity';
import { HashingService } from 'src/iam/hashing/hashing.service';
import { WinstonLogger } from '../../../config/winston.logger';

@Injectable()
export class UsersRolesAndPermissionsSeeder implements OnApplicationBootstrap {
  private readonly logger = new WinstonLogger(
    UsersRolesAndPermissionsSeeder.name,
  );
  constructor(
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<Permission>,
    @InjectModel(Role.name)
    private readonly roleModel: Model<Role>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly hashingService: HashingService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log(
      'Starting database seeding for permissions, roles, and users...',
    );
    try {
      await this.seedPermissions();
      this.logger.log('Permissions done');
      await this.seedRoles();
      this.logger.log('Roles done');
      await this.seedUsers();
      this.logger.log('Users done');
      this.logger.log('Database seeding completed successfully.');
    } catch (error) {
      this.logger.error('Error during database seeding', error);
    }
  }

  private async seedPermissions() {
    const existing = await this.permissionModel.find().lean();
    if (existing.length === Object.values(PermissionEnum).length) {
      this.logger.log('Permissions already seeded.');
      return;
    }

    const toInsert = Object.values(PermissionEnum).map((perm) => ({
      name: perm,
    }));
    await this.permissionModel.insertMany(toInsert);
    this.logger.log('Permissions seeded successfully.');
  }

  private async seedRoles() {
    const permissions = await this.permissionModel.find().lean();

    for (const [roleName, permissionEnums] of Object.entries(
      RolePermissionsMap,
    )) {
      const existing = await this.roleModel.findOne({ name: roleName }).lean();
      if (existing) continue;

      const rolePermissions = permissions.filter((perm) =>
        permissionEnums.includes(perm.name as PermissionEnum),
      );

      await this.roleModel.create({
        name: roleName,
        label: roleName.charAt(0).toUpperCase() + roleName.slice(1),
        permissions: rolePermissions.map((p) => p._id),
      });

      this.logger.log(`Role "${roleName}" seeded.`);
    }
  }

  private async seedUsers() {
    const existingUsers = await this.userModel.countDocuments();
    if (existingUsers > 0) {
      this.logger.log('Users already seeded.');
      return;
    }
    const roles = await this.roleModel.find();
    const getRoleIdByName = (name: string): Types.ObjectId => {
      const role = roles.find((r) => r.name === name);
      if (!role) throw new Error(`Role "${name}" not found`);
      return role._id as Types.ObjectId;
    };
    const defaultUsers = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'Admin@123',
        role: getRoleIdByName('admin'),
      },
      {
        name: 'Manager User',
        email: 'manager@example.com',
        password: 'Manager@123',
        role: getRoleIdByName('manager'),
      },
      {
        name: 'Employee User',
        email: 'employee@example.com',
        password: 'Employee@123',
        role: getRoleIdByName('employee'),
      },
      {
        name: 'Guest User',
        email: 'guest@example.com',
        password: 'Guest@123',
        role: getRoleIdByName('guest'),
      },
    ];

    for (const user of defaultUsers) {
      const hashedPassword = await this.hashingService.hash(user.password);
      await this.userModel.create({
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
      });
      this.logger.log(`User "${user.email}" created.`);
    }
  }
}
