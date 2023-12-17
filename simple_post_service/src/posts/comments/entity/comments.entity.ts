import { IsNumber, IsString } from 'class-validator';
import { BaseModel } from 'src/common/entity/base.entity';
import { PostsModel } from 'src/posts/entities/posts.entity';
import { UsersModel } from 'src/users/entities/users.entity';
import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';

@Entity()
export class CommentsModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.id)
  author: UsersModel;

  @ManyToOne(() => PostsModel, (post) => post.comments)
  post: PostsModel;

  @Column()
  @IsString()
  comment: string;

  @Column({
    default: 0,
  })
  @IsNumber()
  likeCount: number;
}
