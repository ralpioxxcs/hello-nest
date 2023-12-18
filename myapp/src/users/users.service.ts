import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(createUserDto: CreateUserDto) {
    const newUserDoc = await this.userModel.create(createUserDto);
    if (!newUserDoc) {
      throw new BadRequestException('');
    }
    return await newUserDoc.save();
  }

  async findAll(): Promise<User[]> {
    return await this.userModel.find().populate('posts').exec();
  }

  async getUserByEmail(email: string) {
    return await this.userModel.findOne({ email }).exec();
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
