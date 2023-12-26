import {
  Body,
  Controller,
  Logger,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/register-user.dto';
import { BasicTokenGuard } from './guard/basic-token.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  @Post('token/access')
  postTokenAccess() {}

  @ApiOperation({ summary: 'Login account by email' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @Post('login/email')
  @UseGuards(BasicTokenGuard)
  async postLoginByEmail(@Request() req: Request) {
    return await this.authService.loginUser(req['user']);
  }

  @Post('register/email')
  postRegisterByEmail(@Body() body: RegisterUserDto) {
    return this.authService.registerByEmail(body);
  }
}
