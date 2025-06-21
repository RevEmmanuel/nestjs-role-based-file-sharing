import { RoleGuard } from './role.guard';
import { Reflector } from '@nestjs/core';

describe('RoleGuard', () => {
  it('should be defined', () => {
    const mockReflector = {} as Reflector;
    expect(new RoleGuard(mockReflector)).toBeDefined();
  });
});
