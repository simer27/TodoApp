import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IndexTodoSwagger } from './swagger/index-todo.swagger';
import { CreateTodoSwagger } from './swagger/create-todo.swagger';
import { ShowTodoSwagger } from './swagger/show-todo.swagger';
import { UpdateTodoSwagger } from './swagger/update-todo.swagger';
import { BadRequestSwagger } from './helpers/swagger/bad-request.swagger';
import { NotFoundSwagger } from './helpers/swagger/not-found.swagger';

@Controller('api/v1/todo')
@ApiTags('Todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todas as tarefas existentes.' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tarefas retornada com sucesso.',
    type: IndexTodoSwagger,
    isArray: true,
  })
  async index() {
    return await this.todoService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Cria uma tarefa.' })
  @ApiResponse({
    status: 201,
    description: 'Tarefa criada com sucesso!',
    type: CreateTodoSwagger,
  })
  @ApiResponse({
    status: 400,
    description: 'Parametros inválidos.',
    type: BadRequestSwagger,
  })
  async create(@Body() body: CreateTodoDto) {
    return await this.todoService.create(body);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Busca uma única tarefa.' })
  @ApiResponse({
    status: 200,
    description: 'Dados da tarefa retornado com sucesso!',
    type: ShowTodoSwagger,
  })
  @ApiResponse({
    status: 404,
    description: 'Tarefa não foi encontrada.',
    type: NotFoundSwagger,
  })
  async show(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.todoService.findOneOrFail(id);
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Atualiza dados de uma única tarefa.' })
  @ApiResponse({
    status: 200,
    description: 'Tarefa atualizada com sucesso!',
    type: UpdateTodoSwagger,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos.',
    type: BadRequestSwagger,
  })
  @ApiResponse({
    status: 404,
    description: 'Tarefa não foi encontrada.',
    type: NotFoundSwagger,
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateTodoDto,
  ) {
    return await this.todoService.update(id, body);
  }

  @Delete('/:id')
  @ApiOperation({ summary: 'Remove uma única tarefa.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Tarefa removida com sucesso!' })
  @ApiResponse({
    status: 404,
    description: 'Tarefa não foi encontrada.',
    type: NotFoundSwagger,
  })
  async destroy(@Param('id', new ParseUUIDPipe()) id: string) {
    await this.todoService.deleteById(id);
  }
}
