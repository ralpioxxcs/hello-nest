import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { UsersModel } from './entities/users.entity';
import { UserFollowersModel } from './entities/user-followers.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly usersRepository: Repository<UsersModel>,
    @InjectRepository(UserFollowersModel)
    private readonly userFollowersRepository: Repository<UserFollowersModel>,
  ) {}

  getUsersRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<UsersModel>(UsersModel)
      : this.usersRepository;
  }

  getUsersFollowerRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<UserFollowersModel>(UserFollowersModel)
      : this.userFollowersRepository;
  }

  async createUsers(user: Pick<UsersModel, 'email' | 'nickname' | 'password'>) {
    // nickname 중복 확인
    // exist() -> 만약에 해당되는 값이 있으면 true
    const nicknameExists = await this.usersRepository.exist({
      where: {
        nickname: user.nickname,
      },
    });

    if (nicknameExists) {
      throw new BadRequestException('already exists nickname');
    }

    const emailExists = await this.usersRepository.exist({
      where: {
        email: user.email,
      },
    });

    if (emailExists) {
      throw new BadRequestException('already exists email');
    }

    const userObject = this.usersRepository.create({
      nickname: user.nickname,
      email: user.email,
      password: user.password,
    });

    const newUser = await this.usersRepository.save(userObject);

    return newUser;
  }

  async getAllUsers() {
    return this.usersRepository.find({});
  }

  async getUserByEmail(email: string) {
    return this.usersRepository.findOne({
      where: {
        email,
      },
    });
  }

  async followUser(followerId: number, followeeId: number, qr?: QueryRunner) {
    // check user exists
    const userExists = await this.usersRepository.findOne({
      where: {
        id: followeeId,
      },
    });
    if (!userExists) {
      throw new NotFoundException(`followee not exits (${followeeId})`);
    }

    const userFollowersRepository = this.getUsersFollowerRepository(qr);

    const exits = await userFollowersRepository.findOne({
      where: {
        follower: {
          id: followerId,
        },
        followee: {
          id: followeeId,
        },
      },
    });
    if (exits) {
      throw new BadRequestException('already following');
    }

    const result = await userFollowersRepository.save({
      follower: {
        id: followerId,
      },
      followee: {
        id: followeeId,
      },
    });

    return result;

    /*
    const user = await this.usersRepository.findOne({
      where: {
        id: followerId,
      },
      relations: {
        followees: true,
      },
    });

    if (!user) {
      throw new BadRequestException('not exists follower');
    }

    await this.usersRepository.save({
      ...user,
      followees: [
        ...user.followees,
        {
          id: followeeId,
        },
      ],
    });
    */
  }

  async getFollowers(userId: number, includeNotConfirmed: boolean) {
    const where = {
      followee: {
        id: userId,
      },
      //isConfirmed: false,
    };

    if (!includeNotConfirmed) {
      where['isConfirmed'] = true;
    }

    console.debug(where);

    const result = await this.userFollowersRepository.find({
      where,
      relations: {
        follower: true,
        followee: true,
      },
    });

    return result.map((x) => ({
      id: x.follower.id,
      nickname: x.follower.nickname,
      email: x.follower.email,
      isConfirmed: x.isConfirmed,
    }));

    /*
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        followers: true,
      },
    });

    return user.followers;
 */
  }

  async confirmFollow(
    followerId: number,
    followeeId: number,
    qr?: QueryRunner,
  ) {
    const userFollowersRepository = this.getUsersFollowerRepository(qr);
    const exitsting = await userFollowersRepository.findOne({
      where: {
        follower: {
          id: followerId,
        },
        followee: {
          id: followeeId,
        },
      },
      relations: {
        follower: true,
        followee: true,
      },
    });

    if (!exitsting) {
      throw new BadRequestException('not exists follower');
    }

    await userFollowersRepository.save({
      ...exitsting,
      isConfirmed: true,
    });

    return true;
  }

  async cancelFollow(followeeId: number, followerId: number, qr?: QueryRunner) {
    const userFollowersRepository = this.getUsersFollowerRepository(qr);

    const follower = await userFollowersRepository.findOne({
      where: {
        follower: {
          id: followerId,
        },
        followee: {
          id: followeeId,
        },
      },
      relations: {
        follower: true,
        followee: true,
      },
    });

    if (!follower) {
      throw new NotFoundException('not exists follower');
    }

    await userFollowersRepository.delete({
      follower: {
        id: followerId,
      },
      followee: {
        id: followeeId,
      },
    });

    return true;
  }

  async incrementFollowerCount(userId: number, qr?: QueryRunner) {
    const usersRepository = await this.getUsersRepository(qr);
    await usersRepository.increment(
      {
        id: userId,
      },
      'followerCount',
      1,
    );
  }

  async decrementFollowerCount(userId: number, qr?: QueryRunner) {
    const usersRepository = await this.getUsersRepository(qr);
    await usersRepository.decrement(
      {
        id: userId,
      },
      'followerCount',
      1,
    );
  }
}
