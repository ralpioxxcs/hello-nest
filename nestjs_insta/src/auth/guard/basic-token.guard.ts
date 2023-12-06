import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

/**
 *  1) 요청객체를 불러오고 authorization header로부터 토큰을 가져온다
 *
 *  2) authService.extractTokenFromHeader를 이용해서 사용할 수 있는 형태의 토큰을 추출
 *
 *  3) authService.decodeBasicToken을 이용해서 email, password를 추출
 *
 *  4) email, password를 이용해서 사용자를 가져온다
 *     authService.authenticateWithEmailAndPassword
 *
 *  5) 찾아낸 사용자를 (1) 요청 객체에 붙여준다
 *     req.user = user;
 *
 **/

@Injectable()
export class BasicTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const rawToken = req.header('authorization');
    if (!rawToken) {
      throw new UnauthorizedException('empty token');
    }

    const token = this.authService.extractTokenFromHeader(rawToken, false);

    const { email, password } = this.authService.decodeBasicToken(token);

    const user = await this.authService.authenticateWithEmailAndPassword({
      email,
      password,
    });

    req.uesr = user;

    return true;
  }
}
