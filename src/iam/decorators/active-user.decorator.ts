import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { REQUEST_USER_KEY } from '../constants/iam.constants';
import { ActiveUserData } from '../interfaces/active-user.data.interface';

export const ActiveUser = createParamDecorator(
  (field: keyof ActiveUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ [key: string]: unknown }>();
    const user = request[REQUEST_USER_KEY] as ActiveUserData;
    return field ? user?.[field] : user;
  },
);
