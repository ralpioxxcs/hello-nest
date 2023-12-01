import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';

// interface PostModel {
//     id: number;
//     author: string;
//     title: string;
//     content: string;
//     likeCount: number;
//     commentCount: number;
// };

// let posts: PostModel[] = [
//     {
//         id: 1,
//         author: 'newjeans',
//         title: 'minji',
//         content: 'asdasd',
//         likeCount: 100000,
//         commentCount: 2323,
//     },
//     {
//         id: 2,
//         author: 'newjeans',
//         title: 'haerin',
//         content: 'asdbnlzx',
//         likeCount: 42552,
//         commentCount: 323,
//     },
//     {
//         id: 3,
//         author: 'blackpink',
//         title: 'roze',
//         content: 'kasddbnlzx',
//         likeCount: 62352,
//         commentCount: 9523,
//     },
// ]

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(PostsModel)
        private readonly postsRepository: Repository<PostsModel>
    ){}


    async getAllPosts() {
        return this.postsRepository.find();
    }

    async getPostById(id: number) {
        const post = await this.postsRepository.findOne({
            where: {
                id,
            },
        });

        if(!post) {
            throw new NotFoundException();
        }

        return post;
    }

    
    async createPost(author: string, title: string, content: string) {
        const post = this.postsRepository.create({
            author,
            title,
            content,
            likeCount: 0,
            commentCount: 0,
        });

        const newPost = await this.postsRepository.save(post);

        return newPost;
    }

    async updatePost(postId: number, author: string, title: string, content: string) {
        const post = await this.postsRepository.findOne({
            where: {
                id: postId
            }
        });

        if (!post) {
            throw new NotFoundException();
        }

        if(author) {
            post.author = author;
        }
        if(title) {
            post.title = title;
        }
        if(content) {
            post.content = content;
        }

        const newPost = await this.postsRepository.save(post);

        return newPost;
    }

    async deletePost(postId: number) {
        const post = await this.postsRepository.findOne({
            where: {
                id: postId
            }
        });

        if (!post) {
            throw new NotFoundException();
        }

        await this.postsRepository.delete(postId);

        return postId;
    }

}
