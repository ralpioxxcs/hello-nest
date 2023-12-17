import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return await createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return await this.userModel.find().populate('posts').exec();
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    try {
      const updateUser = await this.userModel.findByIdAndUpdate(id, dto, {
        new: true,
      });
      if (!updateUser) {
        throw new BadRequestException(`not exists`);
      }

      return updateUser;
    } catch (err) {
      throw new BadRequestException(`not exists ${err}`);
    }
  }

  async deleteUser(id: string) {
    try {
      const deletedUser = await this.userModel.findByIdAndDelete(id);
      if (!deletedUser) {
        throw new BadRequestException(`not exists`);
      }
      return true;
    } catch (err) {
      throw new BadRequestException(`not exists ${err}`);
    }
  }
}
