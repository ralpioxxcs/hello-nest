import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, LessThan, MoreThan, Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/pagainate-post.dto';
import { HOST, PROTOCOL } from 'src/common/const/env.const';
import { CommonService } from 'src/common/common.service';
// interface PostModel {
//     id: number;
//     author: string;
//     title: string;
//     content: string;
//     likeCount: number;
//     commentCount: number;
// };

// let posts: PostModel[] = [
//     {
//         id: 1,
//         author: 'newjeans',
//         title: 'minji',
//         content: 'asdasd',
//         likeCount: 100000,
//         commentCount: 2323,
//     },
//     {
//         id: 2,
//         author: 'newjeans',
//         title: 'haerin',
//         content: 'asdbnlzx',
//         likeCount: 42552,
//         commentCount: 323,
//     },
//     {
//         id: 3,
//         author: 'blackpink',
//         title: 'roze',
//         content: 'kasddbnlzx',
//         likeCount: 62352,
//         commentCount: 9523,
//     },
// ]

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    private readonly commonService: CommonService,
  ) {}

  async getAllPosts() {
    return this.postsRepository.find({
      relations: ['author'],
    });
  }

  async generatePosts(userId: number) {
    for (let index = 0; index < 100; index++) {
      await this.createPost(userId, {
        title: `random post ${index}`,
        content: `random content ${index}`,
      });
    }
  }

  async paginatePosts(dto: PaginatePostDto) {
    return this.commonService.paginate(
      dto,
      this.postsRepository,
      {
        relations: ['author'],
      },
      'posts',
    );
  }

  async pagePaginatePosts(dto: PaginatePostDto) {
    /**
     *  data: Data[],
     *  total: number,
     *  next: ?? -> 누르는 순간에 페이지를 이미 알고있으므로 딱히 필요가없다
     *
     *  [1] [2] [3] [4] ... [n]
     *
     **/
    const [posts, count] = await this.postsRepository.findAndCount({
      skip: dto.take * (dto.page - 1),
      take: dto.take,
      order: {
        createdAt: dto.order__createdAt,
      },
    });

    return {
      data: posts,
      total: count,
    };
  }

  async cursorPaginatePosts(dto: PaginatePostDto) {
    const where: FindOptionsWhere<PostsModel> = {};
    if (dto.where__id__less_than) {
      where.id = LessThan(dto.where__id__less_than);
    } else if (dto.where__id__more_than) {
      where.id = MoreThan(dto.where__id__more_than);
    }

    // 1. 오름차순으로 정렬하는 pagination

    // 1,2,3,4,5
    const posts = await this.postsRepository.find({
      where,
      order: {
        createdAt: dto.order__createdAt,
      },
      take: dto.take,
    });

    // 해당되는 post가 0개 이상이면,
    //  -> 마지막 포스트를 가져오고
    //  -> 아니면 null반환
    //
    //  마지막페이지 체크
    const lastItem =
      posts.length > 0 && posts.length === dto.take
        ? posts[posts.length - 1]
        : null;

    const nextUrl = lastItem && new URL(`${PROTOCOL}://${HOST}/posts`);
    if (nextUrl) {
      // dto의 key값들을 순회하면서 키값에 해당되는 값이 존재하면 param에 붙여넣는다
      // 단, 'where__id_more_than' 값만 lastItem의 마지막값으로 넣어준다.
      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (key !== 'where__id_more_than' && key !== 'where__id_less_than') {
            nextUrl.searchParams.append(key, dto[key]);
          }
        }
      }

      let key = null;
      if (dto.order__createdAt === 'ASC') {
        key = 'where__id_more_than';
      } else {
        key = 'where__id_less_than';
      }

      nextUrl.searchParams.append(key, lastItem.id.toString());
    }

    console.debug(nextUrl);

    /**
     *  Response
     *
     *  data: Data[],
     *  cursor: {
     *      after: 마지막 data의 ID값
     *  },
     *  count: 응답된 데이터 갯수
     *  next: 다음 요청 URL
     *
     */

    return {
      data: posts,
      cursor: {
        after: lastItem?.id ?? null, // 'undefined' or 'null', 0 등 false값이 아닐경우에만 넣어준다
      },
      count: posts.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      where: {
        id,
      },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  async createPost(authorId: number, postDto: CreatePostDto) {
    const post = this.postsRepository.create({
      author: {
        id: authorId,
      },
      ...postDto,
      likeCount: 0,
      commentCount: 0,
    });

    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async updatePost(postId: number, postDto: UpdatePostDto) {
    const { title, content } = postDto;

    const post = await this.postsRepository.findOne({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException();
    }
    if (title) {
      post.title = title;
    }
    if (content) {
      post.content = content;
    }

    const newPost = await this.postsRepository.save(post);

    return newPost;
  }

  async deletePost(postId: number) {
    const post = await this.postsRepository.findOne({
      where: {
        id: postId,
      },
    });

    if (!post) {
      throw new NotFoundException();
    }

    await this.postsRepository.delete(postId);

    return postId;
  }
}
