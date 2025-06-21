import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import jwtConfig from 'src/iam/config/jwt.config';
import { REQUEST_USER_KEY } from 'src/iam/constants/iam.constants';
import { ActiveUserData } from '../../interfaces/active-user.data.interface';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  private readonly logger = new Logger(AccessTokenGuard.name);
  constructor(
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      this.logger.warn('Access denied: No token provided');
      throw new UnauthorizedException();
    }
    try {
      request[REQUEST_USER_KEY] =
        await this.jwtService.verifyAsync<ActiveUserData>(
          token,
          this.jwtConfiguration,
        );
      this.logger.debug(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Token verified for user ID: ${request[REQUEST_USER_KEY].sub}`,
      );
    } catch {
      this.logger.warn(`Access denied: Token verification failed`);
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, token] = request.headers.authorization?.split(' ') ?? [];
    return token;
  }
}
