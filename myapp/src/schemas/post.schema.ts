import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { IsString } from 'class-validator';

export type SchemaDocument = HydratedDocument<Post>;

@Schema({
  versionKey: false,
  timestamps: true,
})
export class Post {
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  })
  author: Types.ObjectId;

  @Prop({ required: true })
  @IsString()
  title: string;

  @Prop({ required: true })
  @IsString()
  content: string;

  // @Prop({
  //   type: [SchemaTypes.ObjectId],
  //
  //
  // })
  // images: Types.ObjectId;
}

export const PostSchema = SchemaFactory.createForClass(Post);
