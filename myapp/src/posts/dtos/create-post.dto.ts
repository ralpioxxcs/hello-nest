import { PickType } from '@nestjs/mapped-types';
import { Post } from 'src/schemas/post.schema';

export class CreatePostDto extends PickType(Post, [
  'author',
  'title',
  'content',
]) {}
