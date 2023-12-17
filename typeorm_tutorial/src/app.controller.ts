import { Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, UserModel } from './entity/user.entity';
import { Between, Equal, ILike, In, IsNull, LessThan, LessThanOrEqual, Like, Not, Repository } from 'typeorm';
import { ProfileModel } from './entity/profile.entity';
import { PostModel } from './entity/post.entity';
import { TagModel } from './entity/tag.entity';

@Controller()
export class AppController {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    @InjectRepository(ProfileModel)
    private readonly profileRepository: Repository<ProfileModel>,
    @InjectRepository(PostModel)
    private readonly postRepository: Repository<PostModel>,
    @InjectRepository(TagModel)
    private readonly tagRepository: Repository<TagModel> 
  ) {}

  @Post('sample')
  async sample() {
    // 모델에 해당되는 객체 생성 - 저장은 X
    const user1 = this.userRepository.create({
      email: 'haha-imnotsave@naver.com',
    });

    // preload
    // 입력된 값을 기반으로 데이터베이스에 있는 데이터를 불러오고
    // 추가 입력된 값으로 데이터베이스에서 가져온 값들을 대체함
    // 저장은 안함
    /*
    const user3 = await this.userRepository.preload({
      id: 101,
      email: 'change@naver.com',
    });
    */
    
  
    // await this.userRepository.increment({id: 1}, 'count', 2)
    // await this.userRepository.decrement({id: 1}, 'count', 1)

    // 갯수 카운팅
    /*
    await this.userRepository.count({
      where: {
        email: ILike('%0%'),
      },
    });
    */

    /*
    await this.userRepository.sum('count', {
      email: ILike('%0%'),
    });
    */
  
    /*
    await this.userRepository.average('count', {
      id: LessThan(4),
    });
    */

    const usersAndCount = await this.userRepository.findAndCount({
      take: 3,
    });

    return usersAndCount;
  }

  @Post('users')
  async postUser() {
    for (let index = 0; index < 100; index++) {
      await this.userRepository.save({
        email: `user-${index}@google.com`
      });
    }
  }

  @Get('users')
  getUser() {
    return this.userRepository.find({
      // 어떤 property를 선택할지
      // 기본은 모든 property를 가져온다 -> select를 정의하지 않으면
      // 정의된 property들만 가져온다 -> select를 정의하면
      /*
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        version: true,
        profile: {
          id: true,
        }
      },
      */

      // 필터링할 조건 입력
      where: {
        // 아닌 경우 가져오기
        // id: Not(1),
        
        // 적은 경우 가져오기
        // id: LessThan(30)

        // 적거나 같거나 경우 가져오기
        // id: LessThanOrEqual(30)

        // 많은 경우 가져오기
        // id: MoreThan(30)

        // 많거나 같거나 경우 가져오기
        // id: MoreThanOrEqual(30)
        
        // 같은 경우
        // id: Equal(30);

        // 유사값
        // email: Like('%GOOGLE%')

        // 대문자 소문자 구분 안하는 유사값
        // email: ILike('%GOOGLE%')

        // 사잇값
        // id: Between(10, 15)
  
        // 해당되는 여러 값
        // id: In([1, 3, 5, 7, 99])
        
        // null인 경우 가져오기
        // id: IsNull(),
      },

      /*
      relations: {
        profile: true,
      },
      */

      // 오름차순, 내림차순
      order: {
        id: 'ASC'
      },

      // 처음 몇개를 제외할지
      // skip: 0,

      // 몇개를 가져올지 (0: 전부)
      // take: 1,
    });
  }

  @Patch('users/:id')
  async patchUser(
    @Param('id') id: string,
  ) {
    const user = await this.userRepository.findOne({
      where: {
        id: parseInt(id),
      }
    });

    return this.userRepository.save({
      ...user,
      email: user.email + 0
    })
  }

  @Get('user/profile')
  async getProfiles() {
    return this.profileRepository.find({
      relations: {
        user: true
      }

    });
  }

  @Post('user/profile')
  async createUserAndProfile() {
    const user = await this.userRepository.save({
      email: 'asdf@google.com',

      // test cascade 
      /*
      profile: {
        profileImg: 'sex.png'
      }
      */
    });
  
    await this.profileRepository.save({
      profileImg: 'asdf.jpg',
      user,
    })

    return user;
  }

  @Delete('user/profile/:id')
  async deleteProfile(
    @Param('id') id: string,
  ) {
    await this.profileRepository.delete(+id);
  }

  @Post('user/post')
  async createUserAndPosts() {
    const user = await this.userRepository.save({
      email: 'postuser@google.com',
    });

    await this.postRepository.save({
      author: user,
      title: 'post 1',
    });

    await this.postRepository.save({
      author: user,
      title: 'post 2',
    });
    
    return user;
  }

  @Post('posts/tags')
  async createPostTags() {
    const post_1 = await this.postRepository.save({
      title: 'NestJS',
    })

    const post_2 = await this.postRepository.save({
      title: 'Algorithm',
    })

    const tag_1 = await this.tagRepository.save({
      name: 'js',
      posts: [post_1, post_2],
    });

    const tag_2 = await this.tagRepository.save({
      name: 'go',
      posts: [post_1],
    });

    const post_3 = await this.postRepository.save({
      title: 'Computer Science',
      tags: [tag_1, tag_2],
    })

    return true;
  }

  @Get('posts')
  getPosts() {
    return this.postRepository.find({
      relations: {
        tags: true,
      }
    });
  }

  @Get('tags')
  getTags() {
    return this.tagRepository.find({
      relations: {
        posts: true,
      }
    });
  }
}
