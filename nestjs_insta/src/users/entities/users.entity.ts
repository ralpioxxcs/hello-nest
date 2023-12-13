import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostsModel } from 'src/posts/entities/posts.entity';
import { BaseModel } from 'src/common/entity/base.entity';
import { IsEmail, IsString, Length } from 'class-validator';
import { lengthValidationMessage } from 'src/common/validation-message/length-validation.message';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { emailValidationMessage } from 'src/common/validation-message/email-valdation.message';
import { Exclude, Expose } from 'class-transformer';
import path from 'path';
import { RolesEnum } from '../const/roles.const';
import { ChatsModel } from 'src/chats/entity/chats.entity';
import { MessagesModel } from 'src/chats/messages/entity/messages.entity';
import { CommentsModel } from 'src/posts/comments/entity/comments.entity';
import { UserFollowersModel } from './user-followers.entity';

@Entity()
export class UsersModel extends BaseModel {
  @Column({
    length: 20, // 1. 최대길이 20
    unique: true, // 2. 유일무이한 값
  })
  @IsString({
    message: stringValidationMessage,
  })
  @Length(3, 20, {
    message: lengthValidationMessage,
  })
  nickname: string;

  // 1. 유일무이한 값
  @Column({
    unique: true,
  })
  @IsString({
    message: stringValidationMessage,
  })
  @IsEmail(
    {},
    {
      message: emailValidationMessage,
    },
  )
  email: string;

  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  @Length(3, 8, {
    message: lengthValidationMessage,
  })
  /**
  *     [FE -> BE, request]
  *     plain object (JSON) -> class instance (DTO)
  *
  *     [BE -> FE, response]
  *     class instance(DTO) -> plain object (JSON)
  *
  *     toClassOnly -> class instance로 변환될때만, request
  *     toPlainOnly -> plain obejct로 변환될때만, response

  * */
  @Exclude({
    toPlainOnly: true,
  })
  password: string;

  @Column({
    enum: Object.values(RolesEnum),
    default: RolesEnum.USER,
  })
  @Expose()
  role: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author)
  @Expose()
  posts: PostsModel[];

  @ManyToMany(() => ChatsModel, (chat) => chat.users)
  @JoinTable()
  chats: ChatsModel[];

  @OneToMany(() => MessagesModel, (message) => message.author)
  messages: MessagesModel;

  @OneToMany(() => CommentsModel, (comment) => comment.author)
  comments: CommentsModel[];

  //
  // Follow
  //

  // 나를 팔로우하고 있는 사람
  @OneToMany(() => UserFollowersModel, (ufm) => ufm.follower)
  followers: UserFollowersModel[];

  // 내가 팔로우 하고있는 사람
  @OneToMany(() => UserFollowersModel, (ufm) => ufm.followee)
  followees: UserFollowersModel[];

  @Column({
    default: 0
  })
  followerCount: number;

  @Column({
    default: 0
  })
  followeeCount: number;
}
