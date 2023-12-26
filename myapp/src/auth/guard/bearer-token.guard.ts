import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class BearerTokenGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const rawToken = req.header('authorization');
    if (!rawToken) {
      throw new UnauthorizedException('empty authorization of header');
    }

    const token = this.authService.extractBearerTokenFromHeader(rawToken);
    const verified = this.authService.verifyJwtToken(token);

    const email = verified['email'];
    const authUser = await this.userService.getByEmail(email);

    req['user'] = authUser;
    req['token'] = token;
    req['token_type'] = verified.type;

    return true;
  }
}
