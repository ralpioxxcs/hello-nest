import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { warn } from 'console';
import { Observable, map, tap } from 'rxjs';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    // 요청이 들어왔을때의 타임스탬프를 기록
    // [REQ] {요청 path} {요청 시간}
    //
    // 요청이 끝날때, 타임스탬프 기록
    // [RES] {요청 path} {응답 시간} {elapsed ms}
    const now = new Date();
    const req = context.switchToHttp().getRequest();

    // ex. /common/image
    const path = req.originalUrl;

    console.log(`[REQ] ${path} ${now.toLocaleString('kr')}`);

    // return next.handle()을 실행하는 순간 router의 로직이 실행되고 응답이 반환됨
    // tap -> 응답 모니터링 가능
    // map -> response를 변경 가능
    return next.handle().pipe(
      tap((observable) => {
        // [RES] {요청 path} {응답 시간} {elapsed ms}
        console.log(
          `[RES] ${path} ${new Date().toLocaleString('kr')} elapsed: ${
            new Date().getMilliseconds() - now.getMilliseconds()
          }ms`,
        );
      }),
      /*
      map((observable) => {
        return {
          message: 'response changed',
          response: observable,
        };
      }),
      tap((observable)=> {
        console.log(observable);
      })
      */
    );
  }
}
