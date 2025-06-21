import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { WinstonLogger } from '../config/winston.logger';

async function bootstrap() {
  const appOptions = {
    cors: true, // Enable CORS support (e.g., for frontend app access)
    bufferLogs: true,
  };
  const app = await NestFactory.create(AppModule, appOptions); // Create the NestJS application instance
  const logger = app.get(WinstonLogger);
  app.useLogger(logger);
  app.useGlobalPipes(new ValidationPipe()); // Automatically validate incoming requests using class-validator
  app.setGlobalPrefix('api'); // Prefix all routes with /api (e.g., /api/auth, /api/files)
  const swaggerAuthName: string = process.env.SWAGGER_AUTH_NAME as string; // Load Swagger authentication scheme name from environment (e.g., "JWT-auth")
  const config = new DocumentBuilder() // Define Swagger documentation setup using DocumentBuilder
    .setTitle('Secure File Sharing API')
    .setDescription(
      'A role-based file sharing service built with NestJS. Supports JWT authentication, permission-controlled access, real-time notifications via WebSockets, file encryption, and audit logging.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token to authorize requests',
      },
      swaggerAuthName, // This name is important for @ApiBearerAuth annotation
    )
    .setBasePath('api') // (Optional) Sets the base path in the Swagger UI
    .addTag('Auth', 'Endpoints for user registration, login and token refresh')
    .addTag('Files', 'Endpoints for uploading, listing, and updating files')
    .addTag('Users', 'Endpoints for managing users')
    .addTag(
      'Roles',
      'Endpoints for managing roles, these endpoints can only be accessed by managers and admins',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config); // Create the Swagger document from the config and application
  // Serve Swagger UI at /api/docs and JSON at /api/docs/json
  SwaggerModule.setup('api/docs', app, documentFactory, {
    jsonDocumentUrl: 'json',
  });

  await app.listen(process.env.PORT ?? 4000); // Start the application on configured port or fallback to 4000
  console.log(`Application is running on: ${await app.getUrl()}`); // Log the application URL
}

bootstrap(); // Run the bootstrap function to start the app
