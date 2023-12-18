import { PickType } from '@nestjs/mapped-types';
import { User } from 'src/schemas/user.schema';

export class RegisterUserDto extends PickType(User, [
  'nickname',
  'password',
  'email',
]) {}
