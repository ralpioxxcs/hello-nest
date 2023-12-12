import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CommentsService } from '../comments.service';
import { Request } from 'express';
import { UsersModel } from 'src/users/entities/users.entity';
import { RolesEnum } from 'src/users/const/roles.const';

@Injectable()
export class IsCommentMineOrAdminGuard implements CanActivate {
  constructor(private readonly commentsService: CommentsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as Request & {
      user: UsersModel;
    };

    const { user } = req;
    if (!user) {
      throw new UnauthorizedException(`cannot get user information`);
    }

    if (user.role === RolesEnum.ADMIN) {
      return true;
    }

    const commentId = req.params.commentId;
    if (!commentId) {
      throw new BadRequestException('you should give "commentId" as parameter');
    }

    const isOk = await this.commentsService.isCommentMine(user.id, +commentId);
    if (!isOk) {
      throw new ForbiddenException("you don't have permission");
    }

    return true;
  }
}
