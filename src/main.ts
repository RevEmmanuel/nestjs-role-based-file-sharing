import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
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
      'JWT-auth', // This name is important for @ApiBearerAuth('JWT-auth') later
    )
    .addTag('Auth', 'Endpoints for user registration and login')
    .addTag('Files', 'Endpoints for uploading, listing, and updating files')
    .addTag('Users', 'Endpoints for managing users and roles')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 4000);
}

bootstrap();
