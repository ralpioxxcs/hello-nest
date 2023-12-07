import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/pagainate-post.dto';
import { UsersModel } from 'src/users/entities/users.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * /posts
   * 모든 posts를 가져온다
   * @returns
   */
  @Get()
  getPosts(@Query() query: PaginatePostDto) {
    return this.postsService.paginatePosts(query);
  }

  @Post('random')
  @UseGuards(AccessTokenGuard)
  async postPostRandom(@User() user: UsersModel) {
    await this.postsService.generatePosts(user.id);
    return true
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

  // DTO - Data Transfer Object
  @Post()
  @UseGuards(AccessTokenGuard)
  postPosts(@User('id') userId: number, @Body() body: CreatePostDto) {
    // guard를 통해 user.id의 값이 null이 아님을 보장한다

    return this.postsService.createPost(userId, body);
  }

  /**
   * /post/:id
   * id에 해당되는 POST를 변경
   */
  @Patch(':id')
  patchPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePostDto,
  ) {
    return this.postsService.updatePost(+id, body);
  }

  /**
   *
   * /post/:id
   * id에 해당되는 POST를 삭제
   */
  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(+id);
  }
}
