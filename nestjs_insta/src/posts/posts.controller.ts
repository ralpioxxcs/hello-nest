import { Body, Controller, DefaultValuePipe, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  /**
   * /posts
   * 모든 posts를 가져온다
   * @returns 
   */
  @Get()
  getPosts() {
    return this.postsService.getAllPosts();
  }

  /**
   * /posts/:id
   * id에 해당되는 post를 가져온다
   *
   */
  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  /**
   *  /posts
   *  Post를 생성
   */
  @Post()
  postPosts(
    @Body('authorId') authorId: number,
    @Body('title') title: string,
    @Body('content') content: string
  ) {
    return this.postsService.createPost(authorId, title, content);
  }

  /**
   * /post/:id
   * id에 해당되는 POST를 변경
   */
  @Put(':id')
  putPost(
    @Param('id', ParseIntPipe) id: number,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    return this.postsService.updatePost(+id, title, content)
  }

  /**
   * 
   * /post/:id
   * id에 해당되는 POST를 삭제
   */
  @Delete(':id')
  deletePost(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.postsService.deletePost(+id)
  }
}
