import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RolesEnum } from 'src/users/const/roles.const';
import { PostsService } from '../posts.service';
import { Request } from 'express';
import { UsersModel } from 'src/users/entities/users.entity';

@Injectable()
export class IsPostMineOrAdminGuard implements CanActivate {
  constructor(private readonly postsService: PostsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as Request & {
      user: UsersModel;
    };

    const { user } = req;
    if (!user) {
      throw new UnauthorizedException(`cannot get user information`);
    }

    // ADMIN인 경우 pass
    if (user.role === RolesEnum.ADMIN) {
      return true;
    }

    const postId = req.params.postId;
    if (!postId) {
      throw new BadRequestException('you should give "postId" as parameter');
    }

    const isOk = await this.postsService.isPostMine(user.id, +postId);
    if (!isOk) {
      throw new ForbiddenException(`you don't have permission`);
    }

    return true;
  }
}
