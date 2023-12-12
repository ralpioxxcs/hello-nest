import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    /**
     *  Roles annotation에 대한 metadata를 가져와야한다
     *
     *  Reflector
     *  getAllAndOverride()
     *
     **/
    const requiredRole = this.reflector.getAllAndOverride(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Roles Annotation이 등록 안되어있음,
    if (!requiredRole) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new UnauthorizedException(`Please give token`);
    }

    // 사용자의 역할이 annotation의 role과 같은지 체크
    if (user.role !== requiredRole) {
      throw new ForbiddenException(
        `you do not have permission to perform this operation. Need to ${requiredRole}`,
      );
    }
    return true;
  }
}
