import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  IsArray,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import mongoose, { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  versionKey: false,
  timestamps: true,
})
export class User {
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
  password: string;

  @Prop({ required: true })
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
