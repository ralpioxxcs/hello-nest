import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as ts from 'tunnel-ssh';
import {
    ENV_NODE_ENV,
  ENV_SSH_TUNNEL_FORWARDED_PORT,
  ENV_SSH_TUNNEL_SERVER_HOST,
  ENV_SSH_TUNNEL_SERVER_PASSWORD,
  ENV_SSH_TUNNEL_SERVER_PORT,
  ENV_SSH_TUNNEL_SERVER_USERNAME,
} from './common/const/env-keys.consts';

async function bootstrap() {
  if (process.env[ENV_NODE_ENV] === 'local') {
    // ssh tunneling
    try {
      await ts.createTunnel(
        // tunnel options
        {
          autoClose: true,
        },
        // server options
        {},
        // ssh options
        {
          host: process.env[ENV_SSH_TUNNEL_SERVER_HOST],
          port: process.env[ENV_SSH_TUNNEL_SERVER_PORT],
          username: process.env[ENV_SSH_TUNNEL_SERVER_USERNAME],
          password: process.env[ENV_SSH_TUNNEL_SERVER_PASSWORD],
        },
        // forward options
        {
          dstAddr: '127.0.0.1',
          dstPort: parseInt(process.env[ENV_SSH_TUNNEL_FORWARDED_PORT]),
        },
      );
    } catch (error) {
      console.error(error);
    }
  }

  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('My App')
    .setDescription('My app API description')
    .setVersion('2.0')
    .addTag('tags')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
