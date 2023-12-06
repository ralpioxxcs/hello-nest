import { BaseModel } from 'src/common/entity/base.entity';
import { UsersModel } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { IsString } from 'class-validator';

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
    message: 'content must be string type',
  })
  title: string;

  @Column()
  @IsString({
    message: 'content must be string type',
  })
  content: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;
}
