import {
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from './dtos/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('token/access')
  postTokenAccess() {}

  @ApiOperation({ summary: 'Login account by email' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Post('login/email')
  postLoginByEmail(@Headers('authorization') rawToken: string) {
    //
    // [Basic authorization]
    // => "Basic asd124123412fa%9"
    //
    const split = rawToken.split(' ');
    if (split.length !== 2 || split[0] !== 'Basic') {
      throw new UnauthorizedException('invalid token');
    }
    const token = split[1];

    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const splitBasic = decoded.split(':');
    if (splitBasic.length !== 2) {
      throw new UnauthorizedException('invalid token');
    }

    const credentials = {
      email: splitBasic[0],
      password: splitBasic[1],
    };

    return this.authService.loginByEmail(credentials);
  }

  @Post('register/email')
  postRegisterByEmail(@Body() body: RegisterUserDto) {
    return this.authService.registerByEmail(body);
  }
}
