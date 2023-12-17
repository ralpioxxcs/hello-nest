import { PickType } from '@nestjs/mapped-types';
import { User } from 'src/schemas/user.schema';

export class CreateUserDto extends PickType(User, [
  'email',
  'nickname',
  'password',
  'age',
  'imgUrl',
]) {}
