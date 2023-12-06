import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';
import { UsersModel } from '../entities/users.entity';

export const User = createParamDecorator((data: keyof UsersModel | undefined, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest();

  const user = req.user as UsersModel;

  if (!user) {
    throw new InternalServerErrorException('Not found \"user property\" in request, You should use User decorator with AccessTokenGuard');
  }

  if(data) {
    return user[data];

  }

  return user;
});
