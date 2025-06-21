import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from 'src/users/enums/permission.enum';
import { PERMISSIONS_KEY } from 'src/iam/decorators/permissions.decorator';
import { REQUEST_USER_KEY } from 'src/iam/constants/iam.constants';
import { ActiveUserData } from 'src/iam/interfaces/active-user.data.interface';
import { RolePermissionsMap } from 'src/users/constants/role-permissions.map';
import { Observable } from 'rxjs';
import { WinstonLogger } from '../../../../config/winston.logger';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  private readonly logger = new WinstonLogger(PermissionsGuard.name);

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      this.logger.log(
        'No permissions required for this route, access granted.',
      );
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ [REQUEST_USER_KEY]: ActiveUserData }>();
    const user = request[REQUEST_USER_KEY];

    const userPermissions = RolePermissionsMap[user.role] || [];

    const hasPermission = requiredPermissions.every((perm) =>
      userPermissions.includes(perm),
    );
    if (!hasPermission) {
      this.logger.warn(
        `User with role "${user.role}" lacks required permissions: ${requiredPermissions.join(
          ', ',
        )}. User permissions: ${userPermissions.join(', ')}`,
      );
      throw new ForbiddenException(
        'You are not authorized to perform this action',
      );
    }
    this.logger.log(
      `User with role "${user.role}" authorized with permissions: ${requiredPermissions.join(
        ', ',
      )}`,
    );
    return true;
  }
}
