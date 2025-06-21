import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './entities/role.entity';
import { Permission, PermissionSchema } from './entities/permission.entity';
import { RolesService } from './roles.service';
import { RolesController } from 'src/roles/roles.controller';

@Module({
  imports: [
    // Registers the Role and Permission schemas with Mongoose for MongoDB integration
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema },
    ]),
  ],
  // Provides the RolesService for dependency injection (business logic related to roles and permissions)
  providers: [RolesService],

  // Exports MongooseModule so other modules importing RolesModule can access Role and Permission models
  exports: [MongooseModule],

  // Registers the RolesController to handle HTTP requests related to roles and permissions
  controllers: [RolesController],
})
export class RolesModule {}
