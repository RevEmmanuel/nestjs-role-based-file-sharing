import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { RolesModule } from 'src/roles/roles.module';
import { UsersRolesAndPermissionsSeeder } from 'src/users/seed/default-users-roles-permissions.seeder';
import { HashingService } from 'src/iam/hashing/hashing.service';
import { BcryptService } from 'src/iam/hashing/bcrypt.service';

@Module({
  imports: [
    // Register the User schema with Mongoose for MongoDB integration
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    // Import RolesModule to access roles and permissions functionality
    RolesModule,
  ],
  // Controllers responsible for handling user-related HTTP requests
  controllers: [UsersController],
  // Export UsersService so other modules can inject and use it
  exports: [UsersService],
  providers: [
    // Service containing business logic related to users
    UsersService,
    // Seeder that populates default users, roles, and permissions into the database
    UsersRolesAndPermissionsSeeder,
    // Provide the HashingService interface using the BcryptService implementation for password hashing
    {
      provide: HashingService,
      useClass: BcryptService,
    },
  ],
})
export class UsersModule {}
