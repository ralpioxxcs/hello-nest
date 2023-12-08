import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 변환 작업 Ok 여부
      transformOptions: {
        enableImplicitConversion: true, // 자동으로 Type 변환 가능하게 해준다 (class-validator Annotaion을 통해)
      },
      whitelist: true, // validation이 적용되지않은 properties는 지워버림
      forbidNonWhitelisted: true, // validation이 적용되지않은 properties를 포함하여 요청시 error를 던짐
    }),
  );

  await app.listen(3000);
}
bootstrap();
