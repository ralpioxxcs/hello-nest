import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from 'src/common/common.service';
import { CommentsModel } from './entity/comments.entity';
import { QueryRunner, Repository } from 'typeorm';
import { CreateCommentsDto } from './dto/create-comments.dto';
import { PaginateCommentsDto } from './dto/paginate-comments.dto';
import { DEFAULT_COMMENTS_FIND_OPTIONS } from './const/default-comments-find-options.const';
import { UsersModel } from 'src/users/entities/users.entity';
import { UpdateCommentsDto } from './dto/update-comments.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsModel)
    private readonly commentsRepository: Repository<CommentsModel>,
    private readonly commonService: CommonService,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<CommentsModel>(CommentsModel)
      : this.commentsRepository;
  }

  async paginateComments(dto: PaginateCommentsDto, postId: number) {
    return this.commonService.paginate(
      dto,
      this.commentsRepository,
      {
        ...DEFAULT_COMMENTS_FIND_OPTIONS,
        // 특정 포스트의 코멘트만 보이도록
        where: {
          post: {
            id: postId,
          },
        },
      },
      `posts/${postId}/comments`,
    );
  }

  async getCommentById(commentId: number) {
    const comment = await this.commentsRepository.findOne({
      ...DEFAULT_COMMENTS_FIND_OPTIONS,
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      throw new BadRequestException(`comment (id: ${commentId}) is not exists`);
    }

    return comment;
  }

  async createComment(
    commentDto: CreateCommentsDto,
    postId: number,
    author: UsersModel,
    qr?: QueryRunner,
  ) {
    const repository = this.getRepository(qr);

    return await repository.save({
      ...commentDto,
      post: {
        id: postId,
      },
      author,
    });
  }

  async updateComment(updateDto: UpdateCommentsDto, commentId: number) {
    const prevComment = await this.commentsRepository.preload({
      id: commentId,
      ...updateDto,
    });

    const newComment = await this.commentsRepository.save(prevComment);

    return newComment;
  }

  async deleteComment(commentId: number, qr?: QueryRunner) {
    const repository = this.getRepository(qr);
    const comment = await repository.findOne({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      throw new BadRequestException(`comment (id: ${commentId}) is not exists`);
    }

    await repository.delete(commentId);

    return commentId;
  }

  async isCommentMine(userId: number, commentId: number) {
    return this.commentsRepository.exist({
      where: {
        id: commentId,
        author: {
          id: userId,
        },
      },
      relations: {
        author: true,
      },
    });
  }
}
