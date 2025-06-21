import { AccessTokenGuard } from './access-token.guard';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from 'src/iam/config/jwt.config';
import { ConfigType } from '@nestjs/config';

describe('AccessTokenGuard', () => {
  it('should be defined', () => {
    const mockJwtService = {
      verifyAsync: jest.fn(),
    } as unknown as JwtService;

    const mockJwtConfig: ConfigType<typeof jwtConfig> = {
      secret: 'test-secret',
      audience: 'test-audience',
      issuer: 'test-issuer',
      accessTokenTtl: 3600,
      refreshTokenTtl: 86400,
    };

    const guard = new AccessTokenGuard(mockJwtService, mockJwtConfig);
    expect(guard).toBeDefined();
  });
});
