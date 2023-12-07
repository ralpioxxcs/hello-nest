import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RolesEnum } from '../const/roles.const';
import { PostsModel } from 'src/posts/entities/posts.entity';
import { BaseModel } from 'src/common/entity/base.entity';
import { IsEmail, IsString, Length } from 'class-validator';
import { lengthValidationMessage } from 'src/common/validation-message/length-validation.message';
import { stringValidationMessage } from 'src/common/validation-message/string-validation.message';
import { emailValidationMessage } from 'src/common/validation-message/email-valdation.message';
import { Exclude, Expose } from 'class-transformer';
import path from 'path';

@Entity()
@Exclude()
export class UsersModel extends BaseModel {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column({
    // 1. 최대길이 20
    length: 20,
    // 2. 유일무이한 값
    unique: true,
  })
  @IsString({
    message: stringValidationMessage,
  })
  @Length(3, 20, {
    message: lengthValidationMessage,
  })
  @Expose()
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
  @Expose()
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

  **/
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
}
