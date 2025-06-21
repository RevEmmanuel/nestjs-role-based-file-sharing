import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { AuthType } from 'src/iam/enums/auth-type.enum';
import { AUTH_KEY_TYPE } from 'src/iam/decorators/auth.decorator';
import { WinstonLogger } from '../../../../config/winston.logger';

@Injectable()
export class AuthGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.Bearer;
  private authTypeGuardMap: Record<AuthType, CanActivate | CanActivate[]>;
  private readonly logger = new WinstonLogger(AuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
  ) {
    this.authTypeGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.None]: { canActivate: () => true },
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.reflector.getAllAndOverride<AuthType[]>(
      AUTH_KEY_TYPE,
      [context.getHandler(), context.getClass()],
    ) ?? [AuthGuard.defaultAuthType];

    const guards = authTypes.map((type) => this.authTypeGuardMap[type]).flat();
    let error = new UnauthorizedException();

    for (const instance of guards) {
      try {
        const canActivate = await instance.canActivate(context);
        if (canActivate) {
          this.logger.log(
            `Access granted by guard: ${instance.constructor.name}`,
          );
          return true;
        }
      } catch (err) {
        error = err as UnauthorizedException;
        this.logger.warn(
          `Guard ${instance.constructor.name} denied access: ${error.message}`,
        );
      }
    }

    this.logger.error('All guards denied access');
    throw error;
  }
}
