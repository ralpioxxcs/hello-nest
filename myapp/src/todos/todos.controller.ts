import { Controller, Logger } from '@nestjs/common';
import { TodosService } from './todos.service';
import { GrpcMethod } from '@nestjs/microservices';
import { Todo } from 'src/schemas/todo.schema';
import { TodoDto } from './dtos/todo.dto';
import { TodoItems } from './todos.interface';

@Controller()
export class TodosController {
  constructor(private readonly todoService: TodosService) {}

  private readonly logger = new Logger(TodosController.name);

  @GrpcMethod('TodoService', 'createTodo')
  async createTodo(dto: TodoDto): Promise<Todo> {
    this.logger.verbose(`creatoTodo (dto: ${JSON.stringify(dto)})`);

    return await this.todoService.createTodoItem(dto);
  }

  @GrpcMethod('TodoService', 'readTodos')
  async readTodos(): Promise<TodoItems> {
    this.logger.verbose(`readTodos`);

    const todos = await this.todoService.findAll();

    return {
      items: todos,
    };
  }
}
