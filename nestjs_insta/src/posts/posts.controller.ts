import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { UsersModel } from 'src/users/entities/users.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/pagainate-post.dto';
import { ImageModelType } from 'src/common/entity/image.entity';
import { DataSource } from 'typeorm';
import { PostImagesService } from './image/image.service';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsImagesService: PostImagesService,
    private readonly dataSource: DataSource,
  ) {}

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
    return true;
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
  //
  // A Model, B Model
  // Post API -> A모델, B모델을 저장
  //
  // await repo.save(a);
  // await repo.save(b);
  //
  // 만약, a를 저장하다가 실패하면 b를 저장하면 안되는 경우
  // 따로 안정장치가 없다면 b는 저장된다
  //
  // *transaction: all or nothing
  // 트랜잭션으로 묶여있으면, 어떤 기능이 하나라도 안되면 이전 상태로 되돌릴 수 있다
  //
  // [transaction]
  // start -> 시작
  // commit -> 저장
  // rollback -> 원상복구
  @Post()
  @UseGuards(AccessTokenGuard)
  async postPosts(@User('id') userId: number, @Body() body: CreatePostDto) {
    // 트랜잭션과 관련된 모든 쿼리를 담당할 query runner를 생성
    const qr = this.dataSource.createQueryRunner();

    await qr.connect();

    // query runner에서 트랜잭션 시작
    // 이 시점부터 같은 쿼리 러너를 사용하면
    // 트랜잭션 안에서 데이터베이스 액션을 실행 할 수 있음
    await qr.startTransaction();

    // 로직 실행
    try {
      // Guard를 통해 user.id의 값이 null이 아님을 보장한다
      const post = await this.postsService.createPost(userId, body, qr);

      for (let i = 0; i < body.images.length; i++) {
        await this.postsImagesService.createPostImage(
          {
            post,
            order: i,
            path: body.images[i],
            type: ImageModelType.POST_IMAGE,
          },
          qr,
        );

        await qr.commitTransaction();
        await qr.release();

        return this.postsService.getPostById(post.id);
      }
    } catch (err) {
      // 어떤 에러든 발생하면, 트랜잭션 종료 및 롤백
      await qr.rollbackTransaction();
      await qr.release();

      throw new InternalServerErrorException('error occured')
    }
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
