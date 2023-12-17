import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { promises } from 'fs';
import { basename, join } from 'path';
import { POST_IMAGE_PATH, TEMP_FOLDER_PATH } from 'src/common/const/path.const';
import { ImageModel } from 'src/common/entity/image.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreatePostImageDto } from './dto/create-image.dto';

@Injectable()
export class PostImagesService {
  constructor(
    @InjectRepository(ImageModel)
    private readonly imageRepository: Repository<ImageModel>,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<ImageModel>(ImageModel)
      : this.imageRepository;
  }

  async createPostImage(dto: CreatePostImageDto, qr?: QueryRunner) {
    const repo = this.getRepository(qr);

    // dto의 이미지 이름기반으로 파일 경로를 생성
    const tempFilePath = join(TEMP_FOLDER_PATH, dto.path);

    try {
      // 파일이 존재하는지 확인,
      // -> 없으면 error 던짐
      await promises.access(tempFilePath);
    } catch (err) {
      throw new BadRequestException('not exists file');
    }

    // 파일의 이름만 가져온다
    // /Users/aaa/bbb/ccc/asdf.png -> "asdf.png"
    const fileName = basename(tempFilePath);

    // 새로 이동할 post 폴더의 경로 + 이미지 파일 이름
    // {project root}/public/posts/asdf.png
    const newPath = join(POST_IMAGE_PATH, fileName);

    // save
    const result = await repo.save({
      ...dto,
    });

    console.debug('result: ', result);
    console.debug('tempFilePath: ', tempFilePath);
    console.debug('newPath: ', newPath);

    // 파일 옮기기
    await promises.rename(tempFilePath, newPath);

    return result;
  }
}
