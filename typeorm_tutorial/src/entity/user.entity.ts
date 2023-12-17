import { Column, CreateDateColumn, Entity, Generated, JoinColumn, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn } from "typeorm";
import { ProfileModel } from "./profile.entity";
import { PostModel } from "./post.entity";

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
};

@Entity()
export class UserModel {
  // Primary Column은 모든 테이블에서 기본적으로 존재해야한다
  // 테이블 안에서각각의 Row를 구분할 수 있는 칼럼

  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  email: string;
  
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;
  
  // 데이터가 생성되는 날짜와 시간이 자동으로 기록
  @CreateDateColumn()
  createdAt: Date;

  // 데이터가 업데이트되는 날짜와 시간이 자동으로 기록
  @UpdateDateColumn()
  updatedAt: Date;
  
  // 업데이트 될 때마다 1씩 올라감 (save함수가 몇번)
  @VersionColumn()
  version: number;

  @Column()
  @Generated('uuid')
  additionalId: string;

  @OneToOne(() => ProfileModel, (profile) => profile.user, {
    // find() 실행 할때마다 항상 같이 가져올 relation
    eager: false,

    // 저장할 때 relation을 한번에 같이 저장가능
    cascade: true,

    // null이 가능한지
    nullable: true,

    // 관계가 삭제됐을때
    // no action -> 아무것도 안함
    // cascade -> 참조하는 Row도 같이 삭제
    // set null -> 참조하는 Row에서 참조 id를 null로 변경
    // set default -> 기본 세팅 설정 (table의 기본 세팅)
    // restrict -> 참조하고 있는 Row가 있는경우 참조당하는 Row삭제 불가
    onDelete: 'RESTRICT'
  })
  @JoinColumn()
  profile: ProfileModel;
  
  @OneToMany(() => PostModel, (post) => post.author)
  posts: PostModel[];

  @Column({
    default: 0,
  })
  count: number;
};
