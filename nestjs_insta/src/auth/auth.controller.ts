import { Body, Controller, Post, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MaxLengthPipe, MinLengthPipe, PasswordPipe } from './pipe/password.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  @Post('token/access')
  postTokenAccess(
    @Headers('authorization') rawToken: string,
  ) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);

    const newToken = this.authService.rotateToken(token, false);

    return {
      accessToken: newToken,
    }
  }

  @Post('token/refresh')
  postTokenRefresh(
    @Headers('authorization') rawToken: string,
  ) {
    const token = this.authService.extractTokenFromHeader(rawToken, true);

    const newToken = this.authService.rotateToken(token, true);

    return {
      refreshToken: newToken,
    }
  }

  @Post('login/email')
  postLoginEmail(
    @Headers('authorization') rawToken: string,
  ) {
    // email:password (base64)
    const token = this.authService.extractTokenFromHeader(rawToken, false);

    const credential = this.authService.decodeBasicToken(token);

    return this.authService.loginWithEmail(credential);
  }

  @Post('register/email')
  postRegisterEmail(
    @Body('nickname') nickname: string,
    @Body('email') email: string,
    @Body('password', new MaxLengthPipe(8, 'password'), new MinLengthPipe(3, 'password')) password: string) {
    return this.authService.registerWithEmail({
      nickname,
      email,
      password,
    });

  }
}
