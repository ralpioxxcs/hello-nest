import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { ObjectIdPipe } from 'src/common/pipes/obejctid.pipe';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getPosts() {
    return this.postsService.findAll();
  }

  @Post()
  postPost(@Body() body: CreatePostDto) {
    return this.postsService.createPost(body);
  }

  @Delete(':id')
  deletePost(@Param('id', ObjectIdPipe) id: string) {
    return this.postsService.deletePost(id);
  }
}
