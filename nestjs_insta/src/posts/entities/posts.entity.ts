import { BaseModel } from "src/common/entity/base.entity";
import { UsersModel } from "src/users/entities/users.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class PostsModel extends BaseModel {
    @PrimaryGeneratedColumn()
    id: number;

    // 1) UsersModel과 연동 (Foreign Key)
    // 2) null 불가능
    @ManyToOne(() => UsersModel, (user)=> user.posts, {
      nullable: false,
    })
    author: UsersModel;

    @Column()
    title: string;

    @Column()
    content: string;

    @Column()
    likeCount: number;

    @Column()
    commentCount: number;
};
