import { Test, TestingModule } from '@nestjs/testing';
import { TodoService } from './todo.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TodoEntity } from './entity/todo.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

const todoEntityList = [
  new TodoEntity({ task: 'task-1', isDone: 0 }),
  new TodoEntity({ task: 'task-2', isDone: 0 }),
  new TodoEntity({ task: 'task-3', isDone: 0 }),
];

const updateTodoEntityItem = new TodoEntity({ task: 'task-1', isDone: 1 });

describe('TodoService', () => {
  let todoService: TodoService;
  let todoRepository: Repository<TodoEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: getRepositoryToken(TodoEntity),
          useValue: {
            find: jest.fn().mockResolvedValue(todoEntityList),
            findOneOrFail: jest.fn().mockResolvedValue(todoEntityList[0]),
            create: jest.fn().mockReturnValue(todoEntityList[0]),
            merge: jest.fn().mockReturnValue(updateTodoEntityItem),
            save: jest.fn().mockResolvedValue(todoEntityList[0]),
            softDelete: jest.fn().mockReturnValue(undefined),
          },
        },
      ],
    }).compile();

    todoService = module.get<TodoService>(TodoService);
    todoRepository = module.get<Repository<TodoEntity>>(
      getRepositoryToken(TodoEntity),
    );
  });

  it('should be defined', () => {
    expect(todoService).toBeDefined();
    expect(todoRepository).toBeDefined();
  });

  describe('findAll', () => {
    it('Deve retornar uma lista de tarefas com sucesso.', async () => {
      //Act
      const result = await todoService.findAll();

      //Assert
      expect(result).toEqual(todoEntityList);
      expect(typeof result).toEqual('object');
      expect(result[0].id).toEqual(todoEntityList[0].id);
      expect(todoRepository.find).toHaveBeenCalledTimes(1);
    });

    it('Deve lançar uma exceção.', () => {
      //Arrange
      jest.spyOn(todoRepository, 'find').mockRejectedValueOnce(new Error());

      //Assert
      expect(todoService.findAll()).rejects.toThrowError();
    });
  });

  describe('findOneOrFail', () => {
    it('Deve retornar uma única tarefa com sucesso.', async () => {
      //Act
      const result = await todoService.findOneOrFail('1');

      //Assert
      expect(result).toEqual(todoEntityList[0]);
      expect(todoRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    });

    it('Deve lançar uma exceção.', () => {
      //Arrange
      jest
        .spyOn(todoRepository, 'findOneOrFail')
        .mockRejectedValueOnce(new Error());

      //Assert
      expect(todoService.findOneOrFail('1')).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('Deve criar uma tarefa com sucesso.', async () => {
      const data: CreateTodoDto = {
        task: 'task-1',
        isDone: 0,
      };

      //Act
      const result = await todoService.create(data);

      //Assert
      expect(result).toEqual(todoEntityList[0]);
      expect(todoRepository.create).toHaveBeenCalledTimes(1);
      expect(todoRepository.save).toHaveBeenCalledTimes(1);
    });

    it('Deve lançar uma exceção.', () => {
      const data: CreateTodoDto = {
        task: 'task-1',
        isDone: 0,
      };

      //Arrange
      jest.spyOn(todoRepository, 'save').mockRejectedValueOnce(new Error());

      //Assert
      expect(todoService.create).rejects.toThrowError();
    });
  });

  describe('upadate', () => {
    it('Deve atualizar dados de uma tarefa com sucesso.', async () => {
      //Arrange
      const data: UpdateTodoDto = {
        task: 'task-1',
        isDone: 1,
      };

      jest
        .spyOn(todoRepository, 'save')
        .mockResolvedValueOnce(updateTodoEntityItem);

      //ACt
      const result = await todoService.update('1', data);

      //Assert
      expect(result).toEqual(updateTodoEntityItem);
    });

    it('Deve lançar uma exceção não encontrada.', () => {
      const data: UpdateTodoDto = {
        task: 'task-1',
        isDone: 1,
      };

      //Arrange
      jest
        .spyOn(todoRepository, 'findOneOrFail')
        .mockRejectedValueOnce(new Error());

      //Assert
      expect(todoService.update('1', data)).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('Deve lançar uma exceção.', () => {
      const data: UpdateTodoDto = {
        task: 'task-1',
        isDone: 1,
      };

      //Arrange
      jest.spyOn(todoRepository, 'save').mockRejectedValueOnce(new Error());

      //Assert
      expect(todoService.update('1', data)).rejects.toThrowError();
    });
  });

  describe('deleteById', () => {
    it('Deve remover uma tarefa com sucesso.', async () => {
      //Act
      const result = await todoService.deleteById('1');

      //Assert
      expect(result).toBeUndefined();
      expect(todoRepository.findOneOrFail).toHaveBeenCalledTimes(1);
      expect(todoRepository.softDelete).toHaveBeenCalledTimes(1);
    });

    it('Deve lançar uma exceção não encontrada', () => {
      //Arrange
      jest
        .spyOn(todoRepository, 'findOneOrFail')
        .mockRejectedValueOnce(new Error());

      //Assert
      expect(todoService.deleteById('1')).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('Deve lançar uma exceção', () => {
      //Arrange
      jest
        .spyOn(todoRepository, 'softDelete')
        .mockRejectedValueOnce(new Error());

      //Assert
      expect(todoService.deleteById('1')).rejects.toThrowError();
    });
  });
});
