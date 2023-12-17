import { IsOptional, IsString } from 'class-validator';
import { PickType } from '@nestjs/mapped-types';
import { PostsModel } from '../entities/posts.entity';

// Pick, Omit, Partial -> reutrn 'Type'
// PickType, OmitType, PartialType -> return 'Value'

export class CreatePostDto extends PickType(PostsModel, ['title', 'content']) {
  @IsString({
    each: true,
  })
  @IsOptional()
  images: string[] = [];
}
