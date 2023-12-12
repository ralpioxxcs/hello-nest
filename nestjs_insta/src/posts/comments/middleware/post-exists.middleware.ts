import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PostsService } from 'src/posts/posts.service';

@Injectable()
export class PostExistsMiddleware implements NestMiddleware {
  constructor(private readonly postsService: PostsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const postId = req.params.postId;
    if (!postId) {
      throw new BadRequestException(`postId parameter is mandatory`);
    }

    const exists = await this.postsService.checkPostExistsById(+postId);
    if (!exists) {
      throw new BadRequestException(`post is not exists (postId: ${postId})`);
    }

    next();
  }
}
