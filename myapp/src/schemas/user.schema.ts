import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Transform, Type } from 'class-transformer';
import { HydratedDocument, Types } from 'mongoose';
import { RolesEnum } from 'src/users/const/roles.const';
import { Post } from './post.schema';
import { Address, AddressSchema } from './address.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({
  versionKey: false,
  timestamps: true,
})
export class User {
  @Transform(({ value }) => value.toString())
  _id: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
  })
  email: string;

  @Prop({ required: true })
  nickname: string;

  @Prop({ required: true })
  @Exclude()
  password: string;

  @Prop({ type: AddressSchema })
  @Type(() => Address)
  address: Address;

  @Prop({
    required: true,
    type: String,
    enum: RolesEnum,
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @Prop({ default: null })
  age: number;

  @Prop({ default: null })
  imgUrl?: string;

  @Type(() => Post)
  posts: Post[];
}

export const UserSchema = SchemaFactory.createForClass(User);
