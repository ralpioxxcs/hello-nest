import { BaseModel } from 'src/common/entity/base.entity';
import { UsersModel } from 'src/users/entities/users.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { IsString } from 'class-validator';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { ImageModel } from 'src/common/entity/image.entity';
import { CommentsModel } from '../comments/entity/comments.entity';

@Entity()
export class PostsModel extends BaseModel {
  @PrimaryGeneratedColumn()
  id: number;

  // 1) UsersModel과 연동 (Foreign Key)
  // 2) null 불가능
  @ManyToOne(() => UsersModel, (user) => user.posts, {
    nullable: false,
  })
  author: UsersModel;

  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  title: string;

  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  content: string;

  // @Column({
  //   nullable: true,
  // })
  // @Transform(({ value }) => value && `/${join(POST_PUBLIC_IMAGE_PATH, value)}`)
  // image: string;

  @OneToMany((type) => ImageModel, (image) => image.post)
  images: ImageModel[];
  @Column()
  likeCount: number;

  @Column()
  commentCount: number;

  @OneToMany(() => CommentsModel, (comment) => comment.post)
  comments: CommentsModel[];
}
