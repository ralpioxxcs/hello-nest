import {
  ClassSerializerInterceptor,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersModel } from './entities/users.entity';
import { User } from './decorator/user.decorator';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner as QR } from 'typeorm';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { RolesGuard } from './guard/roles.guard';
import { IsPublic } from 'src/common/decorator/is-public.decorator';
import { IsPostMineOrAdminGuard } from 'src/posts/guard/is-post-mine-or-admin.guard';
import { RolesEnum } from './const/roles.const';
import { Roles } from './decorator/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   *    serialization(직렬화)
   *        -> 현재 시스템에서 사용되는 데이터 구조를
   *           다른 시스템에서도 쉽게 사용할 수 있는 포맷으로 변환 (class object -> JSON format)
   *
   *    deserialization(역직렬화)
   *        -> serialization의 반대 (JSON format -> class object)
   *
   * */

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.ADMIN)
  getUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('follow/me')
  async getFollow(
    @User() user: UsersModel,
    @Query('includeNotConfirmed', new DefaultValuePipe(false), ParseBoolPipe)
    includeNotConfirmed: boolean,
  ) {
    return this.usersService.getFollowers(user.id, includeNotConfirmed);
  }

  @Post('follow/:id')
  async postFollow(
    @User() user: UsersModel,
    @Param('id', ParseIntPipe) followeeId: number,
  ) {
    return await this.usersService.followUser(user.id, followeeId);
  }

  @Patch('follow/:id/confirm')
  @UseInterceptors(TransactionInterceptor)
  async patchFollowConfirm(
    @User() user: UsersModel,
    @Param('id', ParseIntPipe) followerId: number,
    @QueryRunner() qr: QR,
  ) {
    await this.usersService.confirmFollow(followerId, user.id, qr);
    await this.usersService.incrementFollowerCount(user.id, qr);

    return true;
  }

  @Delete('follow/:id')
  async deleteFollow(
    @User() user: UsersModel,
    @Param('id', ParseIntPipe) followeeId: number,
    @QueryRunner() qr: QR,
  ) {
    await this.usersService.cancelFollow(followeeId, user.id);
    await this.usersService.decrementFollowerCount(user.id, qr);

    return true;
  }

  /*
  @Post()
  postUser(
    @Body('nickname') nickname :string,
    @Body('email') email:string,
    @Body('password') password:string,
  ) {
    return this.usersService.createUsers({nickname, email, password});
  }
  */
}
