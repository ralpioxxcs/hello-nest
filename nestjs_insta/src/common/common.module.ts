import { BadRequestException, Module } from '@nestjs/common';
import { extname } from 'path';
import * as multer from 'multer';
import { POST_IMAGE_PATH, TEMP_FOLDER_PATH } from 'src/common/const/path.const';
import { v4 as uuid } from 'uuid';
import { MulterModule } from '@nestjs/platform-express';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { CommonController } from './common.controller';
import { CommonService } from './common.service';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MulterModule.register({
      limits: {
        fileSize: 10000000, // byte
      },
      fileFilter: (req, file, callback) => {
        // callback
        // 1번째 파라미터에는 에러가 있을경우 에러 정보를 넣어준다
        // 2번째 파라미터는 파일을 받을지 말지 boolean을 넣어준다

        const ext = extname(file.originalname);
        if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
          return callback(
            new BadRequestException('you can upload only jpg/jpeg/png file.'),
            false,
          );
        }
        return callback(null, true);
      },
      storage: multer.diskStorage({
        destination(req, res, callback) {
          callback(null, TEMP_FOLDER_PATH);
        },
        filename(req, file, callback) {
          callback(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
