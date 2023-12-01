import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
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
  getPost(@Param('id') id: string) {
    return this.postsService.getPostById(+id);
  }

  /**
   *  /posts
   *  Post를 생성
   */
  @Post()
  postPosts(
    @Body('author') author: string,
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    return this.postsService.createPost(author, title, content);
  }

  /**
   * /post/:id
   * id에 해당되는 POST를 변경
   */
  @Put(':id')
  putPost(
    @Param('id') id: string,
    @Body('author') author?: string,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ) {
    return this.postsService.updatePost(+id, author, title, content)
  }

  /**
   * 
   * /post/:id
   * id에 해당되는 POST를 삭제
   */
  @Delete(':id')
  deletePost(
    @Param('id') id: string,
  ) {
    return this.postsService.deletePost(+id)
  }
}
