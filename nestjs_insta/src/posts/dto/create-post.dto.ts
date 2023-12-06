import { PostsModel } from '../entities/posts.entity';
import { PickType } from '@nestjs/mapped-types';

// Pick, Omit, Partial -> reutrn 'Type'
// PickType, OmitType, PartialType -> return 'Value'

export class CreatePostDto extends PickType(PostsModel, ['title', 'content']) {}
