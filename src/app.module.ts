import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IamModule } from './iam/iam.module';
import { RolesModule } from 'src/roles/roles.module';
import { HealthModule } from './health/health.module';
import { FileModule } from 'src/files/file.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuditModule } from 'src/audits/audits.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [
    // Loads environment variables and makes ConfigService available app-wide
    ConfigModule.forRoot({}),

    EventEmitterModule.forRoot(),

    // Asynchronously sets up MongoDB connection using ConfigService to fetch the URI
    MongooseModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule here to access ConfigService
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'), // MongoDB connection string from env vars
      }),
      inject: [ConfigService], // Inject ConfigService for useFactory
    }),

    // Module handling user-related functionality (CRUD, auth, etc.)
    UsersModule,

    // IAM (Identity and Access Management) module for authentication and authorization
    IamModule,

    // Module that manages roles and permissions
    RolesModule,

    // Health Check for the app
    HealthModule,

    // Module for File Management
    FileModule,

    // Module for Audit
    AuditModule,

    // Module for winston logger
    LoggerModule,
  ], // Main app controller for handling root HTTP routes
  controllers: [AppController],

  // Main app service providing business logic
  providers: [AppService],
})
export class AppModule {}
