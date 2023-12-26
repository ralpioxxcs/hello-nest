import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type SchemaDocument = HydratedDocument<Todo>;

@Schema({
  versionKey: false,
  timestamps: true,
})
export class Todo {
  @Prop({
    type: SchemaTypes.ObjectId,
    require: true,
  })
  author: string;

  @Prop({
    require: true,
  })
  title: string;

  @Prop({
    require: true,
  })
  content: string;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
