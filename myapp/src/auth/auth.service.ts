import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterUserDto } from './dtos/register-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user.schema';

import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import {
  ENV_HASH_ROUND_KEY,
  ENV_JWT_ISSUER,
  ENV_JWT_SECRET,
} from 'src/common/const/env-keys.consts';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  loginUser(user: Pick<User, '_id' | 'email' | 'nickname'>) {
    // Setting payload
    const accessToken = this.jwtService.sign(
      {
        iss: this.configService.get<string>(ENV_JWT_ISSUER),
        sub: user._id,
        email: user.email,
        nickname: user.nickname,
        type: 'access',
      },
      {
        secret: this.configService.get<string>(ENV_JWT_SECRET),
        expiresIn: 300,
      },
    );

    const refreshToken = this.jwtService.sign(
      {
        iss: this.configService.get<string>(ENV_JWT_ISSUER),
        sub: user._id,
        email: user.email,
        nickname: user.nickname,
        type: 'refresh',
      },
      {
        secret: this.configService.get<string>(ENV_JWT_SECRET),
        expiresIn: 3600,
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async registerByEmail(user: RegisterUserDto) {
    const hashed = await bcrypt.hash(
      user.password,
      parseInt(this.configService.get<string>(ENV_HASH_ROUND_KEY)),
    );

    console.log("first hashed: ",hashed);

    const newUser = await this.userService.createUser({
      ...user,
      password: hashed,
    });

    return this.loginUser(newUser);
  }

  async loginByEmail(user: Pick<User, 'email' | 'password'>) {
    //
    // 1. Check user existence and return user
    //
    const existsUser = await this.userService.getUserByEmail(user.email);
    if (!existsUser) {
      throw new UnauthorizedException('not exist user');
    }

    //
    // 2. Authenticate user with email, password
    //
    const passwordOk = await bcrypt.compare(user.password, existsUser.password);
    console.log(passwordOk);
    if (!passwordOk) {
      throw new UnauthorizedException('invalid password');
    }

    return this.loginUser(existsUser);
  }
}
