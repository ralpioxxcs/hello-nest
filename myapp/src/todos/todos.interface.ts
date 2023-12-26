import { Todo } from 'src/schemas/todo.schema';
import { TodoDto } from './dtos/todo.dto';

export interface TodoItems {
  items: Todo[];
}

export interface TodoServiceInterface {
  createTodo(todo: TodoDto): Promise<Todo>;
  readTodos(): Promise<Todo[]>;
}
