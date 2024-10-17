import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { TodoEntity } from './entity/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

const todoEntityList: TodoEntity[] = [
  new TodoEntity({ id: '1', task: 'task 1', isDone: 1 }),
  new TodoEntity({ id: '2', task: 'task 2', isDone: 0 }),
  new TodoEntity({ id: '3', task: 'task 3', isDone: 1 }),
];

const newTodoEntity = new TodoEntity({ task: 'teste', isDone: 1 });

const updatedTodoEntity = new TodoEntity({ task: 'task 1', isDone: 1 });

describe('TodoController', () => {
  let todoController: TodoController;
  let todoService: TodoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useValue: {
            findAll: jest.fn().mockResolvedValue(todoEntityList),
            create: jest.fn().mockResolvedValue(newTodoEntity),
            findOneOrFail: jest.fn().mockResolvedValue(todoEntityList[0]),
            update: jest.fn().mockResolvedValue(updatedTodoEntity),
            deleteById: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    todoController = module.get<TodoController>(TodoController);
    todoService = module.get<TodoService>(TodoService);
  });

  it('should be defined', () => {
    expect(todoController).toBeDefined();
    expect(todoService).toBeDefined();
  });

  describe('index', () => {
    it('Deve retorna uma lista de tarefas com sucesso!', async () => {
      //Act(Ação do teste)
      const result = await todoController.index();

      //Assert(O resultado esperado)
      // 3 tipos esperados
      expect(result).toEqual(todoEntityList); // tipo 1
      expect(typeof result).toEqual('object'); // tipo 2
      expect(result[0].id).toEqual(todoEntityList[0].id); // tipo 3: é uma validação por posição dentro do array
      expect(todoService.findAll).toHaveBeenCalledTimes(1); // validar que fez a chamada pelo menos uma vez
    });

    it('Deve lançar uma exceção.', () => {
      // Arrange(Arranjo)
      jest.spyOn(todoService, 'findAll').mockRejectedValueOnce(new Error());

      //Assert(O resultado esperado)
      expect(todoController.index()).rejects.toThrowError();
    });
  });

  describe('create', () => {
    it('Deve criar uma nova tarefa com sucesso.', async () => {
      // Arrange
      const body: CreateTodoDto = {
        task: 'teste',
        isDone: 1,
      };

      //Act
      const result = await todoController.create(body);

      //Assert
      expect(result).toEqual(newTodoEntity); //retorno base
      expect(todoService.create).toHaveBeenCalledTimes(1); //espera que seja feito uma chamada
      expect(todoService.create).toHaveBeenCalledWith(body);
    });

    it('Deve lançar uma exceção', () => {
      const body: CreateTodoDto = {
        task: 'teste',
        isDone: 1,
      };

      //Arrange
      jest.spyOn(todoService, 'create').mockRejectedValueOnce(new Error());

      //Assert
      expect(todoController.create(body)).rejects.toThrowError();
    });
  });

  describe('show', () => {
    it('Deve trazer apena uma tarefa com sucesso.', async () => {
      //Act
      const result = await todoController.show('1');

      //Assert
      expect(result).toEqual(todoEntityList[0]);
      expect(todoService.findOneOrFail).toHaveBeenCalledTimes(1); //espera que seja feito uma chamada
      expect(todoService.findOneOrFail).toHaveBeenCalledWith('1');
    });

    it('Deve lançar uma exceção', () => {
      const body: CreateTodoDto = {
        task: 'teste',
        isDone: 1,
      };

      //Arrange
      jest
        .spyOn(todoService, 'findOneOrFail')
        .mockRejectedValueOnce(new Error());

      //Assert
      expect(todoController.show('1')).rejects.toThrowError();
    });
  });

  describe('update', () => {
    it('Deve realizar a atualização de dados de uma tarefa com sucesso.', async () => {
      //Arrange
      const body: UpdateTodoDto = {
        task: 'task 1',
        isDone: 0,
      };

      //Act
      const result = await todoController.update('1', body);

      //Assert
      expect(result).toEqual(updatedTodoEntity);
      expect(todoService.update).toHaveBeenCalledTimes(1);
      expect(todoService.update).toHaveBeenCalledWith('1', body);
    });

    it('Deve lançar uma exceção', () => {
      const body: UpdateTodoDto = {
        task: 'teste',
        isDone: 1,
      };

      //Arrange
      jest.spyOn(todoService, 'update').mockRejectedValueOnce(new Error());

      //Assert
      expect(todoController.update('1', body)).rejects.toThrowError();
    });
  });

  describe('destroy', () => {
    it('Deve deletar um tarefa com sucesso', async () => {
      //Act
      const result = await todoController.destroy('1');

      //Assert
      expect(result).toBeUndefined();
    });

    it('Deve lançar uma exceção', () => {
      //Arrange
      jest.spyOn(todoService, 'deleteById').mockRejectedValueOnce(new Error());

      //Assert
      expect(todoController.destroy('1')).rejects.toThrowError();
    });
  });
});
