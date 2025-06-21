import { AuthGuard } from './auth.guard';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from '../access-token/access-token.guard';

describe('AuthGuard', () => {
  it('should be defined', () => {
    const mockReflector = {} as Reflector;
    const mockAccessTokenGuard = {
      canActivate: jest.fn().mockResolvedValue(true),
    } as unknown as AccessTokenGuard;

    expect(new AuthGuard(mockReflector, mockAccessTokenGuard)).toBeDefined();
  });
});
