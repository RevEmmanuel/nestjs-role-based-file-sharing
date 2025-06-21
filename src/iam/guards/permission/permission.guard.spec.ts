// src/iam/guards/permission.guard.spec.ts

import { PermissionsGuard } from './permission.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { Permission } from 'src/users/enums/permission.enum';
import { Role } from 'src/users/enums/role.enum';
import { REQUEST_USER_KEY } from 'src/iam/constants/iam.constants';
import { ForbiddenException } from '@nestjs/common';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  const mockExecutionContext = (
    permissions: Permission[],
    role: Role,
  ): ExecutionContext => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          [REQUEST_USER_KEY]: { role },
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(permissions);

    return context;
  };

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionsGuard(reflector);
  });

  it('should allow access if no permissions are required', () => {
    const context = mockExecutionContext([], Role.Employee);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has all required permissions', () => {
    const context = mockExecutionContext(
      [Permission.FileRead, Permission.FileUpload],
      Role.Manager,
    );
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user lacks permissions', () => {
    const context = mockExecutionContext([Permission.AuditView], Role.Employee);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
