import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
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
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { RolesEnum } from 'src/users/const/roles.const';

export type UserDocument = HydratedDocument<User>;

@Schema({
  versionKey: false,
  timestamps: true,
})
export class User {
  _id: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Prop({ required: true })
  @IsString()
  nickname: string;

  @Prop({ required: true })
  @IsString()
  @Exclude({
    toPlainOnly: true,
  })
  password: string;

  @Prop({
    required: true,
    type: String,
    enum: RolesEnum,
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @Prop({ default: null })
  @IsOptional()
  @IsNumber()
  age: number;

  @Prop({ default: null })
  @IsOptional()
  @IsString()
  imgUrl?: string;

  @Prop({
    type: [SchemaTypes.ObjectId],
    ref: 'Post',
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  posts: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
