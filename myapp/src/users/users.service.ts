import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(userData: CreateUserDto) {
    const newUser = await this.userModel.create(userData);
    return await newUser.save();
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    try {
      const updateUser = await this.userModel.findByIdAndUpdate(id, dto, {
        new: true,
      });
      if (!updateUser) {
        throw new NotFoundException();
      }

      return updateUser;
    } catch (err) {
      throw err;
    }
  }

  async delete(id: string) {
    try {
      const deleteUser = await this.userModel.findByIdAndDelete(id);
      if (!deleteUser) {
        throw new NotFoundException();
      }
      return true;
    } catch (err) {
      throw err;
    }
  }

  async getById(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async getByEmail(email: string) {
    const user = await this.userModel.findOne({ email: email }).exec();
    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }
}
