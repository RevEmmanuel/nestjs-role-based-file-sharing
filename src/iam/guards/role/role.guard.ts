import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { REQUEST_USER_KEY } from 'src/iam/constants/iam.constants';
import { ROLES_KEY } from 'src/iam/decorators/roles.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user.data.interface';
import { Role } from 'src/users/enums/role.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly logger = new Logger(RoleGuard.name);
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const contextRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!contextRoles) {
      this.logger.log('No roles required for this route, access granted.');
      return true;
    }
    const request = context
      .switchToHttp()
      .getRequest<{ [REQUEST_USER_KEY]: ActiveUserData }>();
    const user = request[REQUEST_USER_KEY];
    const hasRole = contextRoles.some((role) => user.role === role);

    if (hasRole) {
      this.logger.log(
        `User with role "${user.role}" authorized for roles: ${contextRoles.join(', ')}`,
      );
    } else {
      this.logger.warn(
        `User with role "${user.role}" denied. Required roles: ${contextRoles.join(', ')}`,
      );
    }

    return hasRole;
  }
}
