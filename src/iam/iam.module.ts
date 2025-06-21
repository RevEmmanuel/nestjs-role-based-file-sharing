import { Module } from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { User, UserSchema } from 'src/users/entities/user.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard } from './guards/auth/auth.guard';
import { AccessTokenGuard } from './guards/access-token/access-token.guard';
import { APP_GUARD } from '@nestjs/core';
import { RefreshTokenIdsStorage } from './storage/refresh-token-ids.storage/refresh-token-ids.storage';
import { RoleGuard } from './guards/role/role.guard';
import { RolesModule } from 'src/roles/roles.module';
import { PermissionsGuard } from 'src/iam/guards/permission/permission.guard';

@Module({
  imports: [
    // Registers the User schema for MongoDB with Mongoose
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

    // Imports the RolesModule to use roles and permissions features
    RolesModule,

    // Registers the JwtModule asynchronously with configuration from jwtConfig
    JwtModule.registerAsync(jwtConfig.asProvider()),

    // Loads the jwtConfig configuration namespace for injection and use within this module
    ConfigModule.forFeature(jwtConfig),
  ],
  providers: [
    // Provides a HashingService implementation using BcryptService for password hashing
    {
      provide: HashingService,
      useClass: BcryptService,
    },

    // Globally applies the AuthGuard to all routes to enforce authentication
    { provide: APP_GUARD, useClass: AuthGuard },

    // Globally applies the RoleGuard to all routes to enforce role-based access control
    { provide: APP_GUARD, useClass: RoleGuard },

    // Globally applies the PermissionsGuard to all routes to enforce permission checks
    { provide: APP_GUARD, useClass: PermissionsGuard },

    // Provides the AccessTokenGuard for validating JWT access tokens on protected routes
    AccessTokenGuard,

    // Service for managing refresh token IDs and their validity storage
    RefreshTokenIdsStorage,

    // Core service responsible for authentication logic such as sign-in, sign-up, token generation
    AuthService,
  ],
  // Registers the AuthController to handle authentication-related HTTP endpoints
  controllers: [AuthController],
})
export class IamModule {}
