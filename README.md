# Secure File Sharing API

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (https://nodejs.org/)
- Docker (https://www.docker.com/)
- NestJS CLI (https://docs.nestjs.com/cli/overview)


## Table of Contents


### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/RevEmmanuel/nestjs-role-based-file-sharing.git
   cd nestjs-role-based-file-sharing
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   Copy `.env.sample` to `.env` and update the environment variables according to your setup.

4. Start the required services using Docker:

   ```bash
   docker compose up -d
   ```

5. Start the NestJS application in Devlopment mode:

   ```bash
   npm run start:dev
   ```

6. Access the API at `http://localhost:3000`.

## Project Overview
Secure File Sharing API is a scalable backend service built with NestJS and MongoDB designed to manage secure file uploads, access control, and sharing. It implements role-based access control (RBAC) with granular permissions, JWT authentication for secure API access, audit logging, and real-time notifications via WebSockets.
This API allows different user roles (Admin, Employee, Manager, Guest) to perform actions permitted by their assigned permissions, ensuring secure and flexible access management to files and system resources.

## Features
- ### User Registration and Authentication
  Secure signup and signin with password hashing and JWT-based access and refresh tokens.

- ### Role-Based Access Control
  Assign users distinct roles each associated with specific permissions for fine-grained access control.

- ### Permissions Management
  Manage permissions such as file upload, read, update, delete, share, audit view, and user/role management.

- ### Secure File Uploading & Management
  Upload files with metadata, update file information, delete and share files securely.

- ### Token Refreshing
  Secure refresh token workflow to maintain user sessions safely.

- ### Audit Logging
  Tracks user actions for compliance and troubleshooting.

- ### Real-Time Notifications (planned)
  Use WebSockets to notify users about file shares or system events in real-time.

- ### Swagger API Documentation
  Comprehensive interactive API docs available at /api/docs.

## Architecture
- ### NestJS Framework
  Modular architecture with dependency injection, decorators, guards, interceptors.

- ### MongoDB + Mongoose
  Flexible document database with schemas for User, Role, Permission, File, etc.

- ### JWT Authentication
  Secured APIs using JWT tokens for stateless sessions.

- ### Role & Permission Entities
  Roles store references to Permission documents enabling dynamic permission assignment.

- ### Guards and Middleware
  Implements AccessTokenGuard, RolesGuard, PermissionsGuard to protect routes.

## Project Structure

```plaintext
src/
├── iam/           # IAM module, contains authentication and authorization logic
├── roles/         # Roles and Permissions module, contains apis for creating roles and viewing permissions
├── users/         # Users module
├── app.module.ts  # Main application module
├── main.ts        # Entry point of the application
```
## Initial Data Seeding
On application startup, the system automatically seeds the database with the following:

- Default Permissions: All permissions like file.upload, file.read, user.manage, etc.

- Default Roles: Roles such as admin, employee, manager, and guest are created and assigned appropriate permissions.

- Default Users: Sample users are created for each role to facilitate immediate testing and usage.

This ensures that the system is ready to use out-of-the-box without manual setup of roles and permissions.

## Default Users Credentials

For convenience, the project seeds some default users with predefined usernames and passwords.  
You can find these credentials in the following file:  
`src/users/seeds/default-users-roles-permissions.seeder.ts`

> **Note:** For security reasons, these default credentials should only be used in development and testing environments.  
> Be sure to change passwords or remove these users in production.


### Database Seeding

The application automatically seeds the database on first run with necessary roles, permissions, and some default users to help you get started quickly. No manual intervention is needed for initial setup of RBAC entities.

## Defining & Assigning Roles

Roles and permissions are defined in the `src/users/enums/role.enum.ts` file. Modify this file to add or remove roles as needed.

Use the `@Roles()` decorator on your route handlers to specify which roles can access a particular route. The AuthGuard will automatically enforce these restrictions.
For example:

```typescript
@Roles('admin')
@Get()
async findAll(): Promise<User[]> {
  return this.usersService.findAll();
}
```

You can also use the `@Roles()` decorator to specify multiple roles that can access a route. For example:

```typescript
@Roles('admin', 'user')
@Get()
async findAll(): Promise<User[]> {
  return this.usersService.findAll();
}
```

## Roles
- Admin: Has all permissions.

- Employee: Can upload, read, update own files, view audit.

- Manager: Can read all files, manage users.

- Guest: Can only view public files.

Roles are stored in MongoDB and linked to users by ObjectId.

## Accessing the Active User

You can also use the @ActiveUser() decorator to access the current active user object in your route handlers. For example:

```typescript
@Roles('admin')
@Get()
async findAll(@ActiveUser() user: ActiveUserData): Promise<User[]> {
  console.log('ActiveUser:', user);
  return this.usersService.findAll();
}
```

## API Endpoints

### Authentication

- `POST /auth/sign-up`: To create or register a new user, user gets a 'guest' role
- `POST /auth/sign-in`: Signin and obtain a set of signed JWT Access Token and a Refresh Token.
- `POST /auth/refresh-tokens`: Refresh the JWT token using the Refresh Token.

### Users

- `POST /users`: Create a new user (Admin only).
- `PATCH /users/:userId/roles/:roleId`: Assign a role to a user (Admin only).


### Roles

- `POST /roles`: Create a new role (Admin and Manager).
- `GET /roles`: Get all roles
- `GET /roles/permissions`: Get all permissions
- `GET /roles/id`: Get a role by ID
- `GET /roles/permissions/id`: Get a permissions by ID

## Future Improvements

To improve this RBAC file sharing system and make it more robust and user-friendly. Here are some of the enhancements you can expect in the future:

- **Documentation**: Expanding the documentation to include more examples and best practices.
- **Testing**: Implementing comprehensive tests to ensure the system's reliability and security.

## Acknowledgments

A special thanks to the NestJS team and their comprehensive courses. This project was greatly influenced by the knowledge and best practices shared through their courses. Their dedication to providing high-quality educational content has made the implementation of this Role-Based Access Control (RBAC) system possible.

- [NestJS Courses](https://courses.nestjs.com/) - For their invaluable courses and resources.


## Contact

For any questions or inquiries, please contact [Adeola](mailto:adeolaae1@gmail.com).

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
