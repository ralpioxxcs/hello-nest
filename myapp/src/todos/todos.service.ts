import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo } from 'src/schemas/todo.schema';
import { TodoDto } from './dtos/todo.dto';

@Injectable()
export class TodosService {
  constructor(@InjectModel(Todo.name) private todoModel: Model<Todo>) {}

  async createTodoItem(dto: TodoDto): Promise<Todo> {
    const newTodo = await this.todoModel.create(dto);
    if (!newTodo) {
      throw new BadRequestException('');
    }
    return await newTodo.save();
  }

  async findAll(): Promise<Todo[]> {
    const todoItems = await this.todoModel.find().exec();
    if (!todoItems) {
      throw new NotFoundException('todo items not found');
    }
    return todoItems;
  }
}
