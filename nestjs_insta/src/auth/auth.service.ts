import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersModel } from 'src/users/entities/users.entity';
import { HASH_ROUNDS, JWT_SECRET } from './const/auth.const';
import { UsersService } from 'src/users/users.service';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  /**
   *
   *  1) 사용자가 로그인 혹은 회원가입을 진행시
   *      accessToken, refreshToken을 발급받는다.
   *
   *  2) 로그인할때는 Basic 토큰과 함께 요청보낸다.
   *      'email:password'를 base64 인코딩한 형태
   *      (ex. {authorization: 'Basic {token}'}
   *
   *  3) 아무나 접근할 수 없는 정보 (private route)를 접근 할때는
   *     accessToken을 Header에 추가해서 요청과 보냄
   *     (ex. {authorization: 'Bearer {token}'}
   *
   *  4) 토큰과 요청을 받은 서버는 토큰검증을 통해 현재 요청을 보낸 사용자를 판별가능
   *     (ex. 현재 로그인한 사용자가 작성한 포스트만 가져오려면, 토큰내부의 sub값의 사용자의 포스트만 따로 필터링)
   *
   *  5) 모든 토큰은 만료 기간이 존재,
   *     만료기간이 지나면 새로 토큰을 발급받아야 함
   *     그렇지 않으면, 인증 실패
   *     accessToken을 새로 발급받을 수 있는 /auth/token/access
   *     refreshToken을 새로 발급 받을 수 있는 /auth/token/refresh
   *
   *  6) 토큰이 만료되면 각각의 토큰을 새로 발급 받을 수 있는 엔드포인트에 요청
   *     새로운토큰을 발급받고, private route 접근
   **/

  /**
   *  {authorization: 'Basic {token}'}
   *  {authorization: 'Bearer {token}'}
   *
   *  basic, bearer 구분하여 토큰값 추출
   *
   **/
  extractTokenFromHeader(header: string, isBearer: boolean) {
    // 'Basic {token}' -> ['Basic', '{token}']

    const splitToken = header.split(' ');

    const prefix = isBearer ? 'Bearer' : 'Basic';

    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      throw new UnauthorizedException('invalid token');
    }

    const token = splitToken[1];

    return token;
  }

  /**
   *    Basic rjaklevjs@jtsk2
   *
   *    1) rjaklevjs@jtsk2 -> email:password
   *    2) email:password -> [email, password]
   *    3) {email: email, password: password}
   *
   **/
  decodeBasicToken(base64String: string) {
    const decoded = Buffer.from(base64String, 'base64').toString('utf8');

    const splitBasic = decoded.split(':');
    if (splitBasic.length !== 2) {
      throw new UnauthorizedException('invalid token');
    }

    const email = splitBasic[0];
    const pw = splitBasic[1];

    return {
      email: email,
      password: pw,
    };
  }

  /**
   *  토큰 검증
   *
   */
  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: JWT_SECRET,
      });
    } catch (err) {
      throw new UnauthorizedException('token expired or invalid');
    }
  }

  /**
   *
   *
   **/
  rotateToken(token: string, isRefreshToken: boolean) {
    const decoded = this.jwtService.verify(token, {
      secret: JWT_SECRET,
    });

    /**
     *  sub: id
     *  email: email
     *  type: 'access' | 'refresh'
     *
     **/
    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException(
        'refreshing token only possible with refreshToken',
      );
    }

    return this.signToken({ ...decoded }, isRefreshToken);
  }

  /**
   * 1) registerWithEmail
   *    - email, nickname, password를 입력받고 사용자 생성
   *    - 생성완료시, accessToken, refreshToken 반환
   *     -> 회원가입 후 다시 로그인 -> 쓸데없는 과정 방지하기 위해
   *
   * 2) loginWithEmail
   *   - email, password를 입력하면 사용자 검증 진행
   *   - 검증이 완료되면, accessToken, refreshToken을반환
   *
   * 3) loginUser
   *   - (1), (2)에서 필요한 accessToken, refreshToken 을 반환
   *
   * 4) signToken
   *   - (3)에서 필요한 accessToken, refreshToken을 sign
   *
   * 5) authenticateWithEmailAndPassword
   *   - (2)에서 로그인을 진행할 때, 필요한 기본 검증
   *     1. 사용자가 존재하는지 (email)
   *     2. 비밀번호가 맞는지
   *     3. 모두 통과되면 찾은 사용자 정보 반환
   *     4. loginWithEmail에서 반환된 데이터를 기반으로 토큰 생성
   */

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Payload 정보
   *
   * 1) email
   * 2) sub -> id
   * 3) type: 'access' | 'refresh'
   */
  signToken(user: Pick<UsersModel, 'email' | 'id'>, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      sbu: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      expiresIn: isRefreshToken ? 3600 : 300,
    });
  }

  loginUser(user: Pick<UsersModel, 'email' | 'id'>) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  async authenticateWithEmailAndPassword(
    user: Pick<UsersModel, 'email' | 'password'>,
  ) {
    // 사용자가 존재하는 확인 (email)
    const existingUser = await this.usersService.getUserByEmail(user.email);

    if (!existingUser) {
      throw new UnauthorizedException('not exist user');
    }

    // 1. 입력된 비밀번호
    // 2. 기존 해시
    const passOk = await bcrypt.compare(user.password, existingUser.password);
    if (!passOk) {
      throw new UnauthorizedException('invalid password');
    }

    return existingUser;
  }

  async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    const existingUser = await this.authenticateWithEmailAndPassword(user);

    return this.loginUser(existingUser);
  }

  async registerWithEmail(
    user: Pick<UsersModel, 'nickname' | 'email' | 'password'>,
  ) {
    const hashed = await bcrypt.hash(
      user.password,
      HASH_ROUNDS, // https://www.npmjs.com/package/bcrypt#a-note-on-rounds
    );

    const newUser = await this.usersService.createUsers({
      ...user,
      password: hashed,
    });

    return this.loginUser(newUser);
  }
}
