import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class BasicTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const rawToken = req.header('authorization');
    if (!rawToken) {
      throw new UnauthorizedException('empty authorization of header');
    }

    const basicToken = this.authService.extractBasicTokenFromHeader(rawToken);
    const { email, password } = this.authService.decodeBasicToken(basicToken);

    const authUser = await this.authService.authenticateUserWithBasic(
      email,
      password,
    );

    req.user = authUser;

    return true;
  }
}
