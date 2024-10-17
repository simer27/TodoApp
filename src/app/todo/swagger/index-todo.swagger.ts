import { OmitType } from '@nestjs/swagger';
import { TodoEntity } from '../entity/todo.entity';

export class IndexTodoSwagger extends TodoEntity {}

/*//O MODELO ABAIXO É PARA OMITIR NA RESPONSE DA DOCUMENTAÇÃO UM OU MAIS ATRIBUTOS DA ENTIDADE.

 export class IndexTodoSwagger extends OmitType(TodoEntity, [
   'createdAt',
   'updatedAt',
   'deletedAt',
 ]) {}*/
