import { Exclude } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { RolesEnum } from '../const/roles.const';
import { Types } from 'mongoose';

export class ListUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  nickname: string;

  @IsString()
  @Exclude({
    toPlainOnly: true,
  })
  password: string;

  role: RolesEnum;

  @IsOptional()
  @IsNumber()
  age: number;

  @IsOptional()
  @IsString()
  imgUrl?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  posts: Types.ObjectId[];
}
