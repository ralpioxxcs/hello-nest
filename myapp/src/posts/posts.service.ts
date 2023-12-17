import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from 'src/schemas/post.schema';
import { CreatePostDto } from './dtos/create-post.dto';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  async createPost(dto: CreatePostDto): Promise<Post> {
    console.debug(dto);
    const newPost = new this.postModel(dto);

    return await newPost.save();
  }

  async findAll(): Promise<Post[]> {
    return await this.postModel
      .find()
      .populate({
        path: 'author',
        select: {
          nickname: 1,
          email: 1,
        },
      })
      .exec();
  }

  async deletePost(id: string) {
    return await this.postModel.findByIdAndDelete(id);
  }
}
