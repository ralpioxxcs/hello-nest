import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import {
  ENV_DB_DATABASE,
  ENV_DB_PASSWORD,
  ENV_DB_USERNAME,
  ENV_NODE_ENV,
  ENV_SSH_TUNNEL_FORWARDED_PORT,
} from './common/const/env-keys.consts';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env[ENV_NODE_ENV] === 'local'
        ? `mongodb://127.0.0.1:${process.env[ENV_SSH_TUNNEL_FORWARDED_PORT]}`
        : `mongodb://127.0.0.1:27017`,
      {
        dbName: process.env[ENV_DB_DATABASE],
        authSource: process.env[ENV_DB_DATABASE],
        auth: {
          username: process.env[ENV_DB_USERNAME],
          password: process.env[ENV_DB_PASSWORD],
        },
        retryAttempts: 5,
        retryDelay: 500,
      },
    ),
    UsersModule,
    PostsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
