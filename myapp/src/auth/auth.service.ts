import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { RegisterUserDto } from './dtos/register-user.dto';
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
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  extractBasicTokenFromHeader(header: string): string {
    // {authorization: 'Basic {token}'}
    const splitToken = header.split(' ');
    if (splitToken.length !== 2 || splitToken[0] !== 'Basic') {
      throw new UnauthorizedException('invalid token');
    }

    this.logger.verbose(`raw token: ${splitToken}`);

    const token = splitToken[1];

    return token;
  }

  extractBearerTokenFromHeader(header: string): string {
    // {authorization: 'Bearer {token}'}
    const splitToken = header.split(' ');
    if (splitToken.length !== 2 || splitToken[0] !== 'Bearer') {
      throw new UnauthorizedException();
    }
    const token = splitToken[1];

    return token;
  }

  decodeBasicToken(token: string): { [key: string]: string } {
    //
    // base64 encoded string token -> "decoding" -> 'email:password'
    //
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const splitToken = decoded.split(':');
    if (splitToken.length !== 2) {
      throw new UnauthorizedException();
    }

    this.logger.verbose(`decode token: ${splitToken}`);

    return {
      email: splitToken[0],
      password: splitToken[1],
    };
  }

  verifyJwtToken(token: string): JwtPayload {
    try {
      const result = this.jwtService.verify(token, {
        secret: this.configService.get<string>(ENV_JWT_SECRET),
      });

      console.log(result);
      this.logger.verbose(`verify result: ${JSON.stringify(result)}`);

      return result;
    } catch (err) {
      throw new UnauthorizedException(`token expired or invalid (err: ${err})`);
    }
  }

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
    //
    // 1. password 암호화 및 유저 생성
    // 2. 생성된 유저로 로그인
    //
    const hashed = await bcrypt.hash(
      user.password,
      parseInt(this.configService.get<string>(ENV_HASH_ROUND_KEY)),
    );

    const newUser = await this.usersService.create({
      ...user,
      password: hashed,
    });

    return this.loginUser(newUser);
  }

  // async loginByEmail(user: Pick<User, 'email' | 'password'>) {
  //   const authUser = await this.authenticateUserWithBasic(
  //     user.email,
  //     user.password,
  //   );
  //   return this.loginUser(authUser);
  // }

  async authenticateUserWithBasic(email: string, password: string) {
    //
    // 1. 유저 유무 확인
    //
    const existsUser = await this.usersService.getByEmail(email);
    if (!existsUser) {
      throw new UnauthorizedException('not exist user');
    }

    //
    // 2. 패스워드 검증
    //
    const passwordOk = await bcrypt.compare(password, existsUser.password);
    if (!passwordOk) {
      throw new UnauthorizedException('invalid password');
    }

    return existsUser;
  }
}
