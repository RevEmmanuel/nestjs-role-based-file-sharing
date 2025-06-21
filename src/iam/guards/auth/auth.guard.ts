import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { AuthType } from 'src/iam/enums/auth-type.enum';
import { AUTH_KEY_TYPE } from 'src/iam/decorators/auth.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  // constructor(
  //   private readonly reflector: Reflector,
  //   private readonly accessTokenGuard: AccessTokenGuard,
  // ) {}
  // private readonly authTypeGuardMap: Record<
  //   AuthType,
  //   CanActivate | CanActivate[]
  // > = {
  //   [AuthType.Bearer]: this.accessTokenGuard,
  //   [AuthType.None]: { canActivate: () => true },
  // };
  private static readonly defaultAuthType = AuthType.Bearer;
  private authTypeGuardMap: Record<AuthType, CanActivate | CanActivate[]>;

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
      const canActivate = await Promise.resolve(
        instance.canActivate(context),
      ).catch((err) => {
        error = err as UnauthorizedException;
      });

      if (canActivate) {
        return true;
      }
    }
    throw error;
  }
}
